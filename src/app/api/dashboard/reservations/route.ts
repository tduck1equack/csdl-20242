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

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverImage: true,
            availableCopies: true,
          },
        },
      },
      orderBy: [{ reservationDate: "desc" }, { id: "asc" }],
      skip,
      take: limit,
    });

    const total = await prisma.reservation.count({
      where: whereClause,
    });

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
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

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if user already has this book reserved
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
        status: {
          in: ["PENDING", "READY"],
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "You already have a reservation for this book" },
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

    // Set expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservation.create({
        data: {
          userId: userId,
          bookId: bookId,
          expiryDate: expiryDate,
          status: book.availableCopies > 0 ? "READY" : "PENDING",
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
      const notificationMessage =
        book.availableCopies > 0
          ? `Your reservation for "${book.title}" is ready for pickup!`
          : `Your reservation for "${book.title}" has been placed. You will be notified when it becomes available.`;

      await tx.notification.create({
        data: {
          userId: userId,
          title: "Reservation Created",
          message: notificationMessage,
          type: book.availableCopies > 0 ? "RESERVATION_READY" : "GENERAL",
          actionUrl: `/dashboard`,
        },
      });

      return newReservation;
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
