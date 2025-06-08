import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/client";

export async function GET() {
  try {
    const prisma = new PrismaClient();
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
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
