import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET users with search functionality
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeBorrowings = searchParams.get("includeBorrowings") === "true";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          membershipStatus: true,
          memberSince: true,
          _count: {
            select: {
              borrowings: true,
              fines: {
                where: {
                  status: "UNPAID",
                },
              },
              notifications: {
                where: {
                  isRead: false,
                },
              },
            },
          },
          ...(includeBorrowings && {
            borrowings: {
              where: {
                status: "BORROWED",
              },
              select: {
                id: true,
                dueDate: true,
                status: true,
                book: {
                  select: {
                    id: true,
                    title: true,
                    author: true,
                  },
                },
              },
              orderBy: {
                dueDate: "asc",
              },
            },
          }),
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
