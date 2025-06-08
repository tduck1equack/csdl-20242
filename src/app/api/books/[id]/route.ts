import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = new PrismaClient();
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        borrowings: {
          where: {
            status: "BORROWED",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Calculate average rating
    const avgRating =
      book.reviews.length > 0
        ? book.reviews.reduce((sum, review) => sum + review.rating, 0) /
          book.reviews.length
        : 0;

    // Add external cover image URL based on ISBN
    const coverImageUrl =
      book.coverImage ||
      `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

    const bookWithDetails = {
      ...book,
      coverImageUrl,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: book.reviews.length,
    };

    return NextResponse.json(bookWithDetails);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}
