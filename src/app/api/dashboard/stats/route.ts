import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const [
      activeBorrowings,
      overdueBooks,
      activeReservations,
      unreadNotifications,
      totalBooksRead,
      unpaidFines,
    ] = await Promise.all([
      // Active borrowings
      prisma.borrowing.count({
        where: {
          userId: userId,
          status: "BORROWED",
        },
      }),

      // Overdue books
      prisma.borrowing.count({
        where: {
          userId: userId,
          status: "OVERDUE",
        },
      }),

      // Active reservations
      prisma.reservation.count({
        where: {
          userId: userId,
          status: {
            in: ["PENDING", "READY"],
          },
        },
      }),

      // Unread notifications
      prisma.notification.count({
        where: {
          userId: userId,
          isRead: false,
        },
      }),

      // Total books read (returned books)
      prisma.borrowing.count({
        where: {
          userId: userId,
          status: "RETURNED",
        },
      }),

      // Unpaid fines
      prisma.fine.aggregate({
        where: {
          userId: userId,
          status: "UNPAID",
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    const stats = {
      activeBorrowings,
      overdueBooks,
      activeReservations,
      unreadNotifications,
      totalBooksRead,
      unpaidFines: {
        count: unpaidFines._count,
        totalAmount: unpaidFines._sum.amount || 0,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
