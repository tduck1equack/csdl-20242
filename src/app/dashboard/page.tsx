"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";

interface DashboardStats {
  activeBorrowings: number;
  overdueBooks: number;
  activeReservations: number;
  unreadNotifications: number;
  totalBooksRead: number;
  unpaidFines: {
    count: number;
    totalAmount: number;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImage?: string;
}

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  renewalCount: number;
  book: Book;
}

interface Reservation {
  id: string;
  reservationDate: string;
  status: string;
  expiryDate?: string;
  book: Book & { availableCopies: number };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "borrowings" | "reservations" | "notifications"
  >("borrowings");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      router.push("/login");
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      const [statsRes, borrowingsRes, reservationsRes, notificationsRes] =
        await Promise.all([
          fetch(`/api/dashboard/stats?userId=${user.id}`),
          fetch(`/api/dashboard/borrowings?userId=${user.id}&limit=5`),
          fetch(`/api/dashboard/reservations?userId=${user.id}&limit=5`),
          fetch(`/api/dashboard/notifications?userId=${user.id}&limit=5`),
        ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (borrowingsRes.ok) {
        const borrowingsData = await borrowingsRes.json();
        setBorrowings(borrowingsData.borrowings);
      }

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        setReservations(reservationsData.reservations);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowingAction = async (
    borrowingId: string,
    action: "renew" | "return"
  ) => {
    try {
      setActionLoading(borrowingId);

      const response = await fetch(`/api/dashboard/borrowings/${borrowingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || "Action failed");
      }
    } catch (error) {
      console.error("Error performing borrowing action:", error);
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReservationAction = async (
    reservationId: string,
    action: "claim" | "cancel"
  ) => {
    try {
      setActionLoading(reservationId);

      const response = await fetch(
        `/api/dashboard/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || "Action failed");
      }
    } catch (error) {
      console.error("Error performing reservation action:", error);
      alert("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const markNotificationsAsRead = async (notificationIds?: string[]) => {
    if (!user) return;

    try {
      const response = await fetch("/api/dashboard/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          notificationIds,
          markAsRead: true,
        }),
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (!user) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.name}!
            </h1>
            <p className="mt-2 text-gray-600">Manage your library activities</p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Borrowings</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activeBorrowings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Overdue Books</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.overdueBooks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Reservations</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activeReservations}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Books Read</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalBooksRead}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fines Alert */}
          {stats && stats.unpaidFines.count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Outstanding Fines
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have {stats.unpaidFines.count} unpaid fine(s) totaling $
                    {stats.unpaidFines.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("borrowings")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "borrowings"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Current Borrowings
                </button>
                <button
                  onClick={() => setActiveTab("reservations")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "reservations"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Reservations
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "notifications"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Notifications
                  {stats && stats.unreadNotifications > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {stats.unreadNotifications}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Borrowings Tab */}
              {activeTab === "borrowings" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      Current Borrowings
                    </h2>
                  </div>
                  {borrowings.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No current borrowings
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Visit the library to borrow some books!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {borrowings.map((borrowing) => (
                        <div
                          key={borrowing.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex">
                              {borrowing.book.coverImage && (
                                <img
                                  src={borrowing.book.coverImage}
                                  alt={borrowing.book.title}
                                  className="w-16 h-20 object-cover rounded mr-4"
                                />
                              )}
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {borrowing.book.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {borrowing.book.author}
                                </p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-gray-500">
                                    Borrowed: {formatDate(borrowing.borrowDate)}
                                  </p>
                                  <p
                                    className={`text-sm ${
                                      isOverdue(borrowing.dueDate)
                                        ? "text-red-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Due: {formatDate(borrowing.dueDate)}
                                    {isOverdue(borrowing.dueDate) &&
                                      " (Overdue)"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Renewals: {borrowing.renewalCount}/2
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {borrowing.status === "BORROWED" &&
                                borrowing.renewalCount < 2 &&
                                !isOverdue(borrowing.dueDate) && (
                                  <button
                                    onClick={() =>
                                      handleBorrowingAction(
                                        borrowing.id,
                                        "renew"
                                      )
                                    }
                                    disabled={actionLoading === borrowing.id}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                  >
                                    {actionLoading === borrowing.id
                                      ? "Renewing..."
                                      : "Renew"}
                                  </button>
                                )}
                              {borrowing.status === "BORROWED" && (
                                <button
                                  onClick={() =>
                                    handleBorrowingAction(
                                      borrowing.id,
                                      "return"
                                    )
                                  }
                                  disabled={actionLoading === borrowing.id}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                  {actionLoading === borrowing.id
                                    ? "Returning..."
                                    : "Return"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reservations Tab */}
              {activeTab === "reservations" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      Reservations
                    </h2>
                  </div>
                  {reservations.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No reservations
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Reserve books when they are not available!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex">
                              {reservation.book.coverImage && (
                                <img
                                  src={reservation.book.coverImage}
                                  alt={reservation.book.title}
                                  className="w-16 h-20 object-cover rounded mr-4"
                                />
                              )}
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {reservation.book.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {reservation.book.author}
                                </p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-gray-500">
                                    Reserved:{" "}
                                    {formatDate(reservation.reservationDate)}
                                  </p>
                                  <p
                                    className={`text-sm font-medium ${
                                      reservation.status === "READY"
                                        ? "text-green-600"
                                        : reservation.status === "PENDING"
                                        ? "text-yellow-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Status: {reservation.status}
                                  </p>
                                  {reservation.expiryDate &&
                                    reservation.status === "READY" && (
                                      <p className="text-sm text-red-600">
                                        Expires:{" "}
                                        {formatDate(reservation.expiryDate)}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {reservation.status === "READY" && (
                                <button
                                  onClick={() =>
                                    handleReservationAction(
                                      reservation.id,
                                      "claim"
                                    )
                                  }
                                  disabled={actionLoading === reservation.id}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                  {actionLoading === reservation.id
                                    ? "Claiming..."
                                    : "Claim"}
                                </button>
                              )}
                              {(reservation.status === "PENDING" ||
                                reservation.status === "READY") && (
                                <button
                                  onClick={() =>
                                    handleReservationAction(
                                      reservation.id,
                                      "cancel"
                                    )
                                  }
                                  disabled={actionLoading === reservation.id}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                  {actionLoading === reservation.id
                                    ? "Cancelling..."
                                    : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      Notifications
                    </h2>
                    {notifications.some((n) => !n.isRead) && (
                      <button
                        onClick={() => markNotificationsAsRead()}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5 5v-5zM5 12V7a5 5 0 1110 0v5l-2 3H7l-2-3z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No notifications
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You will see library notifications here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border rounded-lg p-4 ${
                            notification.isRead
                              ? "border-gray-200 bg-white"
                              : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  View
                                </a>
                              )}
                              {!notification.isRead && (
                                <button
                                  onClick={() =>
                                    markNotificationsAsRead([notification.id])
                                  }
                                  className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
