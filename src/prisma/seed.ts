import { PrismaClient } from "@prisma/client";
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
    users.map((u) => u.email)
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
  ]);

  console.log(
    "Created genres:",
    genres.map((g) => g.name)
  );

  // Create books
  const books = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      publishedYear: 1960,
      publisher: "J.B. Lippincott & Co.",
      description:
        "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.",
      totalCopies: 5,
      availableCopies: 3,
      location: "Section A, Shelf 1",
      deweyDecimal: "813.54",
      genreName: "Fiction",
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "978-0-441-17271-9",
      publishedYear: 1965,
      publisher: "Chilton Books",
      description:
        "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
      totalCopies: 4,
      availableCopies: 2,
      location: "Section B, Shelf 3",
      deweyDecimal: "813.54",
      genreName: "Science Fiction",
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      publishedYear: 1925,
      publisher: "Charles Scribner's Sons",
      description:
        "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
      totalCopies: 6,
      availableCopies: 4,
      location: "Section A, Shelf 2",
      deweyDecimal: "813.52",
      genreName: "Fiction",
    },
    {
      title: "The Murder of Roger Ackroyd",
      author: "Agatha Christie",
      isbn: "978-0-00-712092-4",
      publishedYear: 1926,
      publisher: "William Collins, Sons",
      description:
        "A classic mystery novel featuring the famous detective Hercule Poirot.",
      totalCopies: 3,
      availableCopies: 1,
      location: "Section C, Shelf 1",
      deweyDecimal: "823.912",
      genreName: "Mystery",
    },
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      isbn: "978-0-06-231609-7",
      publishedYear: 2014,
      publisher: "Harper",
      description:
        "How did our species succeed in the battle for dominance? Why did our foraging ancestors come together to create cities and kingdoms?",
      totalCopies: 4,
      availableCopies: 4,
      location: "Section D, Shelf 2",
      deweyDecimal: "909",
      genreName: "Non-Fiction",
    },
    {
      title: "Steve Jobs",
      author: "Walter Isaacson",
      isbn: "978-1-4516-4853-9",
      publishedYear: 2011,
      publisher: "Simon & Schuster",
      description:
        "The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs himself.",
      totalCopies: 3,
      availableCopies: 2,
      location: "Section E, Shelf 1",
      deweyDecimal: "338.7",
      genreName: "Biography",
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      publishedYear: 1949,
      publisher: "Secker & Warburg",
      description:
        "A dystopian social science fiction novel about totalitarian control and the power of language.",
      totalCopies: 5,
      availableCopies: 3,
      location: "Section A, Shelf 3",
      deweyDecimal: "823.912",
      genreName: "Fiction",
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      isbn: "978-0-345-39180-3",
      publishedYear: 1979,
      publisher: "Pan Books",
      description:
        "A comedy science fiction series that follows the misadventures of Arthur Dent.",
      totalCopies: 3,
      availableCopies: 1,
      location: "Section B, Shelf 1",
      deweyDecimal: "823.914",
      genreName: "Science Fiction",
    },
  ];

  for (const bookData of books) {
    const { genreName, ...bookInfo } = bookData;
    const genre = genres.find((g) => g.name === genreName);

    if (!genre) continue;

    const book = await prisma.book.upsert({
      where: { isbn: bookInfo.isbn },
      update: {},
      create: bookInfo,
    });

    // Create book-genre relationship
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

  console.log("Created books and book-genre relationships");
  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
