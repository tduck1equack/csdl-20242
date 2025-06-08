"use client";

import { useState, useEffect } from "react";
import { Box, Card, Flex, Text, Heading, Badge } from "@radix-ui/themes";
import axios from "axios";

import Link from "next/link";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  publisher?: string;
  language: string;
  pageCount?: number;
  description: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  location?: string;
  format: string;
  condition: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("/api/books");
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      setError("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text>Loading books...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text color="red">{error}</Text>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Heading size="7" className="mb-8">
        Our Book Collection
      </Heading>

      <Text className="mb-6 text-gray-600">
        Browse through our extensive collection of {books.length} books
      </Text>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Link href={`/books/${book.id}`} key={book.id}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <Box p="4">
                <Flex direction="column" gap="3" className="h-full">
                  <div>
                    <Heading size="4" className="mb-2 line-clamp-2">
                      {book.title}
                    </Heading>
                    <Image
                      src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                      alt={`${book.title} cover`}
                      width={"200"}
                      height={"100"}
                      className="object-cover"
                    />
                    <Text size="2" color="gray" className="mb-2">
                      by {book.author}
                    </Text>

                    <Flex gap="2" className="mb-3">
                      <Badge color={book.availableCopies > 0 ? "green" : "red"}>
                        {book.availableCopies > 0
                          ? "Available"
                          : "Not Available"}
                      </Badge>
                      <Badge variant="outline">{book.format}</Badge>
                    </Flex>
                  </div>

                  <div className="flex-grow">
                    <Text size="2" className="text-gray-600 line-clamp-3">
                      {book.description || "No description available."}
                    </Text>
                  </div>

                  <div className="space-y-2">
                    <Flex justify="between">
                      <Text size="1" color="gray">
                        Published:
                      </Text>
                      <Text size="1">{book.publishedYear}</Text>
                    </Flex>

                    <Flex justify="between">
                      <Text size="1" color="gray">
                        Copies:
                      </Text>
                      <Text size="1">
                        {book.availableCopies}/{book.totalCopies}
                      </Text>
                    </Flex>

                    {book.location && (
                      <Flex justify="between">
                        <Text size="1" color="gray">
                          Location:
                        </Text>
                        <Text size="1">{book.location}</Text>
                      </Flex>
                    )}

                    <Flex justify="between">
                      <Text size="1" color="gray">
                        ISBN:
                      </Text>
                      <Text size="1">{book.isbn}</Text>
                    </Flex>
                  </div>

                  <div className="mt-4 text-center">
                    <Text size="2" color="blue" className="hover:underline">
                      View Details →
                    </Text>
                  </div>
                </Flex>
              </Box>
            </Card>
          </Link>
        ))}
      </div>

      {books.length === 0 && (
        <Box className="text-center py-12">
          <Text size="3" color="gray">
            No books found in the library collection.
          </Text>
        </Box>
      )}
    </div>
  );
}
