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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = new PrismaClient();
    const { id } = await params;
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
      availableCopies,
      coverImage,
      location,
      deweyDecimal,
      format,
      condition,
      genres,
    } = body;

    // Verify book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if ISBN is being changed and if it conflicts with another book
    if (isbn && isbn !== existingBook.isbn) {
      const existingISBN = await prisma.book.findUnique({
        where: { isbn },
      });

      if (existingISBN) {
        return NextResponse.json(
          { error: "A book with this ISBN already exists" },
          { status: 400 }
        );
      }
    }

    // Update book within a transaction
    await prisma.$transaction(async (tx) => {
      // Update basic book information
      const book = await tx.book.update({
        where: { id },
        data: {
          title: title || existingBook.title,
          author: author || existingBook.author,
          isbn: isbn || existingBook.isbn,
          publishedYear: publishedYear || existingBook.publishedYear,
          publisher: publisher || existingBook.publisher,
          language: language || existingBook.language,
          pageCount: pageCount || existingBook.pageCount,
          description: description || existingBook.description,
          totalCopies: totalCopies || existingBook.totalCopies,
          availableCopies:
            availableCopies !== undefined
              ? availableCopies
              : existingBook.availableCopies,
          coverImage: coverImage || existingBook.coverImage,
          location: location || existingBook.location,
          deweyDecimal: deweyDecimal || existingBook.deweyDecimal,
          format: format || existingBook.format,
          condition: condition || existingBook.condition,
        },
      });

      // Update genres if provided
      if (genres && Array.isArray(genres)) {
        // Remove existing genre associations
        await tx.bookGenre.deleteMany({
          where: { bookId: id },
        });

        // Add new genre associations
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
              bookId: id,
              genreId: genre.id,
            },
          });
        }
      }

      return book;
    });

    // Fetch complete updated book with relations
    const completeBook = await prisma.book.findUnique({
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

    // Calculate average rating
    const avgRating =
      completeBook!.reviews.length > 0
        ? completeBook!.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / completeBook!.reviews.length
        : 0;

    const coverImageUrl =
      completeBook!.coverImage ||
      `https://covers.openlibrary.org/b/isbn/${completeBook!.isbn}-L.jpg`;

    const bookWithDetails = {
      ...completeBook,
      coverImageUrl,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: completeBook!.reviews.length,
    };

    return NextResponse.json(bookWithDetails);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}
