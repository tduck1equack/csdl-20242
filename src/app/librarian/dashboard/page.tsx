"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Text,
  Card,
  Flex,
  Badge,
  Button,
  TextField,
  Dialog,
  Select,
  TextArea,
  Grid,
  Table,
  Avatar,
  IconButton,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface DashboardStats {
  borrowings: {
    total: number;
    active: number;
    overdue: number;
  };
  fines: {
    total: number;
    unpaid: number;
  };
  users: {
    total: number;
    newThisWeek: number;
  };
  books: {
    total: number;
    available: number;
  };
  reservations: {
    pending: number;
    ready: number;
  };
}

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  renewalCount: number;
  returnNotes?: string;
  isOverdue: boolean;
  daysOverdue: number;
  user: {
    id: string;
    name: string;
    email: string;
    membershipStatus: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverImage?: string;
  };
  fine?: {
    id: string;
    amount: number;
    reason: string;
    status: string;
  };
}

interface Fine {
  id: string;
  amount: number;
  reason: string;
  status: string;
  paidDate?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    membershipStatus: string;
  };
  borrowing: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      isbn: string;
    };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipStatus: string;
  memberSince: string;
  _count: {
    borrowings: number;
    fines: number;
    notifications: number;
  };
}

interface UserWithBorrowings {
  id: string;
  name: string;
  email: string;
  membershipStatus: string;
  borrowings: {
    id: string;
    dueDate: string;
    status: string;
    book: {
      id: string;
      title: string;
      author: string;
    };
  }[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

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
  createdAt: string;
  genres: {
    id: string;
    genre: {
      name: string;
    };
  }[];
}

interface Genre {
  id: string;
  name: string;
}

export default function LibrarianDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Enhanced user selection states
  const [borrowingUsers, setBorrowingUsers] = useState<UserWithBorrowings[]>(
    []
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedBorrowing, setSelectedBorrowing] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dialog states
  const [showCreateNotification, setShowCreateNotification] = useState(false);
  const [showCreateFine, setShowCreateFine] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Borrowing | Fine | null>(
    null
  );
  const [actionType, setActionType] = useState("");

