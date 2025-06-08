import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id;
    const { action } = await request.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        book: true,
        user: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (action === "claim") {
      if (reservation.status !== "READY") {
        return NextResponse.json(
          { error: "Reservation is not ready for claiming" },
          { status: 400 }
        );
      }

      // Check if book is still available
      if (reservation.book.availableCopies <= 0) {
        return NextResponse.json(
          { error: "Book is no longer available" },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update reservation status
        const claimedReservation = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "CLAIMED" },
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

        // Create borrowing record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 2 weeks borrowing period

        const borrowing = await tx.borrowing.create({
          data: {
            userId: reservation.userId,
            bookId: reservation.bookId,
            dueDate: dueDate,
          },
        });

        // Update book availability
        await tx.book.update({
          where: { id: reservation.bookId },
          data: {
            availableCopies: {
              decrement: 1,
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: reservation.userId,
            title: "Book Borrowed from Reservation",
            message: `You have successfully borrowed "${
              reservation.book.title
            }" from your reservation. Due date: ${dueDate.toLocaleDateString()}`,
            type: "GENERAL",
            actionUrl: `/dashboard`,
          },
        });

        return { reservation: claimedReservation, borrowing };
      });

      return NextResponse.json(result);
    } else if (action === "cancel") {
      const cancelledReservation = await prisma.$transaction(async (tx) => {
        const cancelled = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "CANCELLED" },
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
            userId: reservation.userId,
            title: "Reservation Cancelled",
            message: `Your reservation for "${reservation.book.title}" has been cancelled.`,
            type: "GENERAL",
            actionUrl: `/dashboard`,
          },
        });

        return cancelled;
      });

      return NextResponse.json(cancelledReservation);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
