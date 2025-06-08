--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BookCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookCondition" AS ENUM (
    'NEW',
    'GOOD',
    'FAIR',
    'POOR'
);


ALTER TYPE public."BookCondition" OWNER TO postgres;

--
-- Name: BookFormat; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookFormat" AS ENUM (
    'PHYSICAL',
    'EBOOK',
    'AUDIOBOOK'
);


ALTER TYPE public."BookFormat" OWNER TO postgres;

--
-- Name: BorrowStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BorrowStatus" AS ENUM (
    'BORROWED',
    'RETURNED',
    'OVERDUE',
    'LOST',
    'DAMAGED'
);


ALTER TYPE public."BorrowStatus" OWNER TO postgres;

--
-- Name: FineStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FineStatus" AS ENUM (
    'UNPAID',
    'PAID',
    'WAIVED'
);


ALTER TYPE public."FineStatus" OWNER TO postgres;

--
-- Name: MemberStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MemberStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'EXPIRED'
);


ALTER TYPE public."MemberStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'DUE_DATE_REMINDER',
    'OVERDUE_NOTICE',
    'RESERVATION_READY',
    'FINE_ISSUED',
    'GENERAL',
    'RESERVATION_EXPIRED',
    'FINE_REMINDER',
    'BOOK_RETURNED',
    'RENEWAL_SUCCESS',
    'RENEWAL_FAILED',
    'SYSTEM_MAINTENANCE'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'READY',
    'CLAIMED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."ReservationStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'LIBRARIAN',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Book; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Book" (
    id text NOT NULL,
    title text NOT NULL,
    author text NOT NULL,
    isbn text NOT NULL,
    "publishedYear" integer NOT NULL,
    publisher text,
    language text DEFAULT 'English'::text NOT NULL,
    "pageCount" integer,
    description text DEFAULT ''::text NOT NULL,
    "totalCopies" integer DEFAULT 1 NOT NULL,
    "availableCopies" integer DEFAULT 1 NOT NULL,
    "coverImage" text,
    location text,
    "deweyDecimal" text,
    format public."BookFormat" DEFAULT 'PHYSICAL'::public."BookFormat" NOT NULL,
    condition public."BookCondition" DEFAULT 'GOOD'::public."BookCondition" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Book" OWNER TO postgres;

--
-- Name: BookGenre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookGenre" (
    id text NOT NULL,
    "bookId" text NOT NULL,
    "genreId" text NOT NULL
);


ALTER TABLE public."BookGenre" OWNER TO postgres;

--
-- Name: Borrowing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Borrowing" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bookId" text NOT NULL,
    "borrowDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "returnDate" timestamp(3) without time zone,
    status public."BorrowStatus" DEFAULT 'BORROWED'::public."BorrowStatus" NOT NULL,
    "renewalCount" integer DEFAULT 0 NOT NULL,
    "returnNotes" text,
    "processedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Borrowing" OWNER TO postgres;

--
-- Name: Fine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fine" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "borrowingId" text NOT NULL,
    amount double precision NOT NULL,
    reason text NOT NULL,
    status public."FineStatus" DEFAULT 'UNPAID'::public."FineStatus" NOT NULL,
    "paidDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Fine" OWNER TO postgres;

--
-- Name: Genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Genre" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Genre" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "actionUrl" text,
    metadata text
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bookId" text NOT NULL,
    "reservationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."ReservationStatus" DEFAULT 'PENDING'::public."ReservationStatus" NOT NULL,
    notified boolean DEFAULT false NOT NULL,
    "expiryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Reservation" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bookId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "profileImage" text,
    "phoneNumber" text,
    address text,
    "dateOfBirth" timestamp(3) without time zone,
    "memberSince" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "membershipStatus" public."MemberStatus" DEFAULT 'ACTIVE'::public."MemberStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Book; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Book" (id, title, author, isbn, "publishedYear", publisher, language, "pageCount", description, "totalCopies", "availableCopies", "coverImage", location, "deweyDecimal", format, condition, "createdAt", "updatedAt") FROM stdin;
