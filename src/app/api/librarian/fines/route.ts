import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all fines with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
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
          borrowing: {
            book: {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const [fines, total] = await Promise.all([
      prisma.fine.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.fine.count({ where }),
    ]);

    return NextResponse.json({
      fines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    return NextResponse.json(
      { error: "Failed to fetch fines" },
      { status: 500 }
    );
  }
}

// POST create a fine for a borrowing
export async function POST(request: NextRequest) {
  try {
    const { borrowingId, amount, reason } = await request.json();

    if (!borrowingId || !amount || !reason) {
      return NextResponse.json(
        { error: "Borrowing ID, amount, and reason are required" },
        { status: 400 }
      );
    }

    // Verify borrowing exists
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        user: true,
        book: {
          select: {
            title: true,
          },
        },
        fine: true,
      },
    });

    if (!borrowing) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    if (borrowing.fine) {
      return NextResponse.json(
        { error: "Fine already exists for this borrowing" },
        { status: 400 }
      );
    }

    const fine = await prisma.$transaction(async (tx) => {
      // Create fine
      const newFine = await tx.fine.create({
        data: {
          userId: borrowing.userId,
          borrowingId,
          amount: parseFloat(amount),
          reason,
          status: "UNPAID",
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
      await tx.notification.create({
        data: {
          userId: borrowing.userId,
          title: "Fine Issued",
          message: `A fine of $${amount} has been issued for "${borrowing.book.title}". Reason: ${reason}`,
          type: "FINE_ISSUED",
          actionUrl: `/dashboard`,
        },
      });

      return newFine;
    });

    return NextResponse.json(fine, { status: 201 });
  } catch (error) {
    console.error("Error creating fine:", error);
    return NextResponse.json(
      { error: "Failed to create fine" },
      { status: 500 }
    );
  }
}
