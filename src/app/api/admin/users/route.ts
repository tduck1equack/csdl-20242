import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";
import bcrypt from "bcrypt";
import { requireAdmin } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    interface WhereClause {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
      role?: "USER" | "LIBRARIAN" | "ADMIN";
      membershipStatus?: "ACTIVE" | "SUSPENDED" | "EXPIRED";
    }

    const where: WhereClause = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && role !== "all") {
      where.role = role as "USER" | "LIBRARIAN" | "ADMIN";
    }

    if (status && status !== "all") {
      where.membershipStatus = status as "ACTIVE" | "SUSPENDED" | "EXPIRED";
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        membershipStatus: true,
        createdAt: true,
        _count: {
          select: {
            borrowings: true,
            fines: true,
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formattedUsers = users.map((user) => ({
      ...user,
      memberSince: user.createdAt.toISOString(),
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authUser = requireAdmin(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role, membershipStatus } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        membershipStatus: membershipStatus || "ACTIVE",
      },
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
      message: "User created successfully",
      user: {
        ...user,
        memberSince: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