5276bdab-2a06-4857-b2ed-df5f742193db	Steve Jobs	Walter Isaacson	9781451648539	2011	Simon & Schuster	English	656	The exclusive biography of Apple co-founder Steve Jobs, based on more than forty interviews conducted over two years.	2	2	\N	E-001	338.7	PHYSICAL	NEW	2025-06-08 19:05:49.523	2025-06-08 19:05:49.523
6778a58f-d435-4dd0-bd20-407598a81167	The Da Vinci Code	Dan Brown	9780307474278	2003	Doubleday	English	454	A mystery thriller involving symbologist Robert Langdon's investigation of a murder in the Louvre Museum.	3	3	\N	C-002	813.6	PHYSICAL	GOOD	2025-06-08 19:05:49.544	2025-06-08 19:05:49.544
fb14b285-310a-4198-aeeb-b9de0d050967	The Alchemist	Paulo Coelho	9780062315007	1988	HarperOne	English	163	A philosophical novel about a young Andalusian shepherd's journey to the Egyptian pyramids in search of treasure.	4	4	\N	A-006	869.3	PHYSICAL	NEW	2025-06-08 19:05:49.547	2025-06-08 19:05:49.547
3fb36941-91f3-4729-b2f5-606d54e4e729	Brave New World	Aldous Huxley	9780060850524	1932	Chatto & Windus	English	311	A dystopian social science fiction novel set in a futuristic World State of genetically modified citizens.	2	2	\N	B-003	823.912	PHYSICAL	GOOD	2025-06-08 19:05:49.549	2025-06-08 19:05:49.549
35816982-20b8-4b41-9492-e3688c75959c	Animal Farm	George Orwell	9780452284241	1945	Secker & Warburg	English	112	An allegorical novella about a group of farm animals who rebel against their human farmer.	3	3	\N	A-007	823.912	PHYSICAL	GOOD	2025-06-08 19:05:49.557	2025-06-08 19:05:49.557
9b1366ed-620e-4fed-acd4-a0a54dc9b2ea	The Silence of the Lambs	Thomas Harris	9780312924584	1988	St. Martin's Press	English	352	A psychological horror novel featuring FBI trainee Clarice Starling and the brilliant but dangerous Dr. Hannibal Lecter.	2	2	\N	C-005	813.54	PHYSICAL	GOOD	2025-06-08 19:05:49.581	2025-06-08 19:05:49.581
96a0d633-3bc9-4aa6-a497-eebe98146906	The Hitchhiker's Guide to the Galaxy	Douglas Adams	9780345391803	1979	Pan Books	English	193	A comedic science fiction series that follows the misadventures of Arthur Dent as he travels through space.	3	1	\N	B-002	823.914	PHYSICAL	GOOD	2025-06-08 19:05:49.516	2025-06-08 19:05:49.708
822b186b-5b96-40a1-9aec-bae9aaa42268	To Kill a Mockingbird	Harper Lee	9780061120084	1960	J.B. Lippincott & Co.	English	281	A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.	5	3	\N	A-001	813.54	PHYSICAL	GOOD	2025-06-08 19:05:49.478	2025-06-08 19:05:49.71
0eded5e8-ed4a-4c6c-9ec4-d1b01d0f3347	1984	George Orwell	9780451524935	1949	Secker & Warburg	English	328	A dystopian social science fiction novel that follows Winston Smith, a protagonist living in a society governed by a totalitarian party.	3	2	\N	A-002	823.912	PHYSICAL	NEW	2025-06-08 19:05:49.486	2025-06-08 19:05:49.712
bda036d9-f2ad-49eb-8e8b-eb35839f1bcf	The Great Gatsby	F. Scott Fitzgerald	9780743273565	1925	Charles Scribner's Sons	English	180	A classic American novel set in the Jazz Age that tells the story of Jay Gatsby and his unrequited love for Daisy Buchanan.	4	3	\N	A-003	813.52	PHYSICAL	GOOD	2025-06-08 19:05:49.494	2025-06-08 19:05:49.715
6520e6b7-afcd-429d-8446-739cffbf5607	Dune	Frank Herbert	9780441172719	1965	Chilton Books	English	688	A science fiction masterpiece set in the distant future amidst a feudal interstellar society.	2	1	\N	B-001	813.54	PHYSICAL	NEW	2025-06-08 19:05:49.499	2025-06-08 19:05:49.718
e4550ff2-af23-4044-a935-9b9ac249a9da	Pride and Prejudice	Jane Austen	9780141439518	1813	T. Egerton	English	432	A romantic novel of manners set in Georgian England, following Elizabeth Bennet and her complex relationship with Mr. Darcy.	3	2	\N	A-004	823.7	PHYSICAL	GOOD	2025-06-08 19:05:49.528	2025-06-08 19:05:49.721
4709a8da-8881-494e-978b-dafe787570a6	The Catcher in the Rye	J.D. Salinger	9780316769174	1951	Little, Brown and Company	English	277	A coming-of-age story narrated by the cynical teenager Holden Caulfield during his few days in New York City.	3	1	\N	A-005	813.54	PHYSICAL	GOOD	2025-06-08 19:05:49.536	2025-06-08 19:05:49.724
7448099d-02fc-493f-a70f-6077ce6e2c39	The Lord of the Rings: The Fellowship of the Ring	J.R.R. Tolkien	9780547928210	1954	George Allen & Unwin	English	423	The first volume of the epic fantasy trilogy following Frodo Baggins on his quest to destroy the One Ring.	4	2	\N	F-001	823.912	PHYSICAL	GOOD	2025-06-08 19:05:49.532	2025-06-08 19:05:49.73
40660a64-a34d-4af4-83e1-c05f4c27e23f	The Girl with the Dragon Tattoo	Stieg Larsson	9780307269751	2005	Norstedts Förlag	English	590	A psychological thriller about journalist Mikael Blomkvist and hacker Lisbeth Salander investigating a wealthy family's dark secrets.	2	0	\N	C-003	839.738	PHYSICAL	GOOD	2025-06-08 19:05:49.561	2025-06-08 19:05:49.732
9d5b7dec-0805-4a4f-bc3f-49c308c6e3d6	The Hobbit	J.R.R. Tolkien	9780547928227	1937	George Allen & Unwin	English	310	A fantasy novel about hobbit Bilbo Baggins's unexpected journey with a group of dwarves to reclaim their mountain home.	4	2	\N	F-003	823.912	PHYSICAL	GOOD	2025-06-08 19:05:49.554	2025-06-08 19:05:49.734
d2ba1e74-b322-4d93-b0c1-d389b73be72c	Sapiens: A Brief History of Humankind	Yuval Noah Harari	9780062316097	2014	Harvill Secker	English	443	An exploration of how Homo sapiens came to dominate the world and the forces that have shaped human society.	4	3	\N	D-001	909	PHYSICAL	NEW	2025-06-08 19:05:49.513	2025-06-08 19:05:49.738
72bf709f-dfd8-4c70-a663-246c037c5761	The Kite Runner	Khaled Hosseini	9781594631931	2003	Riverhead Books	English	371	A story of friendship and redemption set against the tumultuous backdrop of Afghanistan's recent history.	3	1	\N	A-008	813.6	PHYSICAL	GOOD	2025-06-08 19:05:49.565	2025-06-08 19:05:49.74
12f24e23-3825-4355-9961-b9caadea307e	Life of Pi	Yann Martel	9780156027328	2001	Knopf Canada	English	319	A philosophical adventure novel about a young Indian boy stranded on a lifeboat in the Pacific Ocean with a Bengal tiger.	3	2	\N	A-009	813.54	PHYSICAL	NEW	2025-06-08 19:05:49.567	2025-06-08 19:05:49.742
3ed9622c-0b59-4283-b023-f0558f039fe4	The Fault in Our Stars	John Green	9780525478812	2012	Dutton Books	English	313	A young adult novel about two teenagers with cancer who fall in love after meeting in a support group.	4	3	\N	A-010	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.57	2025-06-08 19:05:49.745
73f0fa9c-28db-4ed7-a2f0-466239db1c05	Gone Girl	Gillian Flynn	9780307588371	2012	Crown Publishing Group	English	419	A psychological thriller about a marriage gone terribly wrong when Amy Dunne disappears on her fifth wedding anniversary.	2	0	\N	C-004	813.6	PHYSICAL	GOOD	2025-06-08 19:05:49.572	2025-06-08 19:05:49.747
87e45671-922a-411d-ac55-2f3d7f6eb9d0	The Book Thief	Markus Zusak	9780375842207	2005	Picador	English	552	A novel narrated by Death about a young girl living with foster parents in Nazi Germany who finds solace in stealing books.	3	1	\N	A-011	823.92	PHYSICAL	GOOD	2025-06-08 19:05:49.575	2025-06-08 19:05:49.749
300dd977-5784-4934-abfd-cef33f9ad2e7	The Martian	Andy Weir	9780553418026	2011	Crown Publishing Group	English	369	A science fiction novel about an astronaut stranded on Mars who must survive using his ingenuity and scientific knowledge.	3	2	\N	B-004	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.578	2025-06-08 19:05:49.752
d93f4c3a-5c34-4425-90ab-5caa9e21e3c7	Educated	Tara Westover	9780399590504	2018	Random House	English	334	A memoir about a woman who grows up in a survivalist Mormon family and eventually pursues higher education.	3	3	\N	E-002	371.829	PHYSICAL	NEW	2025-06-08 19:05:49.585	2025-06-08 19:05:49.585
f9e1dfda-a0c8-4b06-946b-d611761ab04a	Becoming	Michelle Obama	9781524763138	2018	Crown Publishing Group	English	448	The memoir of former First Lady Michelle Obama, chronicling her life from childhood to her years in the White House.	4	4	\N	E-003	973.932	PHYSICAL	NEW	2025-06-08 19:05:49.588	2025-06-08 19:05:49.588
23200ed5-e012-4c40-b577-3972f3b526ab	The Subtle Art of Not Giving a F*ck	Mark Manson	9780062457714	2016	HarperOne	English	224	A counterintuitive approach to living a good life by focusing only on what truly matters and letting go of the rest.	3	3	\N	D-002	158.1	PHYSICAL	NEW	2025-06-08 19:05:49.592	2025-06-08 19:05:49.592
3a76b0a3-d8ad-4c40-9ead-e28388e98f8d	Atomic Habits	James Clear	9780735211292	2018	Avery	English	320	A comprehensive guide to building good habits and breaking bad ones through tiny changes that lead to remarkable results.	4	4	\N	D-003	158.1	PHYSICAL	NEW	2025-06-08 19:05:49.594	2025-06-08 19:05:49.594
e2efa663-50c8-4d66-82f2-27c56afbca40	The 7 Habits of Highly Effective People	Stephen R. Covey	9781451639619	1989	Free Press	English	381	A self-help book presenting an approach to being effective in attaining goals by aligning oneself to principles.	3	2	\N	D-004	158	PHYSICAL	GOOD	2025-06-08 19:05:49.596	2025-06-08 19:05:49.596
22266bff-428b-4d76-9246-935bd8890f4f	The Seven Husbands of Evelyn Hugo	Taylor Jenkins Reid	9781501161933	2017	Atria Books	English	400	A captivating novel about a reclusive Hollywood icon who finally decides to tell her story to a young journalist.	3	3	\N	A-012	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.602	2025-06-08 19:05:49.602
74aeee93-f48b-4cd1-96bd-34c0662313b4	Circe	Madeline Miller	9780316556347	2018	Little, Brown and Company	English	393	A novel that tells the story of Circe, the Greek goddess of magic, and her journey from a nymph to a powerful witch.	2	2	\N	F-004	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.605	2025-06-08 19:05:49.605
b6261db0-fb6d-4083-8afe-14e1a8fde795	Project Hail Mary	Andy Weir	9780593135204	2021	Ballantine Books	English	496	A science fiction novel about a lone astronaut who must save humanity from extinction while dealing with memory loss.	2	2	\N	B-005	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.608	2025-06-08 19:05:49.608
77dd0a42-fdaf-4545-8210-10a1fe537d4c	The Thursday Murder Club	Richard Osman	9781984880567	2020	Pamela Dorman Books	English	368	A mystery novel about four unlikely friends in a retirement village who meet weekly to investigate cold cases.	3	3	\N	C-007	823.92	PHYSICAL	NEW	2025-06-08 19:05:49.611	2025-06-08 19:05:49.611
8ea0f622-3bb5-448e-a99a-bd9010146e3d	The Midnight Library	Matt Haig	9780525559474	2020	Viking	English	288	A philosophical novel about a library that exists between life and death, where each book represents a different life path.	3	3	\N	A-013	823.92	PHYSICAL	NEW	2025-06-08 19:05:49.615	2025-06-08 19:05:49.615
64d580f8-8e41-4b2a-9dfa-e22afca62ae7	Klara and the Sun	Kazuo Ishiguro	9780593318171	2021	Knopf	English	303	A science fiction novel told from the perspective of Klara, an artificial friend designed to prevent loneliness.	2	2	\N	B-006	823.914	PHYSICAL	NEW	2025-06-08 19:05:49.617	2025-06-08 19:05:49.617
d2b9c044-8cd4-4a0a-9698-a5eae91be22b	The Guest List	Lucy Foley	9780062868930	2020	William Morrow	English	320	A psychological thriller set at a wedding on a remote island where secrets from the past threaten to destroy lives.	2	1	\N	C-008	823.92	PHYSICAL	NEW	2025-06-08 19:05:49.62	2025-06-08 19:05:49.62
4b7106b2-5e41-409d-9041-18cf15bb54ac	Normal People	Sally Rooney	9781984822178	2018	Hogarth	English	266	A novel following the complex relationship between two Irish teenagers, Connell and Marianne, from high school to university.	3	2	\N	A-014	823.92	PHYSICAL	NEW	2025-06-08 19:05:49.624	2025-06-08 19:05:49.624
726786a5-eecd-4866-b9d6-c9310ec09370	The Silent Patient	Alex Michaelides	9781250301697	2019	Celadon Books	English	336	A psychological thriller about a woman who refuses to speak after allegedly murdering her husband and the therapist determined to treat her.	3	2	\N	C-009	823.92	PHYSICAL	NEW	2025-06-08 19:05:49.627	2025-06-08 19:05:49.627
0d4420cd-79aa-46a5-9ef8-7d2933c1979c	The Murder of Roger Ackroyd	Agatha Christie	9780062073570	1926	William Collins & Sons	English	312	A classic Hercule Poirot mystery that revolutionized the detective fiction genre.	3	1	\N	C-001	823.912	PHYSICAL	GOOD	2025-06-08 19:05:49.507	2025-06-08 19:05:49.705
1b591ab6-cf19-4243-a0bf-d61eddd99262	Harry Potter and the Philosopher's Stone	J.K. Rowling	9780747532699	1997	Bloomsbury	English	223	The first book in the Harry Potter series, following young Harry as he discovers his magical heritage and attends Hogwarts.	5	3	\N	F-002	823.914	PHYSICAL	NEW	2025-06-08 19:05:49.54	2025-06-08 19:05:49.726
54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	Where the Crawdads Sing	Delia Owens	9780735219090	2018	G.P. Putnam's Sons	English	370	A mystery novel about a young woman who raised herself in the marshes of North Carolina and becomes a suspect in a murder case.	3	1	\N	C-006	813.6	PHYSICAL	NEW	2025-06-08 19:05:49.599	2025-06-08 19:05:49.754
\.


