import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, notes } = await request.json();
    const fineId = params.id;

    const fine = await prisma.fine.findUnique({
      where: { id: fineId },
      include: {
        user: true,
        borrowing: {
          include: {
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!fine) {
      return NextResponse.json({ error: "Fine not found" }, { status: 404 });
    }

    let updatedFine;

    switch (action) {
      case "mark_paid":
        updatedFine = await prisma.fine.update({
          where: { id: fineId },
          data: {
            status: "PAID",
            paidDate: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                membershipStatus: true,
              },
            },
            borrowing: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    isbn: true,
                  },
                },
              },
            },
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: fine.userId,
            title: "Fine Payment Confirmed",
            message: `Your fine of $${fine.amount} for "${fine.borrowing.book.title}" has been marked as paid.`,
            type: "GENERAL",
          },
        });
        break;

      case "waive":
        updatedFine = await prisma.fine.update({
          where: { id: fineId },
          data: {
            status: "WAIVED",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                membershipStatus: true,
              },
            },
            borrowing: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                    isbn: true,
                  },
                },
              },
            },
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: fine.userId,
            title: "Fine Waived",
            message: `Your fine of $${fine.amount} for "${fine.borrowing.book.title}" has been waived.`,
            type: "GENERAL",
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(updatedFine);
  } catch (error) {
    console.error("Error updating fine:", error);
    return NextResponse.json(
      { error: "Failed to update fine" },
      { status: 500 }
    );
  }
}
