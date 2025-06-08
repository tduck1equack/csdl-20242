import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";
import { requireAdmin } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const librarianCount = await prisma.user.count({
      where: { role: "LIBRARIAN" },
    });
    const memberCount = await prisma.user.count({ where: { role: "USER" } });
    const activeMembers = await prisma.user.count({
      where: { membershipStatus: "ACTIVE" },
    });
    const suspendedMembers = await prisma.user.count({
      where: { membershipStatus: "SUSPENDED" },
    });

    // Get users created in the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    // Get borrowing statistics
    const totalBorrowings = await prisma.borrowing.count();
    const activeBorrowings = await prisma.borrowing.count({
      where: { status: "BORROWED" },
    });
    const overdueBorrowings = await prisma.borrowing.count({
      where: {
        status: "BORROWED",
        dueDate: { lt: new Date() },
      },
    });
    const returnedBorrowings = await prisma.borrowing.count({
      where: { status: "RETURNED" },
    });

    // Get fine statistics
    const totalFines = await prisma.fine.count();
    const unpaidFines = await prisma.fine.count({
      where: { status: "UNPAID" },
    });

    const fineAmounts = await prisma.fine.aggregate({
      _sum: { amount: true },
      where: { status: "UNPAID" },
    });

    const totalFineAmounts = await prisma.fine.aggregate({
      _sum: { amount: true },
    });

    // Get book statistics
    const totalBooks = await prisma.book.count();
    const borrowedBooks = await prisma.borrowing.count({
      where: { status: "BORROWED" },
    });
    const availableBooks = totalBooks - borrowedBooks;

    // Get notification statistics
    const totalNotifications = await prisma.notification.count();
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false },
    });

    const stats = {
      users: {
        total: totalUsers,
        admins: adminCount,
        librarians: librarianCount,
        members: memberCount,
        newThisWeek: newUsersThisWeek,
        activeMembers,
        suspendedMembers,
      },
      borrowings: {
        total: totalBorrowings,
        active: activeBorrowings,
        overdue: overdueBorrowings,
        returned: returnedBorrowings,
      },
      fines: {
        total: totalFines,
        unpaid: unpaidFines,
        totalAmount: totalFineAmounts._sum.amount || 0,
        unpaidAmount: fineAmounts._sum.amount || 0,
      },
      books: {
        total: totalBooks,
        available: availableBooks,
        borrowed: borrowedBooks,
      },
      notifications: {
        sent: totalNotifications,
        unread: unreadNotifications,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
