import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const borrowingId = params.id;
    const { action } = await request.json();

    if (!borrowingId) {
      return NextResponse.json(
        { error: "Borrowing ID is required" },
        { status: 400 }
      );
    }

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        book: true,
        user: true,
      },
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    if (action === "renew") {
      // Check if renewal is allowed (max 2 renewals)
      if (borrowing.renewalCount >= 2) {
        return NextResponse.json(
          { error: "Maximum renewals exceeded" },
          { status: 400 }
        );
      }

      // Check if book is not overdue
      if (borrowing.dueDate < new Date() && borrowing.status !== "OVERDUE") {
        await prisma.borrowing.update({
          where: { id: borrowingId },
          data: { status: "OVERDUE" },
        });

        return NextResponse.json(
          { error: "Cannot renew overdue book" },
          { status: 400 }
        );
      }

      // Extend due date by 2 weeks
      const newDueDate = new Date(borrowing.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 14);

      const updatedBorrowing = await prisma.$transaction(async (tx) => {
        const renewed = await tx.borrowing.update({
          where: { id: borrowingId },
          data: {
            dueDate: newDueDate,
            renewalCount: {
              increment: 1,
            },
          },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true,
                coverImage: true,
              },
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: borrowing.userId,
            title: "Book Renewed Successfully",
            message: `"${
              borrowing.book.title
            }" has been renewed. New due date: ${newDueDate.toLocaleDateString()}`,
            type: "RENEWAL_SUCCESS",
            actionUrl: `/dashboard`,
          },
        });

        return renewed;
      });

      return NextResponse.json(updatedBorrowing);
    } else if (action === "return") {
      const returnedBorrowing = await prisma.$transaction(async (tx) => {
        const returned = await tx.borrowing.update({
          where: { id: borrowingId },
          data: {
            status: "RETURNED",
            returnDate: new Date(),
          },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true,
                coverImage: true,
              },
            },
          },
        });

        // Update book availability
        await tx.book.update({
          where: { id: borrowing.bookId },
          data: {
            availableCopies: {
              increment: 1,
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: borrowing.userId,
            title: "Book Returned Successfully",
            message: `"${borrowing.book.title}" has been returned successfully.`,
            type: "BOOK_RETURNED",
            actionUrl: `/dashboard`,
          },
        });

        return returned;
      });

      return NextResponse.json(returnedBorrowing);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating borrowing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
