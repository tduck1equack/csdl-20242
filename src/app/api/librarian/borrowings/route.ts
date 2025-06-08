import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const overdue = searchParams.get("overdue") === "true";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (overdue) {
      where.status = "BORROWED";
      where.dueDate = {
        lt: new Date(),
      };
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          book: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          book: {
            author: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          book: {
            isbn: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [borrowings, total] = await Promise.all([
      prisma.borrowing.findMany({
        where,
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
        orderBy: [{ dueDate: "asc" }, { borrowDate: "desc" }],
        skip,
        take: limit,
      }),
      prisma.borrowing.count({ where }),
    ]);

    // Calculate if each borrowing is overdue
    const borrowingsWithOverdue = borrowings.map((borrowing) => ({
      ...borrowing,
      isOverdue:
        borrowing.status === "BORROWED" &&
        new Date(borrowing.dueDate) < new Date(),
      daysOverdue:
        borrowing.status === "BORROWED" &&
        new Date(borrowing.dueDate) < new Date()
          ? Math.floor(
              (new Date().getTime() - new Date(borrowing.dueDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
    }));

    return NextResponse.json({
      borrowings: borrowingsWithOverdue,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrowings" },
      { status: 500 }
    );
  }
}
