"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  Flex,
  Text,
  Heading,
  Badge,
  Button,
  Separator,
  Avatar,
} from "@radix-ui/themes";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface Genre {
  id: string;
  name: string;
  description?: string;
}

interface BookGenre {
  id: string;
  genre: Genre;
}

interface User {
  id: string;
  name: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: User;
}

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  user: User;
}

interface BookDetail {
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
  location?: string;
  deweyDecimal?: string;
  format: string;
  condition: string;
  coverImageUrl: string;
  averageRating: number;
  totalReviews: number;
  genres: BookGenre[];
  reviews: Review[];
  borrowings: Borrowing[];
  createdAt: string;
  updatedAt: string;
}

export default function BookDetailPage() {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${bookId}`);
      setBook(response.data);
    } catch (error) {
      console.error("Error fetching book:", error);
      setError("Failed to load book details");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text>Loading book details...</Text>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text color="red">{error || "Book not found"}</Text>
        <Link href="/books">
          <Button variant="outline" className="mt-4">
            ← Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/books">
        <Button variant="ghost" size="2" className="mb-6">
          ← Back to Books
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover and Basic Info */}
        <div className="lg:col-span-1">
          <Card>
            <Box p="6">
              <div className="relative w-full h-80 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {!imageError ? (
                  <Image
                    src={book.coverImageUrl}
                    alt={`${book.title} cover`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Text size="2" color="gray">
                      No Cover Available
                    </Text>
                  </div>
                )}
              </div>

              <Flex direction="column" gap="3">
                <div>
                  <Text size="1" color="gray">
                    Availability
                  </Text>
                  <Badge
                    color={book.availableCopies > 0 ? "green" : "red"}
                    size="2"
                  >
                    {book.availableCopies > 0 ? "Available" : "Not Available"}
                  </Badge>
                </div>

                <div>
                  <Text size="1" color="gray">
                    Copies
                  </Text>
                  <Text size="2" weight="medium">
                    {book.availableCopies}/{book.totalCopies}
                  </Text>
                </div>

                <div>
                  <Text size="1" color="gray">
                    Format
                  </Text>
                  <Badge variant="outline">{book.format}</Badge>
                </div>

                <div>
                  <Text size="1" color="gray">
                    Condition
                  </Text>
                  <Badge
                    color={
                      book.condition === "NEW"
                        ? "green"
                        : book.condition === "GOOD"
                        ? "blue"
                        : "orange"
                    }
                    variant="soft"
                  >
                    {book.condition}
                  </Badge>
                </div>

                <Button
                  size="3"
                  disabled={book.availableCopies === 0}
                  className="w-full mt-4"
                >
                  {book.availableCopies > 0 ? "Borrow Book" : "Out of Stock"}
                </Button>
              </Flex>
            </Box>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <Box p="6">
              <Flex direction="column" gap="4">
                {/* Title and Author */}
                <div>
                  <Heading size="6" className="mb-2">
                    {book.title}
                  </Heading>
                  <Text size="4" color="gray" className="mb-2">
                    by {book.author}
                  </Text>

                  {/* Rating */}
                  {book.totalReviews > 0 && (
                    <Flex align="center" gap="2" className="mb-3">
                      <div className="flex">
                        {renderStars(book.averageRating)}
                      </div>
                      <Text size="2" color="gray">
                        {book.averageRating} ({book.totalReviews} reviews)
                      </Text>
                    </Flex>
                  )}
                </div>

                {/* Genres */}
                {book.genres.length > 0 && (
                  <div>
                    <Text size="2" weight="medium" className="mb-2 block">
                      Genres
                    </Text>
                    <Flex gap="2" wrap="wrap">
                      {book.genres.map((bookGenre) => (
                        <Badge key={bookGenre.id} variant="soft">
                          {bookGenre.genre.name}
                        </Badge>
                      ))}
                    </Flex>
                  </div>
                )}

                {/* Description */}
                <div>
                  <Text size="2" weight="medium" className="mb-2 block">
                    Description
                  </Text>
                  <Text size="2" className="leading-relaxed">
                    {book.description || "No description available."}
                  </Text>
                </div>

                <Separator />

                {/* Book Details */}
                <div>
                  <Text size="3" weight="medium" className="mb-3 block">
                    Book Details
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text size="1" color="gray">
                        ISBN
                      </Text>
                      <Text size="2">{book.isbn}</Text>
                    </div>
                    <div>
                      <Text size="1" color="gray">
                        Published Year
                      </Text>
                      <Text size="2">{book.publishedYear}</Text>
                    </div>
                    {book.publisher && (
                      <div>
                        <Text size="1" color="gray">
                          Publisher
                        </Text>
                        <Text size="2">{book.publisher}</Text>
                      </div>
                    )}
                    <div>
                      <Text size="1" color="gray">
                        Language
                      </Text>
                      <Text size="2">{book.language}</Text>
                    </div>
                    {book.pageCount && (
                      <div>
                        <Text size="1" color="gray">
                          Pages
                        </Text>
                        <Text size="2">{book.pageCount}</Text>
                      </div>
                    )}
                    {book.location && (
                      <div>
                        <Text size="1" color="gray">
                          Location
                        </Text>
                        <Text size="2">{book.location}</Text>
                      </div>
                    )}
                    {book.deweyDecimal && (
                      <div>
                        <Text size="1" color="gray">
                          Dewey Decimal
                        </Text>
                        <Text size="2">{book.deweyDecimal}</Text>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Borrowers */}
                {book.borrowings.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Text size="3" weight="medium" className="mb-3 block">
                        Currently Borrowed By
                      </Text>
                      <div className="space-y-2">
                        {book.borrowings.map((borrowing) => (
                          <Card key={borrowing.id} variant="surface">
                            <Box p="3">
                              <Flex align="center" gap="3">
                                <Avatar
                                  size="2"
                                  fallback={borrowing.user.name.charAt(0)}
                                />
                                <div>
                                  <Text size="2" weight="medium">
                                    {borrowing.user.name}
                                  </Text>
                                  <Text size="1" color="gray" className="block">
                                    Due:{" "}
                                    {new Date(
                                      borrowing.dueDate
                                    ).toLocaleDateString()}
                                  </Text>
                                </div>
                              </Flex>
                            </Box>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Reviews */}
                {book.reviews.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Text size="3" weight="medium" className="mb-4 block">
                        Reviews ({book.totalReviews})
                      </Text>
                      <div className="space-y-4">
                        {book.reviews.slice(0, 5).map((review) => (
                          <Card key={review.id} variant="surface">
                            <Box p="4">
                              <Flex align="start" gap="3">
                                <Avatar
                                  size="2"
                                  fallback={review.user.name.charAt(0)}
                                />
                                <div className="flex-grow">
                                  <Flex align="center" gap="2" className="mb-2">
                                    <Text size="2" weight="medium">
                                      {review.user.name}
                                    </Text>
                                    <div className="flex">
                                      {renderStars(review.rating)}
                                    </div>
                                    <Text size="1" color="gray">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </Text>
                                  </Flex>
                                  {review.comment && (
                                    <Text size="2" className="leading-relaxed">
                                      {review.comment}
                                    </Text>
                                  )}
                                </div>
                              </Flex>
                            </Box>
                          </Card>
                        ))}
                        {book.reviews.length > 5 && (
                          <Text size="1" color="gray" className="text-center">
                            And {book.reviews.length - 5} more reviews...
                          </Text>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Flex>
            </Box>
          </Card>
        </div>
      </div>
    </div>
  );
}