  // Book management state
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publishedYear: new Date().getFullYear(),
    publisher: "",
    language: "English",
    pageCount: "",
    description: "",
    totalCopies: 1,
    location: "",
    format: "PHYSICAL",
    condition: "NEW",
    genreIds: [] as string[],
  });
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [bookFilter, setBookFilter] = useState("all");

  // Form states
  const [notificationForm, setNotificationForm] = useState({
    userId: "",
    title: "",
    message: "",
    type: "GENERAL",
    actionUrl: "",
  });

  const [fineForm, setFineForm] = useState({
    borrowingId: "",
    amount: "",
    reason: "",
  });

  const [actionForm, setActionForm] = useState({
    notes: "",
    fineAmount: "",
    fineReason: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "borrowings") {
      fetchBorrowings();
    } else if (activeTab === "fines") {
      fetchFines();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "notifications") {
      fetchNotifications();
    } else if (activeTab === "books") {
      fetchBooks();
      fetchGenres();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    searchTerm,
    filterStatus,
    showOverdueOnly,
    bookSearchTerm,
    bookFilter,
  ]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/librarian/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowings = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(showOverdueOnly && { overdue: "true" }),
      });

      const response = await fetch(`/api/librarian/borrowings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBorrowings(data.borrowings);
      }
    } catch (error) {
      console.error("Error fetching borrowings:", error);
    }
  };

  const fetchFines = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const response = await fetch(`/api/librarian/fines?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFines(data.fines);
      }
    } catch (error) {
      console.error("Error fetching fines:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
      });

      const response = await fetch(`/api/librarian/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { userId: searchTerm }),
        ...(filterStatus !== "all" && { type: filterStatus }),
      });

      const response = await fetch(`/api/librarian/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams({
        ...(bookSearchTerm && { search: bookSearchTerm }),
        ...(bookFilter !== "all" && { format: bookFilter }),
      });

      const response = await fetch(`/api/librarian/books?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books);
        console.log(data.books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/genres");
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres || []);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchBorrowingUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        "/api/librarian/users?includeBorrowings=true"
      );
      if (response.ok) {
        const data = await response.json();

        const usersWithBorrowings = data.users.filter(
          (user: UserWithBorrowings) => user.borrowings.length > 0
        );

        setBorrowingUsers(usersWithBorrowings);
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error("Error fetching borrowing users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBorrowingAction = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(
        `/api/librarian/borrowings/${selectedItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: actionType,
            notes: actionForm.notes,
            fineAmount: actionForm.fineAmount
              ? parseFloat(actionForm.fineAmount)
              : undefined,
            fineReason: actionForm.fineReason,
          }),
        }
      );

      if (response.ok) {
        await fetchBorrowings();
        setShowActionDialog(false);
        setActionForm({ notes: "", fineAmount: "", fineReason: "" });
      }
    } catch (error) {
      console.error("Error updating borrowing:", error);
    }
  };

  const handleFineAction = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/librarian/fines/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionType,
          notes: actionForm.notes,
        }),
      });

      if (response.ok) {
        await fetchFines();
        setShowActionDialog(false);
        setActionForm({ notes: "", fineAmount: "", fineReason: "" });
      }
    } catch (error) {
      console.error("Error updating fine:", error);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const response = await fetch("/api/librarian/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationForm),
      });

      if (response.ok) {
        await fetchNotifications();
        setShowCreateNotification(false);
        setNotificationForm({
          userId: "",
          title: "",
          message: "",
          type: "GENERAL",
          actionUrl: "",
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleCreateFine = async () => {
    try {
      const response = await fetch("/api/librarian/fines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fineForm,
          amount: parseFloat(fineForm.amount),
        }),
      });

      if (response.ok) {
        await fetchFines();
        setShowCreateFine(false);
        setFineForm({
          borrowingId: "",
          amount: "",
          reason: "",
        });
      }
    } catch (error) {
      console.error("Error creating fine:", error);
    }
  };

  const handleCreateBook = async () => {
    try {
      const response = await fetch("/api/librarian/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookForm,
          pageCount: bookForm.pageCount ? parseInt(bookForm.pageCount) : null,
        }),
      });

      if (response.ok) {
        await fetchBooks();
        setShowAddBookDialog(false);
        setBookForm({
          title: "",
          author: "",
          isbn: "",
          publishedYear: new Date().getFullYear(),
          publisher: "",
          language: "English",
          pageCount: "",
          description: "",
          totalCopies: 1,
          location: "",
          format: "PHYSICAL",
          condition: "NEW",
          genreIds: [],
        });
      }
    } catch (error) {
      console.error("Error creating book:", error);
    }
  };

  const getStatusBadge = (status: string, isOverdue?: boolean) => {
    if (isOverdue) {
      return <Badge color="red">Overdue</Badge>;
    }

    const statusColorMap = {
      BORROWED: "blue" as const,
      RETURNED: "green" as const,
      OVERDUE: "red" as const,
      LOST: "orange" as const,
      DAMAGED: "yellow" as const,
      UNPAID: "red" as const,
      PAID: "green" as const,
      WAIVED: "gray" as const,
      PENDING: "yellow" as const,
      READY: "blue" as const,
      CLAIMED: "green" as const,
      EXPIRED: "red" as const,
      CANCELLED: "gray" as const,
    };

    const color =
      statusColorMap[status as keyof typeof statusColorMap] || "gray";
    return <Badge color={color}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["LIBRARIAN", "ADMIN"]}>
      <Box className="container mx-auto px-4 py-6">
        <Flex justify="between" align="center" className="mb-6">
          <Text size="8" weight="bold">
            Librarian Dashboard
          </Text>
        </Flex>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="borrowings">Borrowings</Tabs.Trigger>
            <Tabs.Trigger value="fines">Fines</Tabs.Trigger>
            <Tabs.Trigger value="users">Users</Tabs.Trigger>
            <Tabs.Trigger value="books">Books</Tabs.Trigger>
            <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="mt-6">
            {stats && (
              <Grid columns="4" gap="4" className="mb-6">
                <Card>
                  <Flex direction="column" gap="2" className="p-4">
                    <Text size="2" color="gray">
                      Active Borrowings
                    </Text>
                    <Text size="6" weight="bold">
                      {stats.borrowings.active}
                    </Text>
                    <Text size="1" color="red">
                      {stats.borrowings.overdue} overdue
                    </Text>
                  </Flex>
                </Card>

                <Card>
                  <Flex direction="column" gap="2" className="p-4">
                    <Text size="2" color="gray">
                      Unpaid Fines
                    </Text>
                    <Text size="6" weight="bold">
                      ${stats.fines.unpaid.toFixed(2)}
                    </Text>
                    <Text size="1" color="gray">
                      Total: ${stats.fines.total.toFixed(2)}
                    </Text>
                  </Flex>
                </Card>

                <Card>
                  <Flex direction="column" gap="2" className="p-4">
                    <Text size="2" color="gray">
                      Total Users
                    </Text>
                    <Text size="6" weight="bold">
                      {stats.users.total}
                    </Text>
                    <Text size="1" color="green">
                      +{stats.users.newThisWeek} this week
                    </Text>
                  </Flex>
                </Card>

                <Card>
                  <Flex direction="column" gap="2" className="p-4">
                    <Text size="2" color="gray">
                      Available Books
                    </Text>
                    <Text size="6" weight="bold">
                      {stats.books.available}
                    </Text>
                    <Text size="1" color="gray">
                      of {stats.books.total} total
                    </Text>
                  </Flex>
                </Card>
              </Grid>
            )}

            <Card>
              <Box className="p-6">
                <Text size="4" weight="bold" className="mb-4">
                  Quick Actions
                </Text>
                <Flex gap="3">
                  <Button
                    onClick={() => {
                      setShowCreateNotification(true);
                      fetchBorrowingUsers();
                    }}
                  >
                    <PlusIcon />
                    Send Notification
                  </Button>
                  <Button onClick={() => setShowCreateFine(true)}>
                    <PlusIcon />
                    Create Fine
                  </Button>
                  <Button onClick={() => setActiveTab("borrowings")}>
                    View Overdue Books
                  </Button>
                </Flex>
              </Box>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="borrowings" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    Borrowings Management
                  </Text>
                  <Flex gap="3" align="center">
                    <TextField.Root
                      placeholder="Search borrowings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                      </TextField.Slot>
                    </TextField.Root>
                    <Select.Root
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <Select.Trigger placeholder="Filter by status" />
                      <Select.Content>
                        <Select.Item value="all">All Status</Select.Item>
                        <Select.Item value="BORROWED">Borrowed</Select.Item>
                        <Select.Item value="RETURNED">Returned</Select.Item>
                        <Select.Item value="OVERDUE">Overdue</Select.Item>
                        <Select.Item value="LOST">Lost</Select.Item>
                        <Select.Item value="DAMAGED">Damaged</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button
                      variant={showOverdueOnly ? "solid" : "outline"}
                      onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                    >
                      Overdue Only
                    </Button>
                  </Flex>
                </Flex>

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Book</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Fine</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {borrowings.map((borrowing) => (
                      <Table.Row key={borrowing.id}>
                        <Table.Cell>
                          <Flex direction="column">
                            <Text weight="bold">{borrowing.user.name}</Text>
                            <Text size="1" color="gray">
                              {borrowing.user.email}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex direction="column">
                            <Text weight="bold">{borrowing.book.title}</Text>
                            <Text size="1" color="gray">
                              by {borrowing.book.author}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex direction="column">
                            <Text>
                              {new Date(borrowing.dueDate).toLocaleDateString()}
                            </Text>
                            {borrowing.isOverdue && (
                              <Text size="1" color="red">
                                {borrowing.daysOverdue} days overdue
                              </Text>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(
                            borrowing.status,
                            borrowing.isOverdue
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {borrowing.fine ? (
                            <Flex direction="column">
                              <Text>${borrowing.fine.amount}</Text>
                              {getStatusBadge(borrowing.fine.status)}
                            </Flex>
                          ) : (
                            <Text color="gray">No fine</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            {borrowing.status === "BORROWED" && (
                              <>
                                <IconButton
                                  size="1"
                                  onClick={() => {
                                    setSelectedItem(borrowing);
                                    setActionType("return");
                                    setShowActionDialog(true);
                                  }}
                                >
                                  <CheckIcon />
                                </IconButton>
                                <IconButton
                                  size="1"
                                  color="orange"
                                  onClick={() => {
                                    setSelectedItem(borrowing);
                                    setActionType("mark_overdue");
                                    setShowActionDialog(true);
                                  }}
                                >
                                  <Cross2Icon />
                                </IconButton>
                                <IconButton
                                  size="1"
                                  color="red"
                                  onClick={() => {
                                    setSelectedItem(borrowing);
                                    setActionType("issue_fine");
                                    setShowActionDialog(true);
                                  }}
                                >
                                  <PlusIcon />
                                </IconButton>
                              </>
                            )}
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="fines" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    Fines Management
                  </Text>
                  <Flex gap="3" align="center">
                    <TextField.Root
                      placeholder="Search fines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                      </TextField.Slot>
                    </TextField.Root>
                    <Select.Root
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <Select.Trigger placeholder="Filter by status" />
                      <Select.Content>
                        <Select.Item value="all">All Status</Select.Item>
                        <Select.Item value="UNPAID">Unpaid</Select.Item>
                        <Select.Item value="PAID">Paid</Select.Item>
                        <Select.Item value="WAIVED">Waived</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button onClick={() => setShowCreateFine(true)}>
                      <PlusIcon />
                      Create Fine
                    </Button>
                  </Flex>
                </Flex>

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Book</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {fines.map((fine) => (
                      <Table.Row key={fine.id}>
                        <Table.Cell>
                          <Flex direction="column">
                            <Text weight="bold">{fine.user.name}</Text>
                            <Text size="1" color="gray">
                              {fine.user.email}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{fine.borrowing.book.title}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text weight="bold">${fine.amount}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{fine.reason}</Text>
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(fine.status)}</Table.Cell>
                        <Table.Cell>
                          <Text>
                            {new Date(fine.createdAt).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {fine.status === "UNPAID" && (
                            <Flex gap="2">
                              <IconButton
                                size="1"
                                color="green"
                                onClick={() => {
                                  setSelectedItem(fine);
                                  setActionType("mark_paid");
                                  setShowActionDialog(true);
                                }}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                size="1"
                                color="gray"
                                onClick={() => {
                                  setSelectedItem(fine);
                                  setActionType("waive");
                                  setShowActionDialog(true);
                                }}
                              >
                                <Cross2Icon />
                              </IconButton>
                            </Flex>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="users" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    Users Management
                  </Text>
                  <TextField.Root
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  >
                    <TextField.Slot>
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                </Flex>

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Member Since
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Borrowings
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Unpaid Fines
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Unread Notifications
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {users.map((user) => (
                      <Table.Row key={user.id}>
                        <Table.Cell>
                          <Flex align="center" gap="3">
                            <Avatar size="2" fallback={user.name.charAt(0)} />
                            <Flex direction="column">
                              <Text weight="bold">{user.name}</Text>
                              <Text size="1" color="gray">
                                {user.email}
                              </Text>
                            </Flex>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(user.membershipStatus)}
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            {new Date(user.memberSince).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{user._count.borrowings}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color={user._count.fines > 0 ? "red" : "gray"}>
                            {user._count.fines}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            color={
                              user._count.notifications > 0 ? "blue" : "gray"
                            }
                          >
                            {user._count.notifications}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <IconButton
                            size="1"
                            onClick={() => {
                              setNotificationForm({
                                ...notificationForm,
                                userId: user.id,
                              });
                              setShowCreateNotification(true);
                            }}
                          >
                            <PlusIcon />
                          </IconButton>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="notifications" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    Notifications Management
                  </Text>
                  <Flex gap="3" align="center">
                    <Select.Root
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <Select.Trigger placeholder="Filter by type" />
                      <Select.Content>
                        <Select.Item value="all">All Types</Select.Item>
                        <Select.Item value="GENERAL">General</Select.Item>
                        <Select.Item value="DUE_DATE_REMINDER">
                          Due Date Reminder
                        </Select.Item>
                        <Select.Item value="OVERDUE_NOTICE">
                          Overdue Notice
                        </Select.Item>
                        <Select.Item value="FINE_ISSUED">
                          Fine Issued
                        </Select.Item>
                        <Select.Item value="RESERVATION_READY">
                          Reservation Ready
                        </Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button onClick={() => setShowCreateNotification(true)}>
                      <PlusIcon />
                      Send Notification
                    </Button>
                  </Flex>
                </Flex>

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {notifications.map((notification) => (
                      <Table.Row key={notification.id}>
                        <Table.Cell>
                          <Flex direction="column">
                            <Text weight="bold">{notification.user.name}</Text>
                            <Text size="1" color="gray">
                              {notification.user.email}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{notification.title}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge>{notification.type}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            color={notification.isRead ? "green" : "orange"}
                          >
                            {notification.isRead ? "Read" : "Unread"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card>
          </Tabs.Content>

          {/* Books Management Tab */}
          <Tabs.Content value="books" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    Books Management
                  </Text>
                  <Flex gap="3" align="center">
                    <Select.Root
                      value={bookFilter}
                      onValueChange={setBookFilter}
                    >
                      <Select.Trigger placeholder="Filter by format" />
                      <Select.Content>
                        <Select.Item value="all">All Formats</Select.Item>
                        <Select.Item value="PHYSICAL">Physical</Select.Item>
                        <Select.Item value="EBOOK">Ebook</Select.Item>
                        <Select.Item value="AUDIOBOOK">Audiobook</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <TextField.Root
                      placeholder="Search books..."
                      value={bookSearchTerm}
                      onChange={(e) => setBookSearchTerm(e.target.value)}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                      </TextField.Slot>
                    </TextField.Root>
                    <Dialog.Root
                      open={showAddBookDialog}
                      onOpenChange={setShowAddBookDialog}
                    >
                      <Dialog.Trigger>
                        <Button>
                          <PlusIcon width="16" height="16" />
                          Add Book
                        </Button>
                      </Dialog.Trigger>
                    </Dialog.Root>
                  </Flex>
                </Flex>

                {/* Books Table */}
                <Box className="overflow-x-auto">
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>
                          Book Details
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Author</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>ISBN</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Format</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Copies</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>
                          Condition
                        </Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {books.map((book) => (
                        <Table.Row key={book.id}>
                          <Table.Cell>
                            <Flex align="center" gap="3">
                              <Avatar
                                size="3"
                                src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`}
                                fallback={book.title.charAt(0)}
                              />
                              <Flex direction="column">
                                <Text weight="bold">{book.title}</Text>
                                <Text size="2" color="gray">
                                  {book.publishedYear} • {book.publisher}
                                </Text>
                                {book.genres.length > 0 && (
                                  <Flex gap="1" mt="1">
                                    {book.genres.slice(0, 2).map((genre) => (
                                      <Badge
                                        key={genre.id}
                                        size="1"
                                        variant="soft"
                                      >
                                        {genre.genre.name}
                                      </Badge>
                                    ))}
                                    {book.genres.length > 2 && (
                                      <Badge size="1" variant="soft">
                                        +{book.genres.length - 2}
                                      </Badge>
                                    )}
                                  </Flex>
                                )}
                              </Flex>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{book.author}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2" className="font-mono">
                              {book.isbn}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                book.format === "PHYSICAL"
                                  ? "blue"
                                  : book.format === "EBOOK"
                                  ? "green"
                                  : "purple"
                              }
                            >
                              {book.format}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>
                              {book.availableCopies}/{book.totalCopies}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              color={
                                book.condition === "NEW"
                                  ? "green"
                                  : book.condition === "GOOD"
                                  ? "blue"
                                  : book.condition === "FAIR"
                                  ? "yellow"
                                  : "red"
                              }
                            >
                              {book.condition}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex gap="2">
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() =>
                                  router.push(`/librarian/books/${book.id}`)
                                }
                              >
                                Edit
                              </Button>
                              <Button size="1" variant="soft" color="red">
                                Delete
                              </Button>
                            </Flex>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Box>
            </Card>
          </Tabs.Content>
        </Tabs.Root>

        {/* Create Notification Dialog */}
        <Dialog.Root
          open={showCreateNotification}
          onOpenChange={(open) => {
            setShowCreateNotification(open);
            if (open) fetchBorrowingUsers();
          }}
        >
          <Dialog.Content maxWidth="600px">
            <Dialog.Title>Send Notification</Dialog.Title>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Select User
                </Text>
                {loadingUsers ? (
                  <Text>Loading users...</Text>
                ) : (
                  <Box className="max-h-48 overflow-y-auto border rounded p-2">
                    {borrowingUsers.map((user) => (
                      <Flex
                        key={user.id}
                        align="center"
                        gap="2"
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() =>
                          setNotificationForm({
                            ...notificationForm,
                            userId: user.id,
                          })
                        }
                      >
                        <input
                          type="radio"
                          checked={notificationForm.userId === user.id}
                          onChange={() => {}}
                        />
                        <Avatar size="1" fallback={user.name.charAt(0)} />
                        <Flex direction="column">
                          <Text weight="bold">{user.name}</Text>
                          <Text size="1" color="gray">
                            {user.email} • {user.borrowings.length} active
                            borrowings
                          </Text>
                        </Flex>
                      </Flex>
                    ))}
                  </Box>
                )}
                <Text as="div" size="1" color="gray" mt="1">
                  Or enter User ID manually:
                </Text>
                <TextField.Root
                  placeholder="Enter user ID"
                  value={notificationForm.userId}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      userId: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Title
                </Text>
                <TextField.Root
                  placeholder="Notification title"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Message
                </Text>
                <TextArea
                  placeholder="Notification message"
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Type
                </Text>
                <Select.Root
                  value={notificationForm.type}
                  onValueChange={(value) =>
                    setNotificationForm({ ...notificationForm, type: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="GENERAL">General</Select.Item>
                    <Select.Item value="DUE_DATE_REMINDER">
                      Due Date Reminder
                    </Select.Item>
                    <Select.Item value="OVERDUE_NOTICE">
                      Overdue Notice
                    </Select.Item>
                    <Select.Item value="FINE_ISSUED">Fine Issued</Select.Item>
                    <Select.Item value="FINE_REMINDER">
                      Fine Reminder
                    </Select.Item>
                    <Select.Item value="SYSTEM_MAINTENANCE">
                      System Maintenance
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Action URL (Optional)
                </Text>
                <TextField.Root
                  placeholder="e.g., /dashboard"
                  value={notificationForm.actionUrl}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      actionUrl: e.target.value,
                    })
                  }
                />
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleCreateNotification}>
                Send Notification
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Create Fine Dialog */}
        <Dialog.Root
          open={showCreateFine}
          onOpenChange={(open) => {
            setShowCreateFine(open);
            if (open) fetchBorrowingUsers();
          }}
        >
          <Dialog.Content maxWidth="700px">
            <Dialog.Title>Create Fine</Dialog.Title>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Select Borrowing
                </Text>
                {loadingUsers ? (
                  <Text>Loading users and borrowings...</Text>
                ) : (
                  <Box className="max-h-64 overflow-y-auto border rounded p-2">
                    {borrowingUsers.map((user) => (
                      <Box key={user.id} className="mb-2">
                        <Flex
                          align="center"
                          gap="2"
                          className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            const newExpanded = new Set(expandedUsers);
                            if (expandedUsers.has(user.id)) {
                              newExpanded.delete(user.id);
                            } else {
                              newExpanded.add(user.id);
                            }
                            setExpandedUsers(newExpanded);
                          }}
                        >
                          <Text>{expandedUsers.has(user.id) ? "▼" : "▶"}</Text>
                          <Avatar size="1" fallback={user.name.charAt(0)} />
                          <Flex direction="column">
                            <Text weight="bold">{user.name}</Text>
                            <Text size="1" color="gray">
                              {user.email} • {user.borrowings.length} active
                              borrowings
                            </Text>
                          </Flex>
                        </Flex>
                        {expandedUsers.has(user.id) && (
                          <Box className="ml-6 mt-2">
                            {user.borrowings.map((borrowing) => (
                              <Flex
                                key={borrowing.id}
                                align="center"
                                gap="2"
                                className="p-2 hover:bg-blue-50 rounded cursor-pointer"
                                onClick={() => {
                                  setFineForm({
                                    ...fineForm,
                                    borrowingId: borrowing.id,
                                  });
                                  setSelectedBorrowing(borrowing.id);
                                }}
                              >
                                <input
                                  type="radio"
                                  checked={selectedBorrowing === borrowing.id}
                                  onChange={() => {}}
                                />
                                <Flex direction="column" className="flex-1">
                                  <Text weight="bold">
                                    {borrowing.book.title}
                                  </Text>
                                  <Text size="1" color="gray">
                                    by {borrowing.book.author} • Due:{" "}
                                    {new Date(
                                      borrowing.dueDate
                                    ).toLocaleDateString()}
                                  </Text>
                                  <Badge
                                    color={
                                      borrowing.status === "BORROWED"
                                        ? "blue"
                                        : "gray"
                                    }
                                  >
                                    {borrowing.status}
                                  </Badge>
                                </Flex>
                              </Flex>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                <Text as="div" size="1" color="gray" mt="1">
                  Or enter Borrowing ID manually:
                </Text>
                <TextField.Root
                  placeholder="Enter borrowing ID"
                  value={fineForm.borrowingId}
                  onChange={(e) =>
                    setFineForm({ ...fineForm, borrowingId: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Amount ($)
                </Text>
                <TextField.Root
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={fineForm.amount}
                  onChange={(e) =>
                    setFineForm({ ...fineForm, amount: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Reason
                </Text>
                <TextArea
                  placeholder="Reason for the fine"
                  value={fineForm.reason}
                  onChange={(e) =>
                    setFineForm({ ...fineForm, reason: e.target.value })
                  }
                />
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleCreateFine}>Create Fine</Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Action Dialog */}
        <Dialog.Root open={showActionDialog} onOpenChange={setShowActionDialog}>
          <Dialog.Content maxWidth="450px">
            <Dialog.Title>
              {actionType === "return" && "Return Book"}
              {actionType === "mark_overdue" && "Mark as Overdue"}
              {actionType === "mark_paid" && "Mark Fine as Paid"}
              {actionType === "waive" && "Waive Fine"}
              {actionType === "issue_fine" && "Issue Fine"}
            </Dialog.Title>
            <Flex direction="column" gap="3">
              {(actionType === "return" || actionType === "mark_overdue") && (
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Notes (Optional)
                  </Text>
                  <TextArea
                    placeholder="Add any notes about this action"
                    value={actionForm.notes}
                    onChange={(e) =>
                      setActionForm({ ...actionForm, notes: e.target.value })
                    }
                  />
                </label>
              )}
              {actionType === "issue_fine" && (
                <>
                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Fine Amount ($)
                    </Text>
                    <TextField.Root
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={actionForm.fineAmount}
                      onChange={(e) =>
                        setActionForm({
                          ...actionForm,
                          fineAmount: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Reason
                    </Text>
                    <TextArea
                      placeholder="Reason for the fine"
                      value={actionForm.fineReason}
                      onChange={(e) =>
                        setActionForm({
                          ...actionForm,
                          fineReason: e.target.value,
                        })
                      }
                    />
                  </label>
                </>
              )}
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                onClick={
                  selectedItem && "amount" in selectedItem
                    ? handleFineAction
                    : handleBorrowingAction
                }
              >
                Confirm
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Add Book Dialog */}
        <Dialog.Root
          open={showAddBookDialog}
          onOpenChange={setShowAddBookDialog}
        >
          <Dialog.Content maxWidth="800px">
            <Dialog.Title>Add New Book</Dialog.Title>
            <Flex direction="column" gap="4">
              <Grid columns="2" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Title *
                  </Text>
                  <TextField.Root
                    placeholder="Book title"
                    value={bookForm.title}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Author *
                  </Text>
                  <TextField.Root
                    placeholder="Author name"
                    value={bookForm.author}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, author: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    ISBN *
                  </Text>
                  <TextField.Root
                    placeholder="ISBN number"
                    value={bookForm.isbn}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, isbn: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Published Year
                  </Text>
                  <TextField.Root
                    type="number"
                    placeholder="Year"
                    value={bookForm.publishedYear.toString()}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        publishedYear:
                          parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Publisher
                  </Text>
                  <TextField.Root
                    placeholder="Publisher name"
                    value={bookForm.publisher}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, publisher: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Language
                  </Text>
                  <Select.Root
                    value={bookForm.language}
                    onValueChange={(value) =>
                      setBookForm({ ...bookForm, language: value })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="English">English</Select.Item>
                      <Select.Item value="Vietnamese">Vietnamese</Select.Item>
                      <Select.Item value="French">French</Select.Item>
                      <Select.Item value="Spanish">Spanish</Select.Item>
                      <Select.Item value="German">German</Select.Item>
                      <Select.Item value="Chinese">Chinese</Select.Item>
                      <Select.Item value="Japanese">Japanese</Select.Item>
                      <Select.Item value="Other">Other</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Page Count
                  </Text>
                  <TextField.Root
                    type="number"
                    placeholder="Number of pages"
                    value={bookForm.pageCount}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, pageCount: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Total Copies
                  </Text>
                  <TextField.Root
                    type="number"
                    placeholder="Number of copies"
                    value={bookForm.totalCopies.toString()}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        totalCopies: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Location
                  </Text>
                  <TextField.Root
                    placeholder="Shelf location (e.g., A1-B2)"
                    value={bookForm.location}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, location: e.target.value })
                    }
                  />
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Format
                  </Text>
                  <Select.Root
                    value={bookForm.format}
                    onValueChange={(value) =>
                      setBookForm({ ...bookForm, format: value })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="PHYSICAL">Physical</Select.Item>
                      <Select.Item value="DIGITAL">Digital</Select.Item>
                      <Select.Item value="AUDIO">Audio</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Condition
                  </Text>
                  <Select.Root
                    value={bookForm.condition}
                    onValueChange={(value) =>
                      setBookForm({ ...bookForm, condition: value })
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
              </Grid>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
                <TextArea
                  placeholder="Book description"
                  value={bookForm.description}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, description: e.target.value })
                  }
                  rows={4}
                />
              </label>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Genres
                </Text>
                <Box className="grid grid-cols-3 gap-2 p-3 border rounded">
                  {genres.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bookForm.genreIds.includes(genre.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBookForm({
                              ...bookForm,
                              genreIds: [...bookForm.genreIds, genre.id],
                            });
                          } else {
                            setBookForm({
                              ...bookForm,
                              genreIds: bookForm.genreIds.filter(
                                (id) => id !== genre.id
                              ),
                            });
                          }
                        }}
                      />
                      <Text size="2">{genre.name}</Text>
                    </label>
                  ))}
                </Box>
              </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleCreateBook}
                disabled={!bookForm.title || !bookForm.author || !bookForm.isbn}
              >
                Add Book
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </ProtectedRoute>
  );
}