--
-- Data for Name: BookGenre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookGenre" (id, "bookId", "genreId") FROM stdin;
4b95ffb4-f247-4f59-8194-a27537a45db8	822b186b-5b96-40a1-9aec-bae9aaa42268	5c0fb49e-65ac-4099-adbc-b3fc5421845d
1eb146e7-68f0-4952-b2f6-5826b24c17fc	822b186b-5b96-40a1-9aec-bae9aaa42268	627c368c-d3e6-4566-8e8b-ce13922bd9e8
4d39ca95-5d2c-4260-846a-a0a59279cd1f	0eded5e8-ed4a-4c6c-9ec4-d1b01d0f3347	5c0fb49e-65ac-4099-adbc-b3fc5421845d
5105e254-ccd5-49e0-a3bd-7cb873c66fab	0eded5e8-ed4a-4c6c-9ec4-d1b01d0f3347	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
77c58750-54a4-4d51-be9a-6303fe52aed2	0eded5e8-ed4a-4c6c-9ec4-d1b01d0f3347	627c368c-d3e6-4566-8e8b-ce13922bd9e8
f5e1f630-2cc3-4c87-be0c-ff51cc3c1de5	bda036d9-f2ad-49eb-8e8b-eb35839f1bcf	5c0fb49e-65ac-4099-adbc-b3fc5421845d
3438dc84-76fe-4141-8e35-5fba077139d8	bda036d9-f2ad-49eb-8e8b-eb35839f1bcf	627c368c-d3e6-4566-8e8b-ce13922bd9e8
fcb17409-c5e4-47b4-bb69-84e0762b1908	6520e6b7-afcd-429d-8446-739cffbf5607	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
d89216aa-5393-4616-9a62-6dd626f49245	d2b9c044-8cd4-4a0a-9698-a5eae91be22b	c35ecf45-9591-49d3-914e-7e39a9eebedb
c54a21d7-6070-41e8-b257-18384062cf2a	d2b9c044-8cd4-4a0a-9698-a5eae91be22b	5c0fb49e-65ac-4099-adbc-b3fc5421845d
c13d1ec8-df28-4a35-a6bc-0e78ceeafc3c	4b7106b2-5e41-409d-9041-18cf15bb54ac	5c0fb49e-65ac-4099-adbc-b3fc5421845d
bc967eda-6865-4aae-aa3a-603dbe9ed2c3	726786a5-eecd-4866-b9d6-c9310ec09370	c35ecf45-9591-49d3-914e-7e39a9eebedb
ac4c10bb-a48d-4919-81c6-fba6dfd49eeb	726786a5-eecd-4866-b9d6-c9310ec09370	5c0fb49e-65ac-4099-adbc-b3fc5421845d
4e8c0126-47ef-4672-b3a0-88768216622e	6520e6b7-afcd-429d-8446-739cffbf5607	5c0fb49e-65ac-4099-adbc-b3fc5421845d
6b366f9b-35a9-4ea6-9363-d955dbb8e4de	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	c35ecf45-9591-49d3-914e-7e39a9eebedb
1d4c8c50-955f-4d88-84c7-5eebfb8452c6	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	5c0fb49e-65ac-4099-adbc-b3fc5421845d
f1c309e4-2794-444d-881f-1eedebe07731	d2ba1e74-b322-4d93-b0c1-d389b73be72c	2e144220-e063-4338-8ebc-62e678d5e263
c649a6b8-60c0-4413-be4e-19c310b92b30	96a0d633-3bc9-4aa6-a497-eebe98146906	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
c9d7332b-a4a8-4d61-855e-6f8dfd646a4d	96a0d633-3bc9-4aa6-a497-eebe98146906	5c0fb49e-65ac-4099-adbc-b3fc5421845d
0a8c3252-735f-4b0e-8206-a0ce5f4bef48	5276bdab-2a06-4857-b2ed-df5f742193db	4a2dc243-003b-49d0-a8fe-ec115a3de063
1094b679-bf69-43b1-b3e2-7ab5142f7166	5276bdab-2a06-4857-b2ed-df5f742193db	2e144220-e063-4338-8ebc-62e678d5e263
de142ce6-fe4d-426f-8b8f-a273b6320273	e4550ff2-af23-4044-a935-9b9ac249a9da	5c0fb49e-65ac-4099-adbc-b3fc5421845d
94466a76-4f52-423c-b93c-4d1644e3c002	e4550ff2-af23-4044-a935-9b9ac249a9da	627c368c-d3e6-4566-8e8b-ce13922bd9e8
e25c8a94-2592-4f40-90ca-5ef7aaa58512	7448099d-02fc-493f-a70f-6077ce6e2c39	5c0fb49e-65ac-4099-adbc-b3fc5421845d
2c9900fe-2d6e-42e3-9669-fddf38d85c49	7448099d-02fc-493f-a70f-6077ce6e2c39	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
672725e3-616a-4e1a-b9cf-a6238ec15ab6	4709a8da-8881-494e-978b-dafe787570a6	5c0fb49e-65ac-4099-adbc-b3fc5421845d
35b85dc4-b5ee-45be-8dca-dab225083c4c	4709a8da-8881-494e-978b-dafe787570a6	627c368c-d3e6-4566-8e8b-ce13922bd9e8
42be16a4-0bce-4ffa-9d04-585e4285fae1	1b591ab6-cf19-4243-a0bf-d61eddd99262	5c0fb49e-65ac-4099-adbc-b3fc5421845d
027599b8-1a8c-4345-ae9c-197f7b7d24f0	1b591ab6-cf19-4243-a0bf-d61eddd99262	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
c3603ca4-01ad-440f-85d4-46419bcbaed6	6778a58f-d435-4dd0-bd20-407598a81167	c35ecf45-9591-49d3-914e-7e39a9eebedb
84a9106a-ca9c-4584-a340-6e1d65f3a043	6778a58f-d435-4dd0-bd20-407598a81167	5c0fb49e-65ac-4099-adbc-b3fc5421845d
63e545c4-90df-4662-a607-6a3d51e51ddc	fb14b285-310a-4198-aeeb-b9de0d050967	5c0fb49e-65ac-4099-adbc-b3fc5421845d
8537d075-2413-4bc2-80ca-3b7125911ed3	3fb36941-91f3-4729-b2f5-606d54e4e729	5c0fb49e-65ac-4099-adbc-b3fc5421845d
af19f8ab-41b7-442b-aa40-8b66e682e640	3fb36941-91f3-4729-b2f5-606d54e4e729	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
b8131560-8776-4eb6-ad83-9a0893f38d9a	3fb36941-91f3-4729-b2f5-606d54e4e729	627c368c-d3e6-4566-8e8b-ce13922bd9e8
e9958be7-802c-49f4-a6af-441602365202	9d5b7dec-0805-4a4f-bc3f-49c308c6e3d6	5c0fb49e-65ac-4099-adbc-b3fc5421845d
4c5950c6-85e1-46a0-ac11-e3a17cac1816	9d5b7dec-0805-4a4f-bc3f-49c308c6e3d6	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
617a109a-fa37-4ef1-a924-d693c46dca2d	35816982-20b8-4b41-9492-e3688c75959c	5c0fb49e-65ac-4099-adbc-b3fc5421845d
c933a9fa-24d3-41ef-a18d-a5e27d08cf50	35816982-20b8-4b41-9492-e3688c75959c	627c368c-d3e6-4566-8e8b-ce13922bd9e8
ac81f195-bd90-4125-9e64-49c98faaab08	40660a64-a34d-4af4-83e1-c05f4c27e23f	c35ecf45-9591-49d3-914e-7e39a9eebedb
4581e796-e30d-4741-a842-b35eaa5aaedb	40660a64-a34d-4af4-83e1-c05f4c27e23f	5c0fb49e-65ac-4099-adbc-b3fc5421845d
1c190a18-e78a-444c-8e54-407db109a774	72bf709f-dfd8-4c70-a663-246c037c5761	5c0fb49e-65ac-4099-adbc-b3fc5421845d
d72a36fe-dcd8-4abc-98be-e8d4029eb1cd	12f24e23-3825-4355-9961-b9caadea307e	5c0fb49e-65ac-4099-adbc-b3fc5421845d
daebfaa1-107e-4741-8971-f3501ee52623	3ed9622c-0b59-4283-b023-f0558f039fe4	5c0fb49e-65ac-4099-adbc-b3fc5421845d
7b07c49a-e1bd-4f96-a51c-d2e711a2ebec	73f0fa9c-28db-4ed7-a2f0-466239db1c05	c35ecf45-9591-49d3-914e-7e39a9eebedb
42859f47-a5c1-4d70-ac0b-39e2d96c4db2	73f0fa9c-28db-4ed7-a2f0-466239db1c05	5c0fb49e-65ac-4099-adbc-b3fc5421845d
338afd96-a041-4fe0-81d4-4835a80df15c	87e45671-922a-411d-ac55-2f3d7f6eb9d0	5c0fb49e-65ac-4099-adbc-b3fc5421845d
3dd63d75-c47c-429c-bda0-4a928cae6547	300dd977-5784-4934-abfd-cef33f9ad2e7	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
ab245271-10c2-471d-9fde-859789439383	300dd977-5784-4934-abfd-cef33f9ad2e7	5c0fb49e-65ac-4099-adbc-b3fc5421845d
17c9c132-a1dc-43f1-94a3-4535d001b897	9b1366ed-620e-4fed-acd4-a0a54dc9b2ea	c35ecf45-9591-49d3-914e-7e39a9eebedb
895096e6-db47-4238-b654-70d69dcca44b	9b1366ed-620e-4fed-acd4-a0a54dc9b2ea	5c0fb49e-65ac-4099-adbc-b3fc5421845d
4f7426ae-e497-4398-a1a6-4bb2f8a195a1	d93f4c3a-5c34-4425-90ab-5caa9e21e3c7	4a2dc243-003b-49d0-a8fe-ec115a3de063
9f7432e1-ffc7-414c-9650-3a0899c47524	d93f4c3a-5c34-4425-90ab-5caa9e21e3c7	2e144220-e063-4338-8ebc-62e678d5e263
869bb15b-7560-4def-8c90-1ea9630146af	f9e1dfda-a0c8-4b06-946b-d611761ab04a	4a2dc243-003b-49d0-a8fe-ec115a3de063
3fc692a5-bed5-417b-b6b6-6f93fb2c1ea6	f9e1dfda-a0c8-4b06-946b-d611761ab04a	2e144220-e063-4338-8ebc-62e678d5e263
afaf8545-1d2d-4552-8372-4770c4491b70	23200ed5-e012-4c40-b577-3972f3b526ab	2e144220-e063-4338-8ebc-62e678d5e263
49bbf4be-a121-4825-95fa-160a3341d68b	3a76b0a3-d8ad-4c40-9ead-e28388e98f8d	2e144220-e063-4338-8ebc-62e678d5e263
6ddf6a47-2ffd-4f4b-ae6a-06e8b8f4b87c	e2efa663-50c8-4d66-82f2-27c56afbca40	2e144220-e063-4338-8ebc-62e678d5e263
08c9b1e3-f672-4feb-938a-f638c38e94a6	54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	c35ecf45-9591-49d3-914e-7e39a9eebedb
e23aec3b-bf22-4f38-a8d3-6836a7f12a10	54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	5c0fb49e-65ac-4099-adbc-b3fc5421845d
5f68d278-d976-4ffd-814a-d47cab22cc5f	22266bff-428b-4d76-9246-935bd8890f4f	5c0fb49e-65ac-4099-adbc-b3fc5421845d
af5d5fed-74b1-4a2d-a075-29fb1b05264a	74aeee93-f48b-4cd1-96bd-34c0662313b4	5c0fb49e-65ac-4099-adbc-b3fc5421845d
f9a2aab4-080c-42ad-b8b5-cb6e061027c2	74aeee93-f48b-4cd1-96bd-34c0662313b4	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
0ecc9f00-a79b-4b75-95f6-27a3391504ce	b6261db0-fb6d-4083-8afe-14e1a8fde795	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
e7fc669b-4782-41e9-afa9-e0af35c92935	b6261db0-fb6d-4083-8afe-14e1a8fde795	5c0fb49e-65ac-4099-adbc-b3fc5421845d
0b5bb2d0-f99b-4cdf-adf8-7912628e700a	77dd0a42-fdaf-4545-8210-10a1fe537d4c	c35ecf45-9591-49d3-914e-7e39a9eebedb
1d520e68-aafb-488e-80b1-ceb67069185e	77dd0a42-fdaf-4545-8210-10a1fe537d4c	5c0fb49e-65ac-4099-adbc-b3fc5421845d
6cba24f8-2fbf-463e-a81b-c544aba83f9d	8ea0f622-3bb5-448e-a99a-bd9010146e3d	5c0fb49e-65ac-4099-adbc-b3fc5421845d
20dcbbce-664d-4bb2-8978-4c8c784e7f0b	64d580f8-8e41-4b2a-9dfa-e22afca62ae7	2f4a93de-36da-430b-bbd4-93faa2a7d7b3
2e434f8c-55b6-4121-bb9b-f3f120bc7ec2	64d580f8-8e41-4b2a-9dfa-e22afca62ae7	5c0fb49e-65ac-4099-adbc-b3fc5421845d
\.


