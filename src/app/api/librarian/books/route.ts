import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLibrarian } from "@/lib/auth";

// GET books with search and pagination for librarians
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const format = searchParams.get("format");
    const condition = searchParams.get("condition");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
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
          isbn: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (format) {
      where.format = format;
    }

    if (condition) {
      where.condition = condition;
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          genres: {
            include: {
              genre: true,
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
        orderBy: {
          title: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST create a new book
export async function POST(request: NextRequest) {
  try {
    /* const authUser = requireLibrarian(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } */

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      publishedYear,
      publisher,
      language,
      pageCount,
      description,
      totalCopies,
      coverImage,
      location,
      deweyDecimal,
      format,
      condition,
      genres,
    } = body;

    // Validate required fields
    if (!title || !author || !isbn) {
      return NextResponse.json(
        { error: "Title, author, and ISBN are required" },
        { status: 400 }
      );
    }

    // Check if book with ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn },
    });

    if (existingBook) {
      return NextResponse.json(
        { error: "A book with this ISBN already exists" },
        { status: 400 }
      );
    }

    // Create book within a transaction
    const book = await prisma.$transaction(async (tx) => {
      // Create the book
      const newBook = await tx.book.create({
        data: {
          title,
          author,
          isbn,
          publishedYear: publishedYear || new Date().getFullYear(),
          publisher: publisher || "",
          language: language || "English",
          pageCount: pageCount || null,
          description: description || "",
          totalCopies: totalCopies || 1,
          availableCopies: totalCopies || 1,
          coverImage: coverImage || "",
          location: location || "",
          deweyDecimal: deweyDecimal || "",
          format: format || "PHYSICAL",
          condition: condition || "GOOD",
        },
      });

      // Add genres if provided
      if (genres && Array.isArray(genres)) {
        for (const genreName of genres) {
          // Find or create genre
          let genre = await tx.genre.findUnique({
            where: { name: genreName },
          });

          if (!genre) {
            genre = await tx.genre.create({
              data: { name: genreName },
            });
          }

          // Create book-genre association
          await tx.bookGenre.create({
            data: {
              bookId: newBook.id,
              genreId: genre.id,
            },
          });
        }
      }

      return newBook;
    });

    // Fetch complete book with relations
    const completeBook = await prisma.book.findUnique({
      where: { id: book.id },
      include: {
        genres: {
          include: {
            genre: true,
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

    return NextResponse.json(completeBook, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
