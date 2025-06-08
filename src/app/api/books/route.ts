import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count for pagination info
    const totalBooks = await prisma.book.count();

    // Get paginated books with consistent ordering using both title and id
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        publishedYear: true,
        publisher: true,
        language: true,
        pageCount: true,
        description: true,
        totalCopies: true,
        availableCopies: true,
        coverImage: true,
        location: true,
        format: true,
        condition: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        {
          title: "asc",
        },
        {
          id: "asc", // Secondary sort to ensure consistent ordering
        },
      ],
      skip: offset,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalBooks / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