--
-- Data for Name: Borrowing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Borrowing" (id, "userId", "bookId", "borrowDate", "dueDate", "returnDate", status, "renewalCount", "returnNotes", "processedBy", "createdAt", "updatedAt") FROM stdin;
6705a51b-a17f-4432-a445-07151d4982cb	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	2025-06-08 19:05:49.704	2025-06-15 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.704	2025-06-08 19:05:49.704
570838b3-3280-4bf2-bc99-31abd28d1f8c	d3da5f08-5d18-4954-9907-63d9bdfaa8dd	96a0d633-3bc9-4aa6-a497-eebe98146906	2025-06-08 19:05:49.707	2025-06-22 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.707	2025-06-08 19:05:49.707
52b78d86-ef56-4890-8c3c-6cd1435bead0	bdc56409-7112-4e84-9878-0fed573effdc	822b186b-5b96-40a1-9aec-bae9aaa42268	2025-06-08 19:05:49.709	2025-06-13 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.709	2025-06-08 19:05:49.709
f6798d81-48b5-4811-a33a-3751ab9c8ee2	2c8d2252-759d-460a-965b-bc8d5d656d1b	0eded5e8-ed4a-4c6c-9ec4-d1b01d0f3347	2025-06-08 19:05:49.711	2025-06-18 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.711	2025-06-08 19:05:49.711
abbb4ef9-f077-4fb7-8e9d-43fb4e7a126a	b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	bda036d9-f2ad-49eb-8e8b-eb35839f1bcf	2025-06-08 19:05:49.714	2025-06-16 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.714	2025-06-08 19:05:49.714
ab8b43a8-8233-438a-9ec9-eecfda560d5f	7656732b-435b-4111-9562-89fe21b685ec	6520e6b7-afcd-429d-8446-739cffbf5607	2025-06-08 19:05:49.716	2025-06-20 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.716	2025-06-08 19:05:49.716
891280a2-e6be-49a3-87c6-1bc65c0a0fa7	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	e4550ff2-af23-4044-a935-9b9ac249a9da	2025-06-08 19:05:49.72	2025-06-14 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.72	2025-06-08 19:05:49.72
f0e6b6f4-aecd-4b50-856d-3c9eb49725ce	5074f620-544a-4de7-9bb9-31f2a6a08ee6	4709a8da-8881-494e-978b-dafe787570a6	2025-06-08 19:05:49.723	2025-06-17 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.723	2025-06-08 19:05:49.723
81becaec-efb9-45a1-b0e4-39d0561a6317	a589aec3-81ef-4f85-9a11-83f616208dc6	1b591ab6-cf19-4243-a0bf-d61eddd99262	2025-06-08 19:05:49.726	2025-06-19 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.726	2025-06-08 19:05:49.726
250c6070-0c54-4c87-b378-6e97cceb713c	b4e8d0e5-8d32-465f-82db-b074acd41f2e	7448099d-02fc-493f-a70f-6077ce6e2c39	2025-06-08 19:05:49.729	2025-06-21 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.729	2025-06-08 19:05:49.729
bac8dd69-7648-4cf0-b402-199edf881b67	0b2aea8d-af63-457e-91fa-bf84c949cfb7	40660a64-a34d-4af4-83e1-c05f4c27e23f	2025-06-08 19:05:49.731	2025-06-06 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.731	2025-06-08 19:05:49.731
72811f3f-0c71-4590-be25-69ec84a561cc	bdc56409-7112-4e84-9878-0fed573effdc	9d5b7dec-0805-4a4f-bc3f-49c308c6e3d6	2025-06-08 19:05:49.733	2025-06-12 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.733	2025-06-08 19:05:49.733
18efe188-0237-40ca-a983-8f4546c7b60a	2c8d2252-759d-460a-965b-bc8d5d656d1b	d2ba1e74-b322-4d93-b0c1-d389b73be72c	2025-06-08 19:05:49.736	2025-06-23 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.736	2025-06-08 19:05:49.736
a1fc8b2a-5973-4cc8-8f35-b33b8631c5c2	b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	72bf709f-dfd8-4c70-a663-246c037c5761	2025-06-08 19:05:49.739	2025-06-07 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.739	2025-06-08 19:05:49.739
d236dfd6-6e66-4822-8ebe-6dbaf5dfd3a0	7656732b-435b-4111-9562-89fe21b685ec	12f24e23-3825-4355-9961-b9caadea307e	2025-06-08 19:05:49.741	2025-06-15 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.741	2025-06-08 19:05:49.741
ec5ba8ce-d68e-4989-99a8-ee9c6712dd43	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	3ed9622c-0b59-4283-b023-f0558f039fe4	2025-06-08 19:05:49.744	2025-06-11 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.744	2025-06-08 19:05:49.744
afcb3e4c-d8ef-4117-9771-8efa03d413cb	5074f620-544a-4de7-9bb9-31f2a6a08ee6	73f0fa9c-28db-4ed7-a2f0-466239db1c05	2025-06-08 19:05:49.746	2025-06-05 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.746	2025-06-08 19:05:49.746
c448b261-d9f5-4f8e-9b41-b7ac5fe70c85	a589aec3-81ef-4f85-9a11-83f616208dc6	87e45671-922a-411d-ac55-2f3d7f6eb9d0	2025-06-08 19:05:49.748	2025-06-24 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.748	2025-06-08 19:05:49.748
d7c2b5b4-2196-4b41-8e5f-7dad8bfcbdbc	b4e8d0e5-8d32-465f-82db-b074acd41f2e	300dd977-5784-4934-abfd-cef33f9ad2e7	2025-06-08 19:05:49.751	2025-06-10 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.751	2025-06-08 19:05:49.751
0f45a768-4348-4540-a241-157d53a50db4	0b2aea8d-af63-457e-91fa-bf84c949cfb7	54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	2025-06-08 19:05:49.753	2025-06-26 19:05:49.703	\N	BORROWED	0	\N	\N	2025-06-08 19:05:49.753	2025-06-08 19:05:49.753
\.


