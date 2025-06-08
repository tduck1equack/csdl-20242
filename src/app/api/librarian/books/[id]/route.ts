import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLibrarian } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* const authUser = requireLibrarian(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } */

    const { id } = params;

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: {
            status: {
              in: ["BORROWED", "OVERDUE"],
            },
          },
        },
        reservations: {
          where: {
            status: "PENDING",
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if book has active borrowings
    if (book.borrowings.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete book with active borrowings. Please ensure all copies are returned first.",
          activeBorrowings: book.borrowings.length,
        },
        { status: 400 }
      );
    }

    // Check if book has active reservations
    if (book.reservations.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete book with active reservations. Please cancel all reservations first.",
          activeReservations: book.reservations.length,
        },
        { status: 400 }
      );
    }

    // Delete book and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete book-genre associations
      await tx.bookGenre.deleteMany({
        where: { bookId: id },
      });

      // Delete reviews
      await tx.review.deleteMany({
        where: { bookId: id },
      });

      // Delete completed borrowings
      await tx.borrowing.deleteMany({
        where: {
          bookId: id,
          status: "RETURNED",
        },
      });

      // Delete completed reservations
      await tx.reservation.deleteMany({
        where: {
          bookId: id,
          status: {
            in: ["PENDING", "READY", "CLAIMED", "CANCELLED", "EXPIRED"],
          },
        },
      });

      // Finally delete the book
      await tx.book.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        borrowings: {
          where: {
            status: {
              in: ["BORROWED", "OVERDUE"],
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reservations: {
          where: {
            status: "PENDING",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            borrowings: {
              where: {
                status: "BORROWED",
              },
            },
            reviews: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}
