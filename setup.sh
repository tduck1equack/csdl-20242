#!/bin/bash
set -e  # Exit on any error

echo "This is the script to set up the Library Management System project for my Database class, term 2024.2"
echo "🚀 Setting up Library Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version 18+ is recommended. Current version: $(node --version)"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/library_management?schema=public"

# JWT Secret (change this in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Environment
NODE_ENV="development"
EOF
    echo "⚠️  Please update DATABASE_URL in .env file with your PostgreSQL connection string"
    echo "   Current example: DATABASE_URL=\"postgresql://postgres:password@localhost:5432/library_db?schema=public\""
    echo "   Also consider changing JWT_SECRET for security"
    read -p "Press enter when you've updated the .env file..."
fi

echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ Failed to install dependencies. Please check your npm configuration."
    exit 1
fi

echo "🔧 Generating Prisma client..."
if ! npx prisma generate --schema=./src/prisma/schema.prisma; then
    echo "❌ Failed to generate Prisma client. Please check your schema file."
    exit 1
fi

echo "🗃️  Running database migrations..."
if ! npx prisma migrate dev --schema=./src/prisma/schema.prisma --name init; then
    echo "❌ Failed to run database migrations. Please check your database connection."
    echo "   Make sure PostgreSQL is running and the DATABASE_URL is correct."
    exit 1
fi

echo "🌱 Seeding database with demo data..."
if ! npm run seed; then
    echo "❌ Failed to seed database. The migration was successful but seeding failed."
    echo "   You can try running 'npm run seed' manually later."
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 You can now start the development server with:"
echo "   npm run dev"
echo ""
echo "🔑 Demo login credentials:"
echo "   User: user@library.com / password123"
echo "   Librarian: librarian@library.com / password123"
echo "   Admin: admin@library.com / password123"
echo ""
echo "📱 Application URLs:"
echo "   - Main app: http://localhost:3000"
echo "   - Login: http://localhost:3000/login"
echo "   - User Dashboard: http://localhost:3000/dashboard"
echo "   - Librarian Dashboard: http://localhost:3000/librarian/dashboard"
echo "   - Admin Dashboard: http://localhost:3000/admin/dashboard"