--
-- Data for Name: Fine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fine" (id, "userId", "borrowingId", amount, reason, status, "paidDate", "createdAt", "updatedAt") FROM stdin;
764387e7-04d1-4b9b-b89a-cf2ee85a5b2d	2c8d2252-759d-460a-965b-bc8d5d656d1b	f6798d81-48b5-4811-a33a-3751ab9c8ee2	1000	Because I like it, duh!	UNPAID	\N	2025-06-08 19:35:34.13	2025-06-08 19:35:34.13
\.


--
-- Data for Name: Genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Genre" (id, name, description, "createdAt", "updatedAt") FROM stdin;
4a2dc243-003b-49d0-a8fe-ec115a3de063	Biography	Biographical works and memoirs	2025-06-08 19:05:49.474	2025-06-08 19:05:49.474
2f4a93de-36da-430b-bbd4-93faa2a7d7b3	Science Fiction	Science fiction and futuristic stories	2025-06-08 19:05:49.473	2025-06-08 19:05:49.473
c35ecf45-9591-49d3-914e-7e39a9eebedb	Mystery	Mystery and detective stories	2025-06-08 19:05:49.474	2025-06-08 19:05:49.474
627c368c-d3e6-4566-8e8b-ce13922bd9e8	Classic	Classic literature and timeless works	2025-06-08 19:05:49.474	2025-06-08 19:05:49.474
5c0fb49e-65ac-4099-adbc-b3fc5421845d	Fiction	Fictional literature and novels	2025-06-08 19:05:49.473	2025-06-08 19:05:49.473
2e144220-e063-4338-8ebc-62e678d5e263	Non-Fiction	Non-fictional books and educational material	2025-06-08 19:05:49.474	2025-06-08 19:05:49.474
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, message, type, "isRead", "createdAt", "updatedAt", "actionUrl", metadata) FROM stdin;
fc6f11c5-e564-40d0-899c-41340304623a	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	Book Due Soon	Your book 'The Murder of Roger Ackroyd' is due in 3 days. Please return or renew it.	DUE_DATE_REMINDER	f	2025-06-08 19:05:49.773	2025-06-08 19:05:49.773	/dashboard/borrowings	\N
c7bde90e-da8f-4dbd-a36e-76ed15a7ba23	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	Welcome to the Library!	Welcome to our digital library system. You can browse books, make reservations, and manage your borrowings from your dashboard.	GENERAL	f	2025-06-08 19:05:49.774	2025-06-08 19:05:49.774	/books	\N
d539eda5-e841-40f0-87e0-de2704b0b95a	d3da5f08-5d18-4954-9907-63d9bdfaa8dd	Renewal Successful	Your book 'The Hitchhiker's Guide to the Galaxy' has been successfully renewed. New due date: 6/30/2025	RENEWAL_SUCCESS	f	2025-06-08 19:05:49.775	2025-06-08 19:05:49.775	/dashboard/borrowings	\N
d7e6c117-dffc-4882-ae7f-e8fc37c9efcc	bdc56409-7112-4e84-9878-0fed573effdc	Fine Issued	A late return fine of $2.50 has been issued for 'To Kill a Mockingbird'. Please pay at the circulation desk.	FINE_ISSUED	f	2025-06-08 19:05:49.776	2025-06-08 19:05:49.776	/dashboard/fines	\N
bd54465a-a3fe-412f-8696-3e2a36f9b24d	2c8d2252-759d-460a-965b-bc8d5d656d1b	System Maintenance Notice	The library system will undergo maintenance this Sunday from 2 AM to 6 AM. Online services may be temporarily unavailable.	SYSTEM_MAINTENANCE	f	2025-06-08 19:05:49.777	2025-06-08 19:05:49.777	\N	\N
4700a639-9faa-402c-83fa-b848c8ae73e3	bdc56409-7112-4e84-9878-0fed573effdc	Test	Test	SYSTEM_MAINTENANCE	f	2025-06-08 19:32:31.529	2025-06-08 19:32:31.529	/	\N
65b23863-4301-4aab-9951-cff84d5c349d	2c8d2252-759d-460a-965b-bc8d5d656d1b	Fine Issued	A fine of $1000 has been issued for "1984". Reason: Because I like it, duh!	FINE_ISSUED	f	2025-06-08 19:35:34.133	2025-06-08 19:35:34.133	/dashboard	\N
52ee4844-6c3a-418e-8ef9-d7302493328e	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
c3401708-1c81-49b6-914c-6617c0f6ee50	5074f620-544a-4de7-9bb9-31f2a6a08ee6	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
1d91ac18-c030-4e64-be06-6e578e75d85f	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
9f8b8cde-728a-41bf-bb3c-b1040c203203	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
9afe7d14-3264-45b6-9b3f-2e8bed9390c5	7656732b-435b-4111-9562-89fe21b685ec	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
06001451-f327-4097-a23f-43bff97b5546	b4e8d0e5-8d32-465f-82db-b074acd41f2e	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
dc42af4f-885b-46a3-8a6e-4c8c85670352	2c8d2252-759d-460a-965b-bc8d5d656d1b	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
6de8f35c-2fa9-47e6-9c90-5ddea46d477c	b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
2af9665d-8b70-4c4d-81c9-deb8b6713df8	a589aec3-81ef-4f85-9a11-83f616208dc6	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
647b83a0-1153-4d45-a770-cb17828f9e29	bdc56409-7112-4e84-9878-0fed573effdc	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
7ec29e48-6ffb-499f-8dc8-e2a53fad2c09	d3da5f08-5d18-4954-9907-63d9bdfaa8dd	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
aa740c9a-258e-473f-87af-ff2cf27f1505	0b2aea8d-af63-457e-91fa-bf84c949cfb7	Testing admin dashboard	Lorem ipsum	SYSTEM_MAINTENANCE	f	2025-06-08 20:30:51.387	2025-06-08 20:30:51.387	/books	\N
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reservation" (id, "userId", "bookId", "reservationDate", status, notified, "expiryDate", "createdAt", "updatedAt") FROM stdin;
c99193df-7387-4d83-9832-8e9d0929504e	bdc56409-7112-4e84-9878-0fed573effdc	6520e6b7-afcd-429d-8446-739cffbf5607	2025-06-08 19:05:49.779	PENDING	f	\N	2025-06-08 19:05:49.779	2025-06-08 19:05:49.779
fbf8006e-86c6-4a46-aaff-bb4392f884f4	2c8d2252-759d-460a-965b-bc8d5d656d1b	1b591ab6-cf19-4243-a0bf-d61eddd99262	2025-06-08 19:05:49.781	READY	f	2025-06-11 19:05:49.78	2025-06-08 19:05:49.781	2025-06-08 19:05:49.781
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "userId", "bookId", rating, comment, "createdAt", "updatedAt") FROM stdin;
06365c9b-981e-4977-b5f3-fc39a9129b40	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	1b591ab6-cf19-4243-a0bf-d61eddd99262	4	Interesting perspective on familiar themes.	2025-06-06 22:35:12.004	2025-06-08 19:05:49.636
51a8af04-4e14-47c1-bded-a1f1e4bfec53	b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	77dd0a42-fdaf-4545-8210-10a1fe537d4c	3	Great introduction to the author's work.	2025-05-21 02:16:29.928	2025-06-08 19:05:49.638
1a569e6e-ecfb-4e42-965a-fe271842cefe	a589aec3-81ef-4f85-9a11-83f616208dc6	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	5	Captivating from the very first page.	2025-06-06 15:00:00.063	2025-06-08 19:05:49.64
1eaf192b-7983-4374-ba3b-0bc129a7abba	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	64d580f8-8e41-4b2a-9dfa-e22afca62ae7	4	\N	2025-05-27 05:17:09.68	2025-06-08 19:05:49.641
b82dff4b-a517-43ba-a594-4f569e2c9ad3	2c8d2252-759d-460a-965b-bc8d5d656d1b	9d5b7dec-0805-4a4f-bc3f-49c308c6e3d6	4	\N	2025-06-06 00:44:32.93	2025-06-08 19:05:49.643
63fe9ccd-19f2-4382-aee7-5582c16f6309	2c8d2252-759d-460a-965b-bc8d5d656d1b	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	4	\N	2025-06-01 22:14:13.57	2025-06-08 19:05:49.644
4e19f4c6-81bf-44f1-8131-8e7ec5335935	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	d2ba1e74-b322-4d93-b0c1-d389b73be72c	2	\N	2025-06-03 15:22:10.9	2025-06-08 19:05:49.646
8f2fc7f1-5db9-4ec4-86d9-8bc9ec4a4c58	2c8d2252-759d-460a-965b-bc8d5d656d1b	54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	3	\N	2025-05-21 05:57:52.627	2025-06-08 19:05:49.648
35c8abf3-b143-4789-964a-7949f518e3e6	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	72bf709f-dfd8-4c70-a663-246c037c5761	5	A real eye-opener on the subject matter.	2025-05-23 23:05:25.911	2025-06-08 19:05:49.65
3bfdf2ce-bae2-41c1-8ab5-b346f56e2485	5074f620-544a-4de7-9bb9-31f2a6a08ee6	726786a5-eecd-4866-b9d6-c9310ec09370	3	Memorable characters and vivid descriptions.	2025-06-06 10:09:47.97	2025-06-08 19:05:49.652
823f505a-9b52-4411-b8cc-61b1ea5891c4	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	9b1366ed-620e-4fed-acd4-a0a54dc9b2ea	4	Not my cup of tea, but I can see why others love it.	2025-05-29 19:47:33.755	2025-06-08 19:05:49.653
31995ce7-59f6-485d-9dd4-38e29d1906aa	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	e2efa663-50c8-4d66-82f2-27c56afbca40	3	Rich in detail and atmosphere.	2025-05-24 08:06:06.02	2025-06-08 19:05:49.655
34a5780d-cc63-49c7-b390-8085799f57cc	d3da5f08-5d18-4954-9907-63d9bdfaa8dd	73f0fa9c-28db-4ed7-a2f0-466239db1c05	3	Exceeded my expectations completely.	2025-05-21 15:44:57.723	2025-06-08 19:05:49.656
6154ae3c-eab9-4515-b203-4bbab99c4630	bdc56409-7112-4e84-9878-0fed573effdc	64d580f8-8e41-4b2a-9dfa-e22afca62ae7	3	Well-paced with excellent character arcs.	2025-05-31 14:02:15.227	2025-06-08 19:05:49.657
b26e1278-90b6-43df-a25e-2f2d759a0714	0b2aea8d-af63-457e-91fa-bf84c949cfb7	35816982-20b8-4b41-9492-e3688c75959c	4	\N	2025-05-29 20:32:10.634	2025-06-08 19:05:49.659
716819d6-5d24-46ea-8a6b-0637375ba2b9	b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	b6261db0-fb6d-4083-8afe-14e1a8fde795	1	\N	2025-05-12 22:28:45.218	2025-06-08 19:05:49.66
bced6051-a336-4497-a325-380ed44b5b43	a589aec3-81ef-4f85-9a11-83f616208dc6	4709a8da-8881-494e-978b-dafe787570a6	4	Perfect for readers who enjoy deep stories.	2025-05-26 22:25:34.06	2025-06-08 19:05:49.661
2a6ef117-ba3a-4dab-b8c1-fddab1b82fd0	2c8d2252-759d-460a-965b-bc8d5d656d1b	e2efa663-50c8-4d66-82f2-27c56afbca40	3	Great for book club discussions.	2025-06-08 01:22:14.711	2025-06-08 19:05:49.662
5c192b81-2017-4942-b45d-cfee8b8a63c5	bdc56409-7112-4e84-9878-0fed573effdc	6520e6b7-afcd-429d-8446-739cffbf5607	5	\N	2025-05-14 00:14:48.125	2025-06-08 19:05:49.664
4e308a85-7c65-48bc-b9a0-bc8eb32c66f2	bdc56409-7112-4e84-9878-0fed573effdc	12f24e23-3825-4355-9961-b9caadea307e	3	\N	2025-05-30 11:53:31.79	2025-06-08 19:05:49.666
51f49059-a8a4-463f-9057-733142e8b4bd	bdc56409-7112-4e84-9878-0fed573effdc	4709a8da-8881-494e-978b-dafe787570a6	3	The ending was unexpected and satisfying.	2025-05-25 04:56:25.483	2025-06-08 19:05:49.667
227b3a47-f7be-4396-a932-65e351aa669c	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	d2b9c044-8cd4-4a0a-9698-a5eae91be22b	2	Great storytelling and well-developed characters.	2025-05-29 01:41:06.018	2025-06-08 19:05:49.669
a5fa75dd-8213-48aa-869f-d196ed99b0ff	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	74aeee93-f48b-4cd1-96bd-34c0662313b4	4	Rich in detail and atmosphere.	2025-06-05 15:13:24.285	2025-06-08 19:05:49.67
3be3b93d-d3d1-43a3-82c5-ccbcc1d2ee6e	5074f620-544a-4de7-9bb9-31f2a6a08ee6	fb14b285-310a-4198-aeeb-b9de0d050967	5	\N	2025-05-19 21:57:39.415	2025-06-08 19:05:49.671
c51c1d94-338f-4849-bad1-1b8083ecce7f	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	22266bff-428b-4d76-9246-935bd8890f4f	4	Beautifully written with deep insights.	2025-05-27 01:22:48.075	2025-06-08 19:05:49.672
8ac880b2-a278-4417-8e43-c66d31ea03dc	a589aec3-81ef-4f85-9a11-83f616208dc6	96a0d633-3bc9-4aa6-a497-eebe98146906	4	Well-researched and informative.	2025-05-25 19:19:28.158	2025-06-08 19:05:49.674
6f63f751-491b-4bc1-8913-c7ec22c95265	bdc56409-7112-4e84-9878-0fed573effdc	87e45671-922a-411d-ac55-2f3d7f6eb9d0	2	\N	2025-05-15 20:17:26.997	2025-06-08 19:05:49.675
e608ccd8-8048-4030-a645-5245cf85383e	d3da5f08-5d18-4954-9907-63d9bdfaa8dd	d93f4c3a-5c34-4425-90ab-5caa9e21e3c7	1	Could not stop reading once I started.	2025-05-12 23:40:36.25	2025-06-08 19:05:49.676
cde7b7bc-4879-4c2b-b956-f591bd5cc6ab	76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	9b1366ed-620e-4fed-acd4-a0a54dc9b2ea	5	\N	2025-05-13 15:20:36.474	2025-06-08 19:05:49.677
20a36a09-509f-4afb-85a5-2cabfc374aa6	0b2aea8d-af63-457e-91fa-bf84c949cfb7	d2b9c044-8cd4-4a0a-9698-a5eae91be22b	5	Amazing world-building and character development.	2025-06-03 13:08:15.942	2025-06-08 19:05:49.678
0612e603-7246-41cc-9ee4-7b2a61b7afe3	d9a4b29d-d3c9-4f3f-832a-838b353d9e89	77dd0a42-fdaf-4545-8210-10a1fe537d4c	5	Well-paced with excellent character arcs.	2025-05-19 23:47:58.341	2025-06-08 19:05:49.679
c46abf4a-8d80-4de1-b3a5-1881cdff6227	b4e8d0e5-8d32-465f-82db-b074acd41f2e	726786a5-eecd-4866-b9d6-c9310ec09370	5	\N	2025-05-12 06:54:49.689	2025-06-08 19:05:49.68
eac7be09-6e72-4c69-a78c-6f70ed7cba75	b4e8d0e5-8d32-465f-82db-b074acd41f2e	7448099d-02fc-493f-a70f-6077ce6e2c39	4	Captivating from the very first page.	2025-05-11 17:26:03.829	2025-06-08 19:05:49.682
0d919e36-560c-4c93-8277-17c851094618	bdc56409-7112-4e84-9878-0fed573effdc	1b591ab6-cf19-4243-a0bf-d61eddd99262	1	Brilliant writing style and engaging plot.	2025-05-10 02:55:39.304	2025-06-08 19:05:49.683
c0a06dc4-4448-41fa-9267-5b6de2e9e19e	0b2aea8d-af63-457e-91fa-bf84c949cfb7	87e45671-922a-411d-ac55-2f3d7f6eb9d0	1	Fantastic character development throughout.	2025-05-17 20:15:56.599	2025-06-08 19:05:49.684
a3d219e0-2f95-4d24-8bd1-776cfff18475	bdc56409-7112-4e84-9878-0fed573effdc	7448099d-02fc-493f-a70f-6077ce6e2c39	5	A rollercoaster of emotions.	2025-05-16 11:54:16.701	2025-06-08 19:05:49.685
19631b45-bbe7-4093-9ae7-8aa44ce720f5	b4e8d0e5-8d32-465f-82db-b074acd41f2e	73f0fa9c-28db-4ed7-a2f0-466239db1c05	5	Well-researched and informative.	2025-05-29 07:45:34.997	2025-06-08 19:05:49.686
3851e4a1-66a8-4fb0-aa3f-243c985cad29	8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	40660a64-a34d-4af4-83e1-c05f4c27e23f	5	\N	2025-05-28 07:17:21.233	2025-06-08 19:05:49.687
c6dd74a0-9c1c-41b5-9356-d895518b4cd9	5074f620-544a-4de7-9bb9-31f2a6a08ee6	e2efa663-50c8-4d66-82f2-27c56afbca40	4	Couldn't recommend this more highly.	2025-06-01 23:51:30.41	2025-06-08 19:05:49.69
91f4ab1e-ce48-407b-ba08-ae9e457646ed	2c8d2252-759d-460a-965b-bc8d5d656d1b	40660a64-a34d-4af4-83e1-c05f4c27e23f	4	\N	2025-05-25 09:07:16.864	2025-06-08 19:05:49.692
357ecefa-4893-4bfc-b88f-8fb5b280fcfe	b4e8d0e5-8d32-465f-82db-b074acd41f2e	3a76b0a3-d8ad-4c40-9ead-e28388e98f8d	5	Absolutely fantastic! Couldn't put it down.	2025-05-15 11:20:58.72	2025-06-08 19:05:49.693
bc4c6a28-cf31-4a3d-84df-197aa58008dc	a589aec3-81ef-4f85-9a11-83f616208dc6	6778a58f-d435-4dd0-bd20-407598a81167	5	\N	2025-05-26 05:27:56.369	2025-06-08 19:05:49.694
a84397ff-8ca3-4fd5-a77c-cbf52d9bf099	7656732b-435b-4111-9562-89fe21b685ec	77dd0a42-fdaf-4545-8210-10a1fe537d4c	3	Exceeded my expectations completely.	2025-06-08 13:14:01.916	2025-06-08 19:05:49.696
7cf3c194-5c6b-4aad-92b4-4b7a04e3fa38	5074f620-544a-4de7-9bb9-31f2a6a08ee6	b6261db0-fb6d-4083-8afe-14e1a8fde795	3	\N	2025-06-07 22:58:08.584	2025-06-08 19:05:49.697
6a6b545f-6f77-47c7-abd1-8cf853e0a63a	0b2aea8d-af63-457e-91fa-bf84c949cfb7	0d4420cd-79aa-46a5-9ef8-7d2933c1979c	4	Amazing world-building and character development.	2025-05-15 05:23:15.767	2025-06-08 19:05:49.699
e8ac4c55-269b-418c-a50c-b6eacaba2f29	5074f620-544a-4de7-9bb9-31f2a6a08ee6	40660a64-a34d-4af4-83e1-c05f4c27e23f	3	Engaging and thought-provoking content.	2025-05-23 16:28:03.944	2025-06-08 19:05:49.701
f61d065a-0435-49ba-ba44-0a0e962e0c03	7656732b-435b-4111-9562-89fe21b685ec	54f7bbb0-8136-48f2-ad7d-a1f0b47bec37	1	Rich in detail and atmosphere.	2025-05-22 04:19:20.193	2025-06-08 19:05:49.702
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, name, password, role, "profileImage", "phoneNumber", address, "dateOfBirth", "memberSince", "membershipStatus", "createdAt", "updatedAt") FROM stdin;
76e5eb53-fa96-4e0d-9cc3-c8816b978bb4	admin@library.com	Admin User	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	ADMIN	\N	+1234567892	789 Pine Rd, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
5074f620-544a-4de7-9bb9-31f2a6a08ee6	frank.miller@email.com	Frank Miller	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567898	606 Willow Way, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
d9a4b29d-d3c9-4f3f-832a-838b353d9e89	user@library.com	John Doe	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567890	123 Main St, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
8f4a6d0a-e4cf-4de2-8fd3-293997fe49c2	emma.davis@email.com	Emma Davis	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567897	505 Spruce Dr, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
7656732b-435b-4111-9562-89fe21b685ec	david.taylor@email.com	David Taylor	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567896	404 Birch Ln, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
b4e8d0e5-8d32-465f-82db-b074acd41f2e	henry.garcia@email.com	Henry Garcia	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567800	808 Aspen Ave, City, State	\N	2025-06-08 19:05:49.454	ACTIVE	2025-06-08 19:05:49.454	2025-06-08 19:05:49.454
2c8d2252-759d-460a-965b-bc8d5d656d1b	bob.wilson@email.com	Bob Wilson	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567894	202 Maple Ave, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
b4dc2a99-6c70-4b26-9bfd-6602e2f4edd2	carol.brown@email.com	Carol Brown	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567895	303 Cedar Rd, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
a589aec3-81ef-4f85-9a11-83f616208dc6	grace.lee@email.com	Grace Lee	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567899	707 Poplar Pl, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
bdc56409-7112-4e84-9878-0fed573effdc	alice.johnson@email.com	Alice Johnson	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567893	101 Elm St, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
d3da5f08-5d18-4954-9907-63d9bdfaa8dd	librarian@library.com	Jane Smith	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	LIBRARIAN	\N	+1234567891	456 Oak Ave, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
0b2aea8d-af63-457e-91fa-bf84c949cfb7	isabel.martinez@email.com	Isabel Martinez	$2b$10$XHztrSzKhBJq3MZSK3IpyOCafpLqNMWTK9ARTsn1ChYcVnG3nCh/q	USER	\N	+1234567801	909 Redwood Rd, City, State	\N	2025-06-08 19:05:49.452	ACTIVE	2025-06-08 19:05:49.452	2025-06-08 19:05:49.452
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
efcdb32d-32e7-4670-bb08-12921933b5bf	bea7e1fd2e3077c65c21ae774e91db302731a46e4471e32068b07cb74d7d64c6	2025-06-09 00:40:27.236374+07	20250608160612_init	\N	\N	2025-06-09 00:40:27.221691+07	1
81227a61-4c33-4ed0-98d1-3dccc35151a6	ddf30573d6811ce847d2aa45c15a2ca99c3093ef454bdc33522c9b406534fcf7	2025-06-09 00:40:45.127131+07	20250608174044_add_notification_enhancements	\N	\N	2025-06-09 00:40:45.125093+07	1
\.


