import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, notes, fineAmount, fineReason } = await request.json();
    const borrowingId = params.id;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        user: true,
        book: true,
        fine: true,
      },
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "return":
        await prisma.$transaction(async (tx) => {
          // Update borrowing status
          await tx.borrowing.update({
            where: { id: borrowingId },
            data: {
              status: "RETURNED",
              returnDate: new Date(),
              returnNotes: notes,
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
              title: "Book Returned",
              message: `Your book "${borrowing.book.title}" has been successfully returned.`,
              type: "BOOK_RETURNED",
            },
          });

          // Check for waiting reservations
          const waitingReservation = await tx.reservation.findFirst({
            where: {
              bookId: borrowing.bookId,
              status: "PENDING",
            },
            orderBy: {
              reservationDate: "asc",
            },
            include: {
              user: true,
            },
          });

          if (waitingReservation) {
            await tx.reservation.update({
              where: { id: waitingReservation.id },
              data: {
                status: "READY",
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
              },
            });

            await tx.notification.create({
              data: {
                userId: waitingReservation.userId,
                title: "Reservation Ready",
                message: `Your reserved book "${borrowing.book.title}" is now available for pickup.`,
                type: "RESERVATION_READY",
                actionUrl: `/books/${borrowing.bookId}`,
              },
            });
          }
        });
        break;

      case "mark_overdue":
        await prisma.borrowing.update({
          where: { id: borrowingId },
          data: {
            status: "OVERDUE",
          },
        });

        // Create overdue notification
        await prisma.notification.create({
          data: {
            userId: borrowing.userId,
            title: "Book Overdue",
            message: `Your book "${borrowing.book.title}" is now overdue. Please return it as soon as possible.`,
            type: "OVERDUE_NOTICE",
            actionUrl: `/dashboard`,
          },
        });
        break;

      case "mark_lost":
        await prisma.borrowing.update({
          where: { id: borrowingId },
          data: {
            status: "LOST",
            returnNotes: notes,
          },
        });
        break;

      case "mark_damaged":
        await prisma.borrowing.update({
          where: { id: borrowingId },
          data: {
            status: "DAMAGED",
            returnNotes: notes,
          },
        });
        break;

      case "issue_fine":
        if (!fineAmount || !fineReason) {
          return NextResponse.json(
            { error: "Fine amount and reason are required" },
            { status: 400 }
          );
        }

        await prisma.$transaction(async (tx) => {
          // Create or update fine
          await tx.fine.upsert({
            where: { borrowingId },
            update: {
              amount: fineAmount,
              reason: fineReason,
              status: "UNPAID",
            },
            create: {
              userId: borrowing.userId,
              borrowingId,
              amount: fineAmount,
              reason: fineReason,
              status: "UNPAID",
            },
          });

          // Create notification
          await tx.notification.create({
            data: {
              userId: borrowing.userId,
              title: "Fine Issued",
              message: `A fine of $${fineAmount} has been issued for "${borrowing.book.title}". Reason: ${fineReason}`,
              type: "FINE_ISSUED",
              actionUrl: `/dashboard`,
            },
          });
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Return updated borrowing
    const updatedBorrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            membershipStatus: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverImage: true,
          },
        },
        fine: true,
      },
    });

    return NextResponse.json(updatedBorrowing);
  } catch (error) {
    console.error("Error updating borrowing:", error);
    return NextResponse.json(
      { error: "Failed to update borrowing" },
      { status: 500 }
    );
  }
}
