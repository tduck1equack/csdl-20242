#!/bin/bash
echo "This is the script to set up the Library Management System project for my Database class, term 2024.2"
echo "🚀 Setting up Library Management System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update DATABASE_URL in .env file with your PostgreSQL connection string"
    echo "   Example: DATABASE_URL=\"postgresql://postgres:password@localhost:5432/library_db?schema=public\""
    read -p "Press enter when you've updated the .env file..."
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate --schema=./src/prisma/schema.prisma

echo "🗃️  Running database migrations..."
npx prisma migrate dev --schema=./src/prisma/schema.prisma --name init

echo "🌱 Seeding database with demo data..."
npm run seed

echo "✅ Setup complete!"
echo ""
echo "🎯 You can now start the development server with:"
echo "   npm run dev"
echo ""
echo "🔑 Demo login credentials:"
echo "   User: user@library.com / password123"
echo "   Librarian: librarian@library.com / password123"
echo "   Admin: admin@library.com / password123"
