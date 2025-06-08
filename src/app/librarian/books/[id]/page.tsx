"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  Text,
  TextField,
  TextArea,
  Button,
  Flex,
  Select,
  Grid,
  Badge,
  Dialog,
  Separator,
} from "@radix-ui/themes";
import { ArrowLeftIcon, Pencil1Icon } from "@radix-ui/react-icons";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  deweyDecimal?: string;
  format: string;
  condition: string;
  coverImageUrl: string;
  averageRating: number;
  totalReviews: number;
  genres: Array<{
    genre: {
      id: string;
      name: string;
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }>;
  borrowings: Array<{
    id: string;
    status: string;
    borrowDate: string;
    dueDate: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

interface EditForm {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  publisher: string;
  language: string;
  pageCount: number | null;
  description: string;
  totalCopies: number;
  availableCopies: number;
  coverImage: string;
  location: string;
  deweyDecimal: string;
  format: string;
  condition: string;
  genres: string[];
}

export default function EditBook() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    author: "",
    isbn: "",
    publishedYear: new Date().getFullYear(),
    publisher: "",
    language: "English",
    pageCount: null,
    description: "",
    totalCopies: 1,
    availableCopies: 1,
    coverImage: "",
    location: "",
    deweyDecimal: "",
    format: "PHYSICAL",
    condition: "GOOD",
    genres: [],
  });
  const [newGenre, setNewGenre] = useState("");

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      if (response.ok) {
        const bookData = await response.json();
        setBook(bookData);

        // Populate edit form with current book data
        setEditForm({
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          publishedYear: bookData.publishedYear,
          publisher: bookData.publisher || "",
          language: bookData.language,
          pageCount: bookData.pageCount,
          description: bookData.description,
          totalCopies: bookData.totalCopies,
          availableCopies: bookData.availableCopies,
          coverImage: bookData.coverImage || "",
          location: bookData.location || "",
          deweyDecimal: bookData.deweyDecimal || "",
          format: bookData.format,
          condition: bookData.condition,
          genres: bookData.genres.map((g: any) => g.genre.name),
        });
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.author || !editForm.isbn) {
      alert("Please fill in all required fields (Title, Author, ISBN)");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editForm,
          pageCount: editForm.pageCount || null,
        }),
      });

      if (response.ok) {
        const updatedBook = await response.json();
        setBook(updatedBook);
        setShowEditDialog(false);
        alert("Book updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !editForm.genres.includes(newGenre.trim())) {
      setEditForm({
        ...editForm,
        genres: [...editForm.genres, newGenre.trim()],
      });
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setEditForm({
      ...editForm,
      genres: editForm.genres.filter((genre) => genre !== genreToRemove),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, any> = {
      BORROWED: "blue",
      RETURNED: "green",
      OVERDUE: "red",
      LOST: "orange",
      DAMAGED: "yellow",
    };

    return <Badge color={statusColors[status] || "gray"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text>Loading book details...</Text>
      </Box>
    );
  }

  if (!book) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text>Book not found</Text>
      </Box>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
      <Box className="container mx-auto px-4 py-6">
        <Flex justify="between" align="center" className="mb-6">
          <Flex align="center" gap="3">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeftIcon />
              Back
            </Button>
            <Text size="8" weight="bold">
              Book Management
            </Text>
          </Flex>
          <Button onClick={() => setShowEditDialog(true)}>
            <Pencil1Icon />
            Edit Book
          </Button>
        </Flex>

        <Grid columns="2" gap="6">
          {/* Book Information */}
          <Card>
            <Box className="p-6">
              <Text size="5" weight="bold" className="mb-4">
                Book Information
              </Text>

              <Flex gap="4" className="mb-4">
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-32 h-48 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-book.png";
                  }}
                />
                <Flex direction="column" gap="2" className="flex-1">
                  <Text size="4" weight="bold">
                    {book.title}
                  </Text>
                  <Text size="3" color="gray">
                    by {book.author}
                  </Text>
                  <Text size="2">
                    <strong>ISBN:</strong> {book.isbn}
                  </Text>
                  <Text size="2">
                    <strong>Published:</strong> {book.publishedYear}
                  </Text>
                  {book.publisher && (
                    <Text size="2">
                      <strong>Publisher:</strong> {book.publisher}
                    </Text>
                  )}
                  <Text size="2">
                    <strong>Language:</strong> {book.language}
                  </Text>
                  {book.pageCount && (
                    <Text size="2">
                      <strong>Pages:</strong> {book.pageCount}
                    </Text>
                  )}
                </Flex>
              </Flex>

              <Flex direction="column" gap="2" className="mb-4">
                <Text size="2">
                  <strong>Format:</strong> {book.format}
                </Text>
                <Text size="2">
                  <strong>Condition:</strong> {book.condition}
                </Text>
                {book.location && (
                  <Text size="2">
                    <strong>Location:</strong> {book.location}
                  </Text>
                )}
                {book.deweyDecimal && (
                  <Text size="2">
                    <strong>Dewey Decimal:</strong> {book.deweyDecimal}
                  </Text>
                )}
              </Flex>

              <Box className="mb-4">
                <Text size="3" weight="bold" className="mb-2">
                  Description
                </Text>
                <Text size="2">
                  {book.description || "No description available"}
                </Text>
              </Box>

              <Box className="mb-4">
                <Text size="3" weight="bold" className="mb-2">
                  Genres
                </Text>
                <Flex gap="2" wrap="wrap">
                  {book.genres.map((bookGenre) => (
                    <Badge key={bookGenre.genre.id}>
                      {bookGenre.genre.name}
                    </Badge>
                  ))}
                </Flex>
              </Box>

              <Grid columns="3" gap="4">
                <Box>
                  <Text size="2" color="gray">
                    Total Copies
                  </Text>
                  <Text size="4" weight="bold">
                    {book.totalCopies}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" color="gray">
                    Available
                  </Text>
                  <Text size="4" weight="bold" color="green">
                    {book.availableCopies}
                  </Text>
                </Box>
                <Box>
                  <Text size="2" color="gray">
                    Borrowed
                  </Text>
                  <Text size="4" weight="bold" color="blue">
                    {book.totalCopies - book.availableCopies}
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Card>

          {/* Activity and Reviews */}
          <Card>
            <Box className="p-6">
              <Text size="5" weight="bold" className="mb-4">
                Activity & Reviews
              </Text>

              <Box className="mb-6">
                <Text size="3" weight="bold" className="mb-2">
                  Rating Summary
                </Text>
                <Flex align="center" gap="2">
                  <Text size="4" weight="bold">
                    {book.averageRating.toFixed(1)}
                  </Text>
                  <Text size="2" color="gray">
                    ({book.totalReviews} reviews)
                  </Text>
                </Flex>
              </Box>

              <Separator className="my-4" />

              <Box className="mb-6">
                <Text size="3" weight="bold" className="mb-3">
                  Current Borrowings
                </Text>
                {book.borrowings.length > 0 ? (
                  <Flex direction="column" gap="2">
                    {book.borrowings.map((borrowing) => (
                      <Flex
                        key={borrowing.id}
                        justify="between"
                        align="center"
                        className="p-2 bg-gray-50 rounded"
                      >
                        <Flex direction="column">
                          <Text size="2" weight="bold">
                            {borrowing.user.name}
                          </Text>
                          <Text size="1" color="gray">
                            Due:{" "}
                            {new Date(borrowing.dueDate).toLocaleDateString()}
                          </Text>
                        </Flex>
                        {getStatusBadge(borrowing.status)}
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text size="2" color="gray">
                    No current borrowings
                  </Text>
                )}
              </Box>

              <Separator className="my-4" />

              <Box>
                <Text size="3" weight="bold" className="mb-3">
                  Recent Reviews
                </Text>
                {book.reviews.length > 0 ? (
                  <Flex direction="column" gap="3">
                    {book.reviews.slice(0, 3).map((review) => (
                      <Box key={review.id} className="p-3 bg-gray-50 rounded">
                        <Flex justify="between" align="center" className="mb-2">
                          <Text size="2" weight="bold">
                            {review.user.name}
                          </Text>
                          <Flex align="center" gap="1">
                            <Text size="2" weight="bold">
                              {review.rating}/5
                            </Text>
                          </Flex>
                        </Flex>
                        {review.comment && (
                          <Text size="2">{review.comment}</Text>
                        )}
                        <Text size="1" color="gray" className="mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </Box>
                    ))}
                  </Flex>
                ) : (
                  <Text size="2" color="gray">
                    No reviews yet
                  </Text>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Edit Book Dialog */}
        <Dialog.Root open={showEditDialog} onOpenChange={setShowEditDialog}>
          <Dialog.Content
            maxWidth="600px"
            style={{ maxHeight: "80vh", overflow: "auto" }}
          >
            <Dialog.Title>Edit Book</Dialog.Title>
            <Flex direction="column" gap="4">
              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Title *
                  </Text>
                  <TextField.Root
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Author *
                  </Text>
                  <TextField.Root
                    value={editForm.author}
                    onChange={(e) =>
                      setEditForm({ ...editForm, author: e.target.value })
                    }
                  />
                </label>
              </Grid>

              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    ISBN *
                  </Text>
                  <TextField.Root
                    value={editForm.isbn}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isbn: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Published Year
                  </Text>
                  <TextField.Root
                    type="number"
                    value={editForm.publishedYear.toString()}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        publishedYear: parseInt(e.target.value),
                      })
                    }
                  />
                </label>
              </Grid>

              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Publisher
                  </Text>
                  <TextField.Root
                    value={editForm.publisher}
                    onChange={(e) =>
                      setEditForm({ ...editForm, publisher: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Language
                  </Text>
                  <TextField.Root
                    value={editForm.language}
                    onChange={(e) =>
                      setEditForm({ ...editForm, language: e.target.value })
                    }
                  />
                </label>
              </Grid>

              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Page Count
                  </Text>
                  <TextField.Root
                    type="number"
                    value={editForm.pageCount?.toString() || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        pageCount: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Location
                  </Text>
                  <TextField.Root
                    placeholder="e.g., Section A, Shelf 3"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                  />
                </label>
              </Grid>

              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Dewey Decimal
                  </Text>
                  <TextField.Root
                    placeholder="e.g., 813.54"
                    value={editForm.deweyDecimal}
                    onChange={(e) =>
                      setEditForm({ ...editForm, deweyDecimal: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Cover Image URL
                  </Text>
                  <TextField.Root
                    placeholder="https://..."
                    value={editForm.coverImage}
                    onChange={(e) =>
                      setEditForm({ ...editForm, coverImage: e.target.value })
                    }
                  />
                </label>
              </Grid>

              <Grid columns="3" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Format
                  </Text>
                  <Select.Root
                    value={editForm.format}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, format: value })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="PHYSICAL">Physical</Select.Item>
                      <Select.Item value="EBOOK">E-book</Select.Item>
                      <Select.Item value="AUDIOBOOK">Audiobook</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Condition
                  </Text>
                  <Select.Root
                    value={editForm.condition}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, condition: value })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="NEW">New</Select.Item>
                      <Select.Item value="GOOD">Good</Select.Item>
                      <Select.Item value="FAIR">Fair</Select.Item>
                      <Select.Item value="POOR">Poor</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Total Copies
                  </Text>
                  <TextField.Root
                    type="number"
                    min="1"
                    value={editForm.totalCopies.toString()}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        totalCopies: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </label>
              </Grid>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Available Copies
                </Text>
                <TextField.Root
                  type="number"
                  min="0"
                  max={editForm.totalCopies}
                  value={editForm.availableCopies.toString()}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      availableCopies: Math.min(
                        parseInt(e.target.value) || 0,
                        editForm.totalCopies
                      ),
                    })
                  }
                />
              </label>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
                <TextArea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </label>

              <Box>
                <Text as="div" size="2" mb="2" weight="bold">
                  Genres
                </Text>
                <Flex direction="column" gap="2">
                  <Flex gap="2" wrap="wrap">
                    {editForm.genres.map((genre) => (
                      <Badge key={genre} variant="soft">
                        {genre}
                        <Button
                          size="1"
                          variant="ghost"
                          className="ml-1"
                          onClick={() => removeGenre(genre)}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </Flex>
                  <Flex gap="2">
                    <TextField.Root
                      placeholder="Add new genre"
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addGenre();
                        }
                      }}
                    />
                    <Button onClick={addGenre}>Add</Button>
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            <Flex gap="3" mt="6" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </ProtectedRoute>
  );
}
