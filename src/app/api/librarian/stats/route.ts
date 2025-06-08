import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET dashboard statistics for librarians
export async function GET() {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalBorrowings,
      activeBorrowings,
      overdueBorrowings,
      totalFines,
      unpaidFines,
      totalUsers,
      newUsersThisWeek,
      totalBooks,
      availableBooks,
      pendingReservations,
      readyReservations,
    ] = await Promise.all([
      // Total borrowings
      prisma.borrowing.count(),

      // Active borrowings (borrowed status)
      prisma.borrowing.count({
        where: {
          status: "BORROWED",
        },
      }),

      // Overdue borrowings
      prisma.borrowing.count({
        where: {
          status: "BORROWED",
          dueDate: {
            lt: now,
          },
        },
      }),

      // Total fines amount
      prisma.fine.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Unpaid fines
      prisma.fine.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "UNPAID",
        },
      }),

      // Total users
      prisma.user.count({
        where: {
          role: "USER",
        },
      }),

      // New users this week
      prisma.user.count({
        where: {
          role: "USER",
          memberSince: {
            gte: oneWeekAgo,
          },
        },
      }),

      // Total books
      prisma.book.count(),

      // Available books
      prisma.book.aggregate({
        _sum: {
          availableCopies: true,
        },
      }),

      // Pending reservations
      prisma.reservation.count({
        where: {
          status: "PENDING",
        },
      }),

      // Ready reservations
      prisma.reservation.count({
        where: {
          status: "READY",
        },
      }),
    ]);

    // Get recent activities
    const recentBorrowings = await prisma.borrowing.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    });

    const recentFines = await prisma.fine.findMany({
      take: 5,
      where: {
        status: "UNPAID",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
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

    // Get upcoming due dates
    const upcomingDue = await prisma.borrowing.findMany({
      where: {
        status: "BORROWED",
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Next 3 days
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 10,
    });

    return NextResponse.json({
      stats: {
        borrowings: {
          total: totalBorrowings,
          active: activeBorrowings,
          overdue: overdueBorrowings,
        },
        fines: {
          total: totalFines._sum.amount || 0,
          unpaid: unpaidFines._sum.amount || 0,
        },
        users: {
          total: totalUsers,
          newThisWeek: newUsersThisWeek,
        },
        books: {
          total: totalBooks,
          available: availableBooks._sum.availableCopies || 0,
        },
        reservations: {
          pending: pendingReservations,
          ready: readyReservations,
        },
      },
      activities: {
        recentBorrowings,
        recentFines,
        upcomingDue,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