--
-- Name: BookGenre BookGenre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookGenre"
    ADD CONSTRAINT "BookGenre_pkey" PRIMARY KEY (id);


--
-- Name: Book Book_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_pkey" PRIMARY KEY (id);


--
-- Name: Borrowing Borrowing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Borrowing"
    ADD CONSTRAINT "Borrowing_pkey" PRIMARY KEY (id);


--
-- Name: Fine Fine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fine"
    ADD CONSTRAINT "Fine_pkey" PRIMARY KEY (id);


--
-- Name: Genre Genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Genre"
    ADD CONSTRAINT "Genre_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: BookGenre_bookId_genreId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "BookGenre_bookId_genreId_key" ON public."BookGenre" USING btree ("bookId", "genreId");


--
-- Name: Book_isbn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Book_isbn_key" ON public."Book" USING btree (isbn);


--
-- Name: Fine_borrowingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Fine_borrowingId_key" ON public."Fine" USING btree ("borrowingId");


--
-- Name: Genre_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Genre_name_key" ON public."Genre" USING btree (name);


--
-- Name: Review_userId_bookId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_bookId_key" ON public."Review" USING btree ("userId", "bookId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: BookGenre BookGenre_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookGenre"
    ADD CONSTRAINT "BookGenre_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BookGenre BookGenre_genreId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookGenre"
    ADD CONSTRAINT "BookGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES public."Genre"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Borrowing Borrowing_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Borrowing"
    ADD CONSTRAINT "Borrowing_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Borrowing Borrowing_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Borrowing"
    ADD CONSTRAINT "Borrowing_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Fine Fine_borrowingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fine"
    ADD CONSTRAINT "Fine_borrowingId_fkey" FOREIGN KEY ("borrowingId") REFERENCES public."Borrowing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Fine Fine_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fine"
    ADD CONSTRAINT "Fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reservation Reservation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

