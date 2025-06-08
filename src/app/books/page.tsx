"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  TextField,
  Button,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface BooksResponse {
  books: Book[];
  pagination: PaginationInfo;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchBooks = useCallback(
    async (page = 1, append = false, search = "") => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: "9",
        });

        if (search) {
          searchParams.append("search", search);
        }

        const response = await axios.get(`/api/books?${searchParams}`);
        const data: BooksResponse = response.data;

        if (append) {
          setBooks((prevBooks) => {
            // Create a set of existing book IDs to prevent duplicates
            const existingIds = new Set(prevBooks.map((book) => book.id));
            const newBooks = data.books.filter(
              (book) => !existingIds.has(book.id)
            );
            return [...prevBooks, ...newBooks];
          });
        } else {
          setBooks(data.books);
        }

        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsSearching(false);
      }
    },
    []
  );

  const loadMoreBooks = useCallback(() => {
    if (pagination && pagination.hasNextPage && !isLoadingMore) {
      fetchBooks(pagination.currentPage + 1, true, searchTerm);
    }
  }, [pagination, isLoadingMore, fetchBooks, searchTerm]);

  const handleSearch = useCallback(
    async (term: string) => {
      setSearchTerm(term);
      setIsSearching(true);
      await fetchBooks(1, false, term);
    },
    [fetchBooks]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    fetchBooks(1, false, "");
  }, [fetchBooks]);

  // Infinite scroll detection with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);

      // Debounce the scroll handler
      timeoutId = setTimeout(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;

        // Trigger load more when user scrolls to 90% of the page
        if (
          scrollPosition >= documentHeight * 0.9 &&
          !hasScrolled &&
          !isLoadingMore
        ) {
          setHasScrolled(true);
          if (pagination && pagination.hasNextPage) {
            loadMoreBooks();
          }
        }

        // Reset scroll flag when user scrolls back up
        if (scrollPosition < documentHeight * 0.8) {
          setHasScrolled(false);
        }
      }, 100); // 100ms debounce
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pagination, isLoadingMore, loadMoreBooks, hasScrolled]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

      {/* Search Bar */}
      <Box className="mb-6">
        <Flex gap="3" align="center">
          <Box className="flex-1">
            <TextField.Root
              placeholder="Search books by title, author, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchTerm);
                }
              }}
              size="3"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              {searchTerm && (
                <TextField.Slot>
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={clearSearch}
                    style={{ cursor: "pointer" }}
                  >
                    <Cross2Icon height="14" width="14" />
                  </Button>
                </TextField.Slot>
              )}
            </TextField.Root>
          </Box>
          <Button
            onClick={() => handleSearch(searchTerm)}
            disabled={isSearching}
            size="3"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </Flex>
      </Box>

      <Text className="mb-6 text-gray-600">
        {searchTerm ? (
          <>
            Search results for "{searchTerm}" - {pagination?.totalBooks || 0}{" "}
            books found
            {pagination && (
              <span className="block text-sm mt-1">
                Showing {books.length} of {pagination.totalBooks} books
              </span>
            )}
          </>
        ) : (
          <>
            Browse through our extensive collection of{" "}
            {pagination?.totalBooks || books.length} books
            {pagination && (
              <span className="block text-sm mt-1">
                Showing {books.length} of {pagination.totalBooks} books
              </span>
            )}
          </>
        )}
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

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && (
        <div className="text-center py-8">
          <Text>Loading more books...</Text>
        </div>
      )}

      {/* Manual load more button (fallback) */}
      {pagination && pagination.hasNextPage && !isLoadingMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMoreBooks}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Load More Books ({pagination.totalBooks - books.length} remaining)
          </button>
        </div>
      )}

      {/* End of results indicator */}
      {pagination && !pagination.hasNextPage && books.length > 9 && (
        <div className="text-center py-8">
          <Text color="gray">
            You&apos;ve reached the end of our collection!
            <br />
            Showing all {pagination.totalBooks} books.
          </Text>
        </div>
      )}

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
