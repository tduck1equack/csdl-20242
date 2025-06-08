import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: userId,
    };

    if (status) {
      whereClause.status = status;
    }

    const borrowings = await prisma.borrowing.findMany({
      where: whereClause,
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
      orderBy: [{ borrowDate: "desc" }, { id: "asc" }],
      skip,
      take: limit,
    });

    const total = await prisma.borrowing.count({
      where: whereClause,
    });

    return NextResponse.json({
      borrowings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, bookId } = await request.json();

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: "User ID and Book ID are required" },
        { status: 400 }
      );
    }

    // Check if book is available
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: "Book is not available for borrowing" },
        { status: 400 }
      );
    }

    // Check if user already has this book borrowed
    const existingBorrowing = await prisma.borrowing.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
        status: "BORROWED",
      },
    });

    if (existingBorrowing) {
      return NextResponse.json(
        { error: "You already have this book borrowed" },
        { status: 400 }
      );
    }

    // Create borrowing and update book availability
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks borrowing period

    const borrowing = await prisma.$transaction(async (tx) => {
      // Create borrowing record
      const newBorrowing = await tx.borrowing.create({
        data: {
          userId: userId,
          bookId: bookId,
          dueDate: dueDate,
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
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: userId,
          title: "Book Borrowed Successfully",
          message: `You have successfully borrowed "${
            book.title
          }". Due date: ${dueDate.toLocaleDateString()}`,
          type: "GENERAL",
          actionUrl: `/dashboard`,
        },
      });

      return newBorrowing;
    });

    return NextResponse.json(borrowing, { status: 201 });
  } catch (error) {
    console.error("Error creating borrowing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
