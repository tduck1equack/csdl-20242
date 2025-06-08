# Library Management System

## Overview

This is a fullstack library management web application built with Next.js, PostgreSQL, Prisma, and React. The system provides a comprehensive interface with authentication and role-based access for different user types (User, Librarian, Admin).

**Features Implemented**:

- 🔐 **Authentication System**: Login functionality with JWT tokens
- 📚 **Books Management**: Browse all available books in the library
- 🎨 **Modern UI**: Built with Radix UI themes and Tailwind CSS
- 🔄 **Dynamic Navigation**: Navigation bar that changes based on user authentication state

## Demo Accounts

The application includes these demo accounts for testing:

| Role      | Email                 | Password    |
| --------- | --------------------- | ----------- |
| User      | user@library.com      | password123 |
| Librarian | librarian@library.com | password123 |
| Admin     | admin@library.com     | password123 |

## Schema Enhancements

The database schema has been enhanced to provide a more comprehensive library management experience. New features include:

- **Enhanced User Profiles** with membership status, contact information, and more
- **Book Management** with detailed information, multiple formats, and condition tracking
- **Genre System** with a dedicated model and many-to-many relationship with books
- **Review System** allowing users to rate and comment on books
- **Reservation System** for requesting books that are currently checked out
- **Fine Management** for tracking and processing late fees and damages
- **Notification System** for due dates, reservations, and other library communications

For more details, see [SCHEMA_ENHANCEMENTS.md](./SCHEMA_ENHANCEMENTS.md).

## Features

### Access Model

- **Direct Dashboard Access**: No authentication required
- **Role-Based Dashboards**: Separate interfaces for Users, Librarians, and Admins
- **Simple Navigation**: Easy switching between different role perspectives

### Available Dashboards

#### User Dashboard (`/user/dashboard`)

- Browse books with filters (title, author, genre)
- View book details
- Borrow books
- Track borrowed books and due dates

#### Librarian Dashboard (`/librarian/dashboard`)

- All user features
- View all borrowed books
- Track overdue books
- Process book returns
- Library statistics overview

#### Admin Dashboard (`/admin/dashboard`)

- Comprehensive system overview
- User management capabilities
- System-wide statistics
- Book collection management

## Technology Stack

- **Frontend**: Next.js, React, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Form Validation**: React Hook Form with Zod
- **UI Components**: Tailwind CSS, Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   # Configure your PostgreSQL connection in .env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/library_management"
   ```
4. Run migrations:
   ```
   npx prisma migrate dev --schema=src/prisma/schema.prisma
   ```
5. Seed the database:
   ```
   npm run seed
   ```
6. Start the development server:
   ```
   npm run dev
   ```

### Quick Start

Use the provided `start.sh` script to automatically:

- Start PostgreSQL (if not running)
- Create the database (if it doesn't exist)
- Run migrations
- Seed the database

```
chmod +x start.sh
./start.sh
```

## Applying Schema Enhancements

To apply the enhanced database schema and updated API endpoints:

1. Make sure your PostgreSQL database is running
2. Run the enhancement script:
   ```
   chmod +x apply_schema_enhancements.sh
   ./apply_schema_enhancements.sh
   ```
3. Restart your application
   ```
   npm run dev
   ```

## Using the Application

After starting the application, you can access the different dashboards directly:

- **Home Page**: http://localhost:3000
- **User Dashboard**: http://localhost:3000/user/dashboard
- **Librarian Dashboard**: http://localhost:3000/librarian/dashboard
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Books Browser**: http://localhost:3000/books

## Project Structure

- `/src/app`: Next.js app router
  - `/api`: Backend API routes
  - `/user/dashboard`: User dashboard
  - `/librarian/dashboard`: Librarian dashboard
  - `/admin/dashboard`: Admin dashboard
  - `/books`: Book browsing and details
- `/src/prisma`: Prisma schema and client
- `/src/components`: Reusable UI components
- `/src/contexts`: React context providers (minimal auth stub)
