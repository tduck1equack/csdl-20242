import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";
import bcrypt from "bcrypt";
import { requireAdmin } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const authUser = requireAdmin(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;
    const body = await request.json();
    const { name, email, password, role, membershipStatus } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    interface UpdateData {
      name?: string;
      email?: string;
      role?: "USER" | "LIBRARIAN" | "ADMIN";
      membershipStatus?: "ACTIVE" | "SUSPENDED" | "EXPIRED";
      password?: string;
    }

    const updateData: UpdateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (membershipStatus) updateData.membershipStatus = membershipStatus;

    // Hash new password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Check if email is being changed and if it conflicts with existing user
    if (email && email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        membershipStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        ...updatedUser,
        memberSince: updatedUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const authUser = requireAdmin(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (userId === authUser.userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user has active borrowings
    const activeBorrowings = await prisma.borrowing.findMany({
      where: {
        userId: userId,
        status: "BORROWED",
      },
    });

    if (activeBorrowings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with active borrowings" },
        { status: 400 }
      );
    }

    // Check if user has unpaid fines
    const unpaidFines = await prisma.fine.findMany({
      where: {
        borrowing: {
          userId: userId,
        },
        status: "UNPAID",
      },
    });

    if (unpaidFines.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with unpaid fines" },
        { status: 400 }
      );
    }

    // Delete user and related data
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId: userId },
      });

      // Delete reservations
      await tx.reservation.deleteMany({
        where: { userId: userId },
      });

      // Delete fines (should be paid or waived at this point)
      await tx.fine.deleteMany({
        where: {
          borrowing: {
            userId: userId,
          },
        },
      });

      // Delete borrowings (should be returned at this point)
      await tx.borrowing.deleteMany({
        where: { userId: userId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
