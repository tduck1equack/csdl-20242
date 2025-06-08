"use client";

import { Button, Heading, Text } from "@radix-ui/themes";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        {/* {user && (
          <div className="mb-8 text-center">
            <Text size="4" className="text-blue-600">
              Welcome back, {user.name}!
            </Text>
            <Text size="2" className="text-gray-600">
              Role: {user.role}
            </Text>
          </div>
        )} */}

        <Heading size="9" className="text-center">
          Welcome to the Library Management System
        </Heading>

        <div className="w-full max-w-4xl mb-12 mt-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 sm:h-80">
              <Image
                src="/library.jpg"
                alt="Library"
                width={2000}
                height={800}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="p-8">
              <Heading size="5" className="mb-4">
                Discover, Borrow, and Return Books with Ease
              </Heading>
              <Text as="p" size="3" className="my-24 text-gray-600">
                Our library management system provides a seamless experience for
                users to explore our extensive collection, borrow books, and
                manage returns. Choose your access level below.
              </Text>
              <div className="flex flex-wrap gap-4">
                <Link href="/books">
                  <Button size="3">Browse Books</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heading size="4" className="mb-3">
              For Readers
            </Heading>
            <Text as="p" className="text-gray-600">
              Browse our collection, borrow books, and keep track of your
              reading history and due dates.
            </Text>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heading size="4" className="mb-3">
              For Librarians
            </Heading>
            <Text as="p" className="text-gray-600">
              Manage book loans, process returns, and keep track of overdue
              books efficiently.
            </Text>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heading size="4" className="mb-3">
              For Administrators
            </Heading>
            <Text as="p" className="text-gray-600">
              Full system control including user management, system settings,
              and comprehensive reports.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
