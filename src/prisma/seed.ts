import { PrismaClient } from "@/generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "user@library.com" },
      update: {},
      create: {
        email: "user@library.com",
        name: "John Doe",
        password: hashedPassword,
        role: "USER",
        phoneNumber: "+1234567890",
        address: "123 Main St, City, State",
      },
    }),
    prisma.user.upsert({
      where: { email: "librarian@library.com" },
      update: {},
      create: {
        email: "librarian@library.com",
        name: "Jane Smith",
        password: hashedPassword,
        role: "LIBRARIAN",
        phoneNumber: "+1234567891",
        address: "456 Oak Ave, City, State",
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@library.com" },
      update: {},
      create: {
        email: "admin@library.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
        phoneNumber: "+1234567892",
        address: "789 Pine Rd, City, State",
      },
    }),
  ]);

  console.log(
    "Created users:",
    users.map((u: any) => u.email)
  );

  // Create genres
  const genres = await Promise.all([
    prisma.genre.upsert({
      where: { name: "Fiction" },
      update: {},
      create: {
        name: "Fiction",
        description: "Fictional literature and novels",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Science Fiction" },
      update: {},
      create: {
        name: "Science Fiction",
        description: "Science fiction and futuristic stories",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Mystery" },
      update: {},
      create: {
        name: "Mystery",
        description: "Mystery and detective stories",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Non-Fiction" },
      update: {},
      create: {
        name: "Non-Fiction",
        description: "Non-fictional books and educational material",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Biography" },
      update: {},
      create: {
        name: "Biography",
        description: "Biographical works and memoirs",
      },
    }),
    prisma.genre.upsert({
      where: { name: "Classic" },
      update: {},
      create: {
        name: "Classic",
        description: "Classic literature and timeless works",
      },
    }),
  ]);

  console.log(
    "Created genres:",
    genres.map((g: any) => g.name)
  );

  // Create books with proper data
  const booksData = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "9780061120084",
      publishedYear: 1960,
      publisher: "J.B. Lippincott & Co.",
      language: "English",
      pageCount: 281,
      description:
        "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.",
      totalCopies: 5,
      availableCopies: 4,
      location: "A-001",
      deweyDecimal: "813.54",
      format: "HARDCOVER",
      condition: "GOOD",
      genres: ["Fiction", "Classic"],
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      publishedYear: 1949,
      publisher: "Secker & Warburg",
      language: "English",
      pageCount: 328,
      description:
        "A dystopian social science fiction novel that follows Winston Smith, a protagonist living in a society governed by a totalitarian party.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-002",
      deweyDecimal: "823.912",
      format: "PAPERBACK",
      condition: "EXCELLENT",
      genres: ["Fiction", "Science Fiction", "Classic"],
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      publishedYear: 1925,
      publisher: "Charles Scribner's Sons",
      language: "English",
      pageCount: 180,
      description:
        "A classic American novel set in the Jazz Age that tells the story of Jay Gatsby and his unrequited love for Daisy Buchanan.",
      totalCopies: 4,
      availableCopies: 4,
      location: "A-003",
      deweyDecimal: "813.52",
      format: "HARDCOVER",
      condition: "GOOD",
      genres: ["Fiction", "Classic"],
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441172719",
      publishedYear: 1965,
      publisher: "Chilton Books",
      language: "English",
      pageCount: 688,
      description:
        "A science fiction masterpiece set in the distant future amidst a feudal interstellar society.",
      totalCopies: 2,
      availableCopies: 2,
      location: "B-001",
      deweyDecimal: "813.54",
      format: "PAPERBACK",
      condition: "EXCELLENT",
      genres: ["Science Fiction", "Fiction"],
    },
    {
      title: "The Murder of Roger Ackroyd",
      author: "Agatha Christie",
      isbn: "9780062073570",
      publishedYear: 1926,
      publisher: "William Collins & Sons",
      language: "English",
      pageCount: 312,
      description:
        "A classic Hercule Poirot mystery that revolutionized the detective fiction genre.",
      totalCopies: 3,
      availableCopies: 2,
      location: "C-001",
      deweyDecimal: "823.912",
      format: "PAPERBACK",
      condition: "GOOD",
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      isbn: "9780062316097",
      publishedYear: 2014,
      publisher: "Harvill Secker",
      language: "English",
      pageCount: 443,
      description:
        "An exploration of how Homo sapiens came to dominate the world and the forces that have shaped human society.",
      totalCopies: 4,
      availableCopies: 4,
      location: "D-001",
      deweyDecimal: "909",
      format: "HARDCOVER",
      condition: "EXCELLENT",
      genres: ["Non-Fiction"],
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      isbn: "9780345391803",
      publishedYear: 1979,
      publisher: "Pan Books",
      language: "English",
      pageCount: 193,
      description:
        "A comedic science fiction series that follows the misadventures of Arthur Dent as he travels through space.",
      totalCopies: 3,
      availableCopies: 2,
      location: "B-002",
      deweyDecimal: "823.914",
      format: "PAPERBACK",
      condition: "GOOD",
      genres: ["Science Fiction", "Fiction"],
    },
    {
      title: "Steve Jobs",
      author: "Walter Isaacson",
      isbn: "9781451648539",
      publishedYear: 2011,
      publisher: "Simon & Schuster",
      language: "English",
      pageCount: 656,
      description:
        "The exclusive biography of Apple co-founder Steve Jobs, based on more than forty interviews conducted over two years.",
      totalCopies: 2,
      availableCopies: 2,
      location: "E-001",
      deweyDecimal: "338.7",
      format: "HARDCOVER",
      condition: "EXCELLENT",
      genres: ["Biography", "Non-Fiction"],
    },
  ];

  // Create books and associate with genres
  for (const bookData of booksData) {
    const { genres: bookGenres, ...bookInfo } = bookData;

    const book = await prisma.book.upsert({
      where: { isbn: bookInfo.isbn },
      update: {},
      create: bookInfo,
    });

    // Associate book with genres
    for (const genreName of bookGenres) {
      const genre = genres.find((g: any) => g.name === genreName);
      if (genre) {
        await prisma.bookGenre.upsert({
          where: {
            bookId_genreId: {
              bookId: book.id,
              genreId: genre.id,
            },
          },
          update: {},
          create: {
            bookId: book.id,
            genreId: genre.id,
          },
        });
      }
    }
  }

  console.log("Created books and book-genre relationships");

  // Create some sample reviews
  const sampleReviews = [
    {
      userEmail: "user@library.com", // John Doe
      bookTitle: "To Kill a Mockingbird",
      rating: 5,
      comment:
        "An absolutely incredible book that changed my perspective on justice and morality. Harper Lee's storytelling is masterful.",
    },
    {
      userEmail: "librarian@library.com", // Jane Smith
      bookTitle: "Dune",
      rating: 4,
      comment:
        "Complex world-building and fascinating characters. A bit dense at times but worth the effort.",
    },
    {
      userEmail: "user@library.com", // John Doe
      bookTitle: "The Great Gatsby",
      rating: 4,
      comment:
        "Beautiful prose and a haunting story about the American Dream. Fitzgerald's writing is poetic.",
    },
    {
      userEmail: "admin@library.com", // Admin User
      bookTitle: "Sapiens: A Brief History of Humankind",
      rating: 5,
      comment:
        "Mind-blowing insights into human history and evolution. Should be required reading for everyone.",
    },
    {
      userEmail: "librarian@library.com", // Jane Smith
      bookTitle: "1984",
      rating: 5,
      comment:
        "Terrifyingly relevant even today. Orwell's vision of totalitarianism is both brilliant and chilling.",
    },
  ];

  for (const reviewData of sampleReviews) {
    const user = users.find((u: any) => u.email === reviewData.userEmail);
    const book = await prisma.book.findFirst({
      where: { title: reviewData.bookTitle },
    });

    if (book && user) {
      await prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          bookId: book.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
    }
  }

  console.log("Created sample reviews");

  // Create some sample borrowings (current)
  const sampleBorrowings = [
    {
      userEmail: "user@library.com", // John Doe
      bookTitle: "The Murder of Roger Ackroyd",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    },
    {
      userEmail: "librarian@library.com", // Jane Smith
      bookTitle: "The Hitchhiker's Guide to the Galaxy",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
    },
  ];

  for (const borrowingData of sampleBorrowings) {
    const user = users.find((u: any) => u.email === borrowingData.userEmail);
    const book = await prisma.book.findFirst({
      where: { title: borrowingData.bookTitle },
    });

    if (book && user) {
      await prisma.borrowing.create({
        data: {
          userId: user.id,
          bookId: book.id,
          dueDate: borrowingData.dueDate,
          status: "BORROWED",
        },
      });

      // Update available copies
      await prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });
    }
  }

  console.log("Created sample borrowings");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
