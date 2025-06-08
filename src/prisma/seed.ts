import { PrismaClient } from "@/generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data in the correct order (respecting foreign key constraints)
  console.log("Clearing existing data...");

  await prisma.notification.deleteMany({});
  await prisma.fine.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.borrowing.deleteMany({});
  await prisma.bookGenre.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing data cleared successfully!");

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
    genres.map((g) => g.name)
  );

  // Create books with proper data - expanded collection
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
    // Additional books for expanded collection
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      publishedYear: 1813,
      publisher: "T. Egerton",
      language: "English",
      pageCount: 432,
      description:
        "A romantic novel of manners set in Georgian England, following Elizabeth Bennet and her complex relationship with Mr. Darcy.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-004",
      deweyDecimal: "823.7",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Classic"],
    },
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      author: "J.R.R. Tolkien",
      isbn: "9780547928210",
      publishedYear: 1954,
      publisher: "George Allen & Unwin",
      language: "English",
      pageCount: 423,
      description:
        "The first volume of the epic fantasy trilogy following Frodo Baggins on his quest to destroy the One Ring.",
      totalCopies: 4,
      availableCopies: 3,
      location: "F-001",
      deweyDecimal: "823.912",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Science Fiction"],
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769174",
      publishedYear: 1951,
      publisher: "Little, Brown and Company",
      language: "English",
      pageCount: 277,
      description:
        "A coming-of-age story narrated by the cynical teenager Holden Caulfield during his few days in New York City.",
      totalCopies: 3,
      availableCopies: 2,
      location: "A-005",
      deweyDecimal: "813.54",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Classic"],
    },
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      isbn: "9780747532699",
      publishedYear: 1997,
      publisher: "Bloomsbury",
      language: "English",
      pageCount: 223,
      description:
        "The first book in the Harry Potter series, following young Harry as he discovers his magical heritage and attends Hogwarts.",
      totalCopies: 5,
      availableCopies: 4,
      location: "F-002",
      deweyDecimal: "823.914",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction", "Science Fiction"],
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      isbn: "9780307474278",
      publishedYear: 2003,
      publisher: "Doubleday",
      language: "English",
      pageCount: 454,
      description:
        "A mystery thriller involving symbologist Robert Langdon's investigation of a murder in the Louvre Museum.",
      totalCopies: 3,
      availableCopies: 3,
      location: "C-002",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      isbn: "9780062315007",
      publishedYear: 1988,
      publisher: "HarperOne",
      language: "English",
      pageCount: 163,
      description:
        "A philosophical novel about a young Andalusian shepherd's journey to the Egyptian pyramids in search of treasure.",
      totalCopies: 4,
      availableCopies: 4,
      location: "A-006",
      deweyDecimal: "869.3",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      isbn: "9780060850524",
      publishedYear: 1932,
      publisher: "Chatto & Windus",
      language: "English",
      pageCount: 311,
      description:
        "A dystopian social science fiction novel set in a futuristic World State of genetically modified citizens.",
      totalCopies: 2,
      availableCopies: 2,
      location: "B-003",
      deweyDecimal: "823.912",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Science Fiction", "Classic"],
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "9780547928227",
      publishedYear: 1937,
      publisher: "George Allen & Unwin",
      language: "English",
      pageCount: 310,
      description:
        "A fantasy novel about hobbit Bilbo Baggins's unexpected journey with a group of dwarves to reclaim their mountain home.",
      totalCopies: 4,
      availableCopies: 3,
      location: "F-003",
      deweyDecimal: "823.912",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Science Fiction"],
    },
    {
      title: "Animal Farm",
      author: "George Orwell",
      isbn: "9780452284241",
      publishedYear: 1945,
      publisher: "Secker & Warburg",
      language: "English",
      pageCount: 112,
      description:
        "An allegorical novella about a group of farm animals who rebel against their human farmer.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-007",
      deweyDecimal: "823.912",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction", "Classic"],
    },
    {
      title: "The Girl with the Dragon Tattoo",
      author: "Stieg Larsson",
      isbn: "9780307269751",
      publishedYear: 2005,
      publisher: "Norstedts Förlag",
      language: "English",
      pageCount: 590,
      description:
        "A psychological thriller about journalist Mikael Blomkvist and hacker Lisbeth Salander investigating a wealthy family's dark secrets.",
      totalCopies: 2,
      availableCopies: 1,
      location: "C-003",
      deweyDecimal: "839.738",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "The Kite Runner",
      author: "Khaled Hosseini",
      isbn: "9781594631931",
      publishedYear: 2003,
      publisher: "Riverhead Books",
      language: "English",
      pageCount: 371,
      description:
        "A story of friendship and redemption set against the tumultuous backdrop of Afghanistan's recent history.",
      totalCopies: 3,
      availableCopies: 2,
      location: "A-008",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction"],
    },
    {
      title: "Life of Pi",
      author: "Yann Martel",
      isbn: "9780156027328",
      publishedYear: 2001,
      publisher: "Knopf Canada",
      language: "English",
      pageCount: 319,
      description:
        "A philosophical adventure novel about a young Indian boy stranded on a lifeboat in the Pacific Ocean with a Bengal tiger.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-009",
      deweyDecimal: "813.54",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "The Fault in Our Stars",
      author: "John Green",
      isbn: "9780525478812",
      publishedYear: 2012,
      publisher: "Dutton Books",
      language: "English",
      pageCount: 313,
      description:
        "A young adult novel about two teenagers with cancer who fall in love after meeting in a support group.",
      totalCopies: 4,
      availableCopies: 4,
      location: "A-010",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      isbn: "9780307588371",
      publishedYear: 2012,
      publisher: "Crown Publishing Group",
      language: "English",
      pageCount: 419,
      description:
        "A psychological thriller about a marriage gone terribly wrong when Amy Dunne disappears on her fifth wedding anniversary.",
      totalCopies: 2,
      availableCopies: 1,
      location: "C-004",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "The Book Thief",
      author: "Markus Zusak",
      isbn: "9780375842207",
      publishedYear: 2005,
      publisher: "Picador",
      language: "English",
      pageCount: 552,
      description:
        "A novel narrated by Death about a young girl living with foster parents in Nazi Germany who finds solace in stealing books.",
      totalCopies: 3,
      availableCopies: 2,
      location: "A-011",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Fiction"],
    },
    {
      title: "The Martian",
      author: "Andy Weir",
      isbn: "9780553418026",
      publishedYear: 2011,
      publisher: "Crown Publishing Group",
      language: "English",
      pageCount: 369,
      description:
        "A science fiction novel about an astronaut stranded on Mars who must survive using his ingenuity and scientific knowledge.",
      totalCopies: 3,
      availableCopies: 3,
      location: "B-004",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Science Fiction", "Fiction"],
    },
    {
      title: "The Silence of the Lambs",
      author: "Thomas Harris",
      isbn: "9780312924584",
      publishedYear: 1988,
      publisher: "St. Martin's Press",
      language: "English",
      pageCount: 352,
      description:
        "A psychological horror novel featuring FBI trainee Clarice Starling and the brilliant but dangerous Dr. Hannibal Lecter.",
      totalCopies: 2,
      availableCopies: 2,
      location: "C-005",
      deweyDecimal: "813.54",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "Educated",
      author: "Tara Westover",
      isbn: "9780399590504",
      publishedYear: 2018,
      publisher: "Random House",
      language: "English",
      pageCount: 334,
      description:
        "A memoir about a woman who grows up in a survivalist Mormon family and eventually pursues higher education.",
      totalCopies: 3,
      availableCopies: 3,
      location: "E-002",
      deweyDecimal: "371.829",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Biography", "Non-Fiction"],
    },
    {
      title: "Becoming",
      author: "Michelle Obama",
      isbn: "9781524763138",
      publishedYear: 2018,
      publisher: "Crown Publishing Group",
      language: "English",
      pageCount: 448,
      description:
        "The memoir of former First Lady Michelle Obama, chronicling her life from childhood to her years in the White House.",
      totalCopies: 4,
      availableCopies: 4,
      location: "E-003",
      deweyDecimal: "973.932",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Biography", "Non-Fiction"],
    },
    {
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      isbn: "9780062457714",
      publishedYear: 2016,
      publisher: "HarperOne",
      language: "English",
      pageCount: 224,
      description:
        "A counterintuitive approach to living a good life by focusing only on what truly matters and letting go of the rest.",
      totalCopies: 3,
      availableCopies: 3,
      location: "D-002",
      deweyDecimal: "158.1",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Non-Fiction"],
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      publishedYear: 2018,
      publisher: "Avery",
      language: "English",
      pageCount: 320,
      description:
        "A comprehensive guide to building good habits and breaking bad ones through tiny changes that lead to remarkable results.",
      totalCopies: 4,
      availableCopies: 4,
      location: "D-003",
      deweyDecimal: "158.1",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Non-Fiction"],
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      isbn: "9781451639619",
      publishedYear: 1989,
      publisher: "Free Press",
      language: "English",
      pageCount: 381,
      description:
        "A self-help book presenting an approach to being effective in attaining goals by aligning oneself to principles.",
      totalCopies: 3,
      availableCopies: 2,
      location: "D-004",
      deweyDecimal: "158",
      format: "PHYSICAL" as const,
      condition: "GOOD" as const,
      genres: ["Non-Fiction"],
    },
    {
      title: "Where the Crawdads Sing",
      author: "Delia Owens",
      isbn: "9780735219090",
      publishedYear: 2018,
      publisher: "G.P. Putnam's Sons",
      language: "English",
      pageCount: 370,
      description:
        "A mystery novel about a young woman who raised herself in the marshes of North Carolina and becomes a suspect in a murder case.",
      totalCopies: 3,
      availableCopies: 2,
      location: "C-006",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      isbn: "9781501161933",
      publishedYear: 2017,
      publisher: "Atria Books",
      language: "English",
      pageCount: 400,
      description:
        "A captivating novel about a reclusive Hollywood icon who finally decides to tell her story to a young journalist.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-012",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "Circe",
      author: "Madeline Miller",
      isbn: "9780316556347",
      publishedYear: 2018,
      publisher: "Little, Brown and Company",
      language: "English",
      pageCount: 393,
      description:
        "A novel that tells the story of Circe, the Greek goddess of magic, and her journey from a nymph to a powerful witch.",
      totalCopies: 2,
      availableCopies: 2,
      location: "F-004",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction", "Science Fiction"],
    },
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      isbn: "9780593135204",
      publishedYear: 2021,
      publisher: "Ballantine Books",
      language: "English",
      pageCount: 496,
      description:
        "A science fiction novel about a lone astronaut who must save humanity from extinction while dealing with memory loss.",
      totalCopies: 2,
      availableCopies: 2,
      location: "B-005",
      deweyDecimal: "813.6",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Science Fiction", "Fiction"],
    },
    {
      title: "The Thursday Murder Club",
      author: "Richard Osman",
      isbn: "9781984880567",
      publishedYear: 2020,
      publisher: "Pamela Dorman Books",
      language: "English",
      pageCount: 368,
      description:
        "A mystery novel about four unlikely friends in a retirement village who meet weekly to investigate cold cases.",
      totalCopies: 3,
      availableCopies: 3,
      location: "C-007",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      isbn: "9780525559474",
      publishedYear: 2020,
      publisher: "Viking",
      language: "English",
      pageCount: 288,
      description:
        "A philosophical novel about a library that exists between life and death, where each book represents a different life path.",
      totalCopies: 3,
      availableCopies: 3,
      location: "A-013",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      isbn: "9780593318171",
      publishedYear: 2021,
      publisher: "Knopf",
      language: "English",
      pageCount: 303,
      description:
        "A science fiction novel told from the perspective of Klara, an artificial friend designed to prevent loneliness.",
      totalCopies: 2,
      availableCopies: 2,
      location: "B-006",
      deweyDecimal: "823.914",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Science Fiction", "Fiction"],
    },
    {
      title: "The Guest List",
      author: "Lucy Foley",
      isbn: "9780062868930",
      publishedYear: 2020,
      publisher: "William Morrow",
      language: "English",
      pageCount: 320,
      description:
        "A psychological thriller set at a wedding on a remote island where secrets from the past threaten to destroy lives.",
      totalCopies: 2,
      availableCopies: 1,
      location: "C-008",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Mystery", "Fiction"],
    },
    {
      title: "Normal People",
      author: "Sally Rooney",
      isbn: "9781984822178",
      publishedYear: 2018,
      publisher: "Hogarth",
      language: "English",
      pageCount: 266,
      description:
        "A novel following the complex relationship between two Irish teenagers, Connell and Marianne, from high school to university.",
      totalCopies: 3,
      availableCopies: 2,
      location: "A-014",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Fiction"],
    },
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      isbn: "9781250301697",
      publishedYear: 2019,
      publisher: "Celadon Books",
      language: "English",
      pageCount: 336,
      description:
        "A psychological thriller about a woman who refuses to speak after allegedly murdering her husband and the therapist determined to treat her.",
      totalCopies: 3,
      availableCopies: 2,
      location: "C-009",
      deweyDecimal: "823.92",
      format: "PHYSICAL" as const,
      condition: "NEW" as const,
      genres: ["Mystery", "Fiction"],
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
    const randomBook =
      createdBooks[Math.floor(Math.random() * createdBooks.length)];

    // Generate rating (weighted towards higher ratings like real reviews)
    const weightedRatings = [1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];
    const rating =
      weightedRatings[Math.floor(Math.random() * weightedRatings.length)];

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
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Random date within last 30 days
        },
      });
    } catch {
      // Skip if user already reviewed this book (unique constraint)
      continue;
    }
  }

  console.log("Created random reviews");

  // Create some sample borrowings (current) - expanded to ~20 borrowings
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
    {
      userEmail: "alice.johnson@email.com",
      bookTitle: "To Kill a Mockingbird",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
    },
    {
      userEmail: "bob.wilson@email.com",
      bookTitle: "1984",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Due in 10 days
    },
    {
      userEmail: "carol.brown@email.com",
      bookTitle: "The Great Gatsby",
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Due in 8 days
    },
    {
      userEmail: "david.taylor@email.com",
      bookTitle: "Dune",
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // Due in 12 days
    },
    {
      userEmail: "emma.davis@email.com",
      bookTitle: "Pride and Prejudice",
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Due in 6 days
    },
    {
      userEmail: "frank.miller@email.com",
      bookTitle: "The Catcher in the Rye",
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // Due in 9 days
    },
    {
      userEmail: "grace.lee@email.com",
      bookTitle: "Harry Potter and the Philosopher's Stone",
      dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // Due in 11 days
    },
    {
      userEmail: "henry.garcia@email.com",
      bookTitle: "The Lord of the Rings: The Fellowship of the Ring",
      dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), // Due in 13 days
    },
    {
      userEmail: "isabel.martinez@email.com",
      bookTitle: "The Girl with the Dragon Tattoo",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue by 2 days
    },
    {
      userEmail: "alice.johnson@email.com",
      bookTitle: "The Hobbit",
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Due in 4 days
    },
    {
      userEmail: "bob.wilson@email.com",
      bookTitle: "Sapiens: A Brief History of Humankind",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days
    },
    {
      userEmail: "carol.brown@email.com",
      bookTitle: "The Kite Runner",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue by 1 day
    },
    {
      userEmail: "david.taylor@email.com",
      bookTitle: "Life of Pi",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    },
    {
      userEmail: "emma.davis@email.com",
      bookTitle: "The Fault in Our Stars",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
    },
    {
      userEmail: "frank.miller@email.com",
      bookTitle: "Gone Girl",
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Overdue by 3 days
    },
    {
      userEmail: "grace.lee@email.com",
      bookTitle: "The Book Thief",
      dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // Due in 16 days
    },
    {
      userEmail: "henry.garcia@email.com",
      bookTitle: "The Martian",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    },
    {
      userEmail: "isabel.martinez@email.com",
      bookTitle: "Where the Crawdads Sing",
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // Due in 18 days
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

  // Create sample notifications
  console.log("Creating sample notifications...");

  const sampleNotifications = [
    {
      userEmail: "user@library.com",
      title: "Book Due Soon",
      message:
        "Your book 'The Murder of Roger Ackroyd' is due in 3 days. Please return or renew it.",
      type: "DUE_DATE_REMINDER" as const,
      actionUrl: "/dashboard/borrowings",
    },
    {
      userEmail: "user@library.com",
      title: "Welcome to the Library!",
      message:
        "Welcome to our digital library system. You can browse books, make reservations, and manage your borrowings from your dashboard.",
      type: "GENERAL" as const,
      actionUrl: "/books",
    },
    {
      userEmail: "librarian@library.com",
      title: "Renewal Successful",
      message:
        "Your book 'The Hitchhiker's Guide to the Galaxy' has been successfully renewed. New due date: " +
        new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      type: "RENEWAL_SUCCESS" as const,
      actionUrl: "/dashboard/borrowings",
    },
    {
      userEmail: "alice.johnson@email.com",
      title: "Fine Issued",
      message:
        "A late return fine of $2.50 has been issued for 'To Kill a Mockingbird'. Please pay at the circulation desk.",
      type: "FINE_ISSUED" as const,
      actionUrl: "/dashboard/fines",
    },
    {
      userEmail: "bob.wilson@email.com",
      title: "System Maintenance Notice",
      message:
        "The library system will undergo maintenance this Sunday from 2 AM to 6 AM. Online services may be temporarily unavailable.",
      type: "SYSTEM_MAINTENANCE" as const,
    },
  ];

  for (const notificationData of sampleNotifications) {
    const user = users.find((u) => u.email === notificationData.userEmail);

    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          actionUrl: notificationData.actionUrl,
        },
      });
    }
  }

  console.log("Created sample notifications");

  // Create some sample reservations
  console.log("Creating sample reservations...");

  const sampleReservations = [
    {
      userEmail: "alice.johnson@email.com",
      bookTitle: "Dune",
      status: "PENDING" as const,
    },
    {
      userEmail: "bob.wilson@email.com",
      bookTitle: "Harry Potter and the Philosopher's Stone",
      status: "READY" as const,
    },
  ];

  for (const reservationData of sampleReservations) {
    const user = users.find((u) => u.email === reservationData.userEmail);
    const book = await prisma.book.findFirst({
      where: { title: reservationData.bookTitle },
    });

    if (book && user) {
      await prisma.reservation.create({
        data: {
          userId: user.id,
          bookId: book.id,
          status: reservationData.status,
          expiryDate:
            reservationData.status === "READY"
              ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
              : null, // 3 days to claim if ready
        },
      });
    }
  }

  console.log("Created sample reservations");
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
