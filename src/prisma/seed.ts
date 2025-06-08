import { PrismaClient } from "@/generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const userData = [
    {
      email: "user@library.com",
      name: "John Doe",
      role: "USER" as const,
      phoneNumber: "+1234567890",
      address: "123 Main St, City, State",
    },
    {
      email: "librarian@library.com",
      name: "Jane Smith",
      role: "LIBRARIAN" as const,
      phoneNumber: "+1234567891",
      address: "456 Oak Ave, City, State",
    },
    {
      email: "admin@library.com",
      name: "Admin User",
      role: "ADMIN" as const,
      phoneNumber: "+1234567892",
      address: "789 Pine Rd, City, State",
    },
    // Additional users for more reviews
    {
      email: "alice.johnson@email.com",
      name: "Alice Johnson",
      role: "USER" as const,
      phoneNumber: "+1234567893",
      address: "101 Elm St, City, State",
    },
    {
      email: "bob.wilson@email.com",
      name: "Bob Wilson",
      role: "USER" as const,
      phoneNumber: "+1234567894",
      address: "202 Maple Ave, City, State",
    },
    {
      email: "carol.brown@email.com",
      name: "Carol Brown",
      role: "USER" as const,
      phoneNumber: "+1234567895",
      address: "303 Cedar Rd, City, State",
    },
    {
      email: "david.taylor@email.com",
      name: "David Taylor",
      role: "USER" as const,
      phoneNumber: "+1234567896",
      address: "404 Birch Ln, City, State",
    },
    {
      email: "emma.davis@email.com",
      name: "Emma Davis",
      role: "USER" as const,
      phoneNumber: "+1234567897",
      address: "505 Spruce Dr, City, State",
    },
    {
      email: "frank.miller@email.com",
      name: "Frank Miller",
      role: "USER" as const,
      phoneNumber: "+1234567898",
      address: "606 Willow Way, City, State",
    },
    {
      email: "grace.lee@email.com",
      name: "Grace Lee",
      role: "USER" as const,
      phoneNumber: "+1234567899",
      address: "707 Poplar Pl, City, State",
    },
    {
      email: "henry.garcia@email.com",
      name: "Henry Garcia",
      role: "USER" as const,
      phoneNumber: "+1234567800",
      address: "808 Aspen Ave, City, State",
    },
    {
      email: "isabel.martinez@email.com",
      name: "Isabel Martinez",
      role: "USER" as const,
      phoneNumber: "+1234567801",
      address: "909 Redwood Rd, City, State",
    },
  ];

  const users = await Promise.all(
    userData.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          password: hashedPassword,
        },
      })
    )
  );

  console.log("Created users:", users.map((u) => u.email));

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

  console.log("Created genres:", genres.map((g) => g.name));

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
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
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
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
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
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
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
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
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
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
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
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
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
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
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
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Biography", "Non-Fiction"],
    },
  ];

  // Create books and associate with genres
  const createdBooks = [];
  for (const bookData of booksData) {
    const { genres: bookGenres, ...bookInfo } = bookData;
    
    const book = await prisma.book.upsert({
      where: { isbn: bookInfo.isbn },
      update: {},
      create: bookInfo,
    });
    
    createdBooks.push(book);

    // Associate book with genres
    for (const genreName of bookGenres) {
      const genre = genres.find((g) => g.name === genreName);
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

  // Generate random review comments for variety
  const reviewComments = [
    "Absolutely fantastic! Couldn't put it down.",
    "A masterpiece of literature. Highly recommended.",
    "Great storytelling and well-developed characters.",
    "Interesting concept but execution could be better.",
    "Not my cup of tea, but I can see why others love it.",
    "Brilliant writing style and engaging plot.",
    "A bit slow at first but picks up nicely.",
    "Thought-provoking and emotionally moving.",
    "Well-researched and informative.",
    "Classic for a reason. Timeless themes.",
    "Amazing world-building and character development.",
    "Could not stop reading once I started.",
    "Beautifully written with deep insights.",
    "A page-turner from start to finish.",
    "Challenging read but worth the effort.",
    "Entertaining and educational at the same time.",
    "Great for book club discussions.",
    "The ending was unexpected and satisfying.",
    "Rich in detail and atmosphere.",
    "A must-read for fans of the genre.",
    "Compelling narrative and strong themes.",
    "Well-paced with excellent character arcs.",
    "Intellectually stimulating and engaging.",
    "Perfect blend of entertainment and substance.",
    "Memorable characters and vivid descriptions.",
    "Captivating from the very first page.",
    "Excellent research and attention to detail.",
    "A real eye-opener on the subject matter.",
    "Powerful message delivered effectively.",
    "Great introduction to the author's work.",
    "Exceeded my expectations completely.",
    "Solid read with good pacing.",
    "Interesting perspective on familiar themes.",
    "Well-crafted prose and dialogue.",
    "Engaging and thought-provoking content.",
    "A rollercoaster of emotions.",
    "Fantastic character development throughout.",
    "Brilliant exploration of complex topics.",
    "Couldn't recommend this more highly.",
    "Perfect for readers who enjoy deep stories.",
  ];

  // Create about 50 random reviews
  console.log("Creating random reviews...");
  const reviewsToCreate = 50;
  
  for (let i = 0; i < reviewsToCreate; i++) {
    // Pick random user and book
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomBook = createdBooks[Math.floor(Math.random() * createdBooks.length)];
    
    // Generate rating (weighted towards higher ratings like real reviews)
    const weightedRatings = [1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];
    const rating = weightedRatings[Math.floor(Math.random() * weightedRatings.length)];
    
    // Randomly decide if review has a comment (70% chance)
    const hasComment = Math.random() > 0.3;
    const comment = hasComment 
      ? reviewComments[Math.floor(Math.random() * reviewComments.length)] 
      : null;
    
    try {
      await prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: randomUser.id,
            bookId: randomBook.id,
          },
        },
        update: {},
        create: {
          userId: randomUser.id,
          bookId: randomBook.id,
          rating: rating,
          comment: comment,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        },
      });
    } catch (error) {
      // Skip if user already reviewed this book (unique constraint)
      continue;
    }
  }

  console.log("Created random reviews");

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
    const user = users.find((u) => u.email === borrowingData.userEmail);
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
