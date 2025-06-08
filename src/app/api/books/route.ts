import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/client";

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const author = searchParams.get("author") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build where clause for search
    let where: Prisma.BookWhereInput = {};

    if (search || author) {
      const orConditions: Prisma.BookWhereInput[] = [];

      if (search) {
        orConditions.push(
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            author: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          }
        );
      }

      if (author && !search) {
        orConditions.push({
          author: {
            contains: author,
            mode: "insensitive",
          },
        });
      }

      where = { OR: orConditions };
    }

    // Get total count for pagination info
    const totalBooks = await prisma.book.count({ where });

    // Get paginated books with consistent ordering using both title and id
    const books = await prisma.book.findMany({
      where,
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
