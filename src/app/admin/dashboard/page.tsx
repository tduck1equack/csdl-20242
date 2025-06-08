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
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAuthHeaders } from "@/lib/auth";

interface AdminStats {
  users: {
    total: number;
    admins: number;
    librarians: number;
    members: number;
    newThisWeek: number;
    activeMembers: number;
    suspendedMembers: number;
  };
  borrowings: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  fines: {
    total: number;
    unpaid: number;
    totalAmount: number;
  };
  books: {
    total: number;
    available: number;
    borrowed: number;
  };
  notifications: {
    sent: number;
    unread: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipStatus: string;
  memberSince: string;
  lastLogin?: string;
  _count: {
    borrowings: number;
    fines: number;
    notifications: number;
  };
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showBroadcastNotification, setShowBroadcastNotification] =
    useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    membershipStatus: "ACTIVE",
  });

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "GENERAL",
    actionUrl: "",
    sendToAll: false,
    targetRole: "all",
    targetUserId: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "notifications") {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm, filterRole, filterStatus]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(filterRole !== "all" && { role: filterRole }),
        ...(filterStatus !== "all" && { status: filterStatus }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: getAuthHeaders(),
      });
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
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { type: filterStatus }),
      });

      const response = await fetch(`/api/admin/notifications?${params}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        await fetchUsers();
        await fetchDashboardData();
        setShowCreateUser(false);
        setUserForm({
          name: "",
          email: "",
          password: "",
          role: "USER",
          membershipStatus: "ACTIVE",
        });
      } else {
        const error = await response.json();
        alert(`Error creating user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        await fetchUsers();
        await fetchDashboardData();
        setShowEditUser(false);
        setSelectedUser(null);
        setUserForm({
          name: "",
          email: "",
          password: "",
          role: "USER",
          membershipStatus: "ACTIVE",
        });
      } else {
        const error = await response.json();
        alert(`Error updating user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchUsers();
        await fetchDashboardData();
        setShowDeleteUser(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(`Error deleting user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationForm),
      });

      if (response.ok) {
        await fetchNotifications();
        await fetchDashboardData();
        setShowBroadcastNotification(false);
        setShowSendNotification(false);
        setNotificationForm({
          title: "",
          message: "",
          type: "GENERAL",
          actionUrl: "",
          sendToAll: false,
          targetRole: "all",
          targetUserId: "",
        });
      } else {
        const error = await response.json();
        alert(`Error sending notification: ${error.message}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Error sending notification");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColorMap = {
      ACTIVE: "green" as const,
      SUSPENDED: "red" as const,
      PENDING: "yellow" as const,
      EXPIRED: "gray" as const,
    };

    const color =
      statusColorMap[status as keyof typeof statusColorMap] || "gray";
    return <Badge color={color}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColorMap = {
      ADMIN: "purple" as const,
      LIBRARIAN: "blue" as const,
      USER: "gray" as const,
    };

    const color = roleColorMap[role as keyof typeof roleColorMap] || "gray";
    return <Badge color={color}>{role}</Badge>;
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Text>Loading admin dashboard...</Text>
      </Box>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Box className="container mx-auto px-4 py-6">
        <Flex justify="between" align="center" className="mb-6">
          <Text size="8" weight="bold">
            Admin Dashboard
          </Text>
        </Flex>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="users">User Management</Tabs.Trigger>
            <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
            <Tabs.Trigger value="system">System Settings</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview" className="mt-6">
            {stats && (
              <Grid columns="4" gap="4" className="mb-6">
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
                      Total Fines
                    </Text>
                    <Text size="6" weight="bold">
                      ${stats.fines.totalAmount.toFixed(2)}
                    </Text>
                    <Text size="1" color="red">
                      ${stats.fines.unpaid.toFixed(2)} unpaid
                    </Text>
                  </Flex>
                </Card>

                <Card>
                  <Flex direction="column" gap="2" className="p-4">
                    <Text size="2" color="gray">
                      Books Available
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

            <Grid columns="2" gap="4" className="mb-6">
              <Card>
                <Box className="p-6">
                  <Text size="4" weight="bold" className="mb-4">
                    User Statistics
                  </Text>
                  {stats && (
                    <Flex direction="column" gap="3">
                      <Flex justify="between">
                        <Text>Admins:</Text>
                        <Badge color="purple">{stats.users.admins}</Badge>
                      </Flex>
                      <Flex justify="between">
                        <Text>Librarians:</Text>
                        <Badge color="blue">{stats.users.librarians}</Badge>
                      </Flex>
                      <Flex justify="between">
                        <Text>Members:</Text>
                        <Badge color="gray">{stats.users.members}</Badge>
                      </Flex>
                      <Flex justify="between">
                        <Text>Active Members:</Text>
                        <Badge color="green">{stats.users.activeMembers}</Badge>
                      </Flex>
                      <Flex justify="between">
                        <Text>Suspended:</Text>
                        <Badge color="red">
                          {stats.users.suspendedMembers}
                        </Badge>
                      </Flex>
                    </Flex>
                  )}
                </Box>
              </Card>

              <Card>
                <Box className="p-6">
                  <Text size="4" weight="bold" className="mb-4">
                    Quick Actions
                  </Text>
                  <Flex direction="column" gap="3">
                    <Button onClick={() => setShowCreateUser(true)}>
                      <PlusIcon />
                      Add New User
                    </Button>
                    <Button onClick={() => setShowBroadcastNotification(true)}>
                      <PlusIcon />
                      Broadcast Notification
                    </Button>
                    <Button onClick={() => setActiveTab("users")}>
                      Manage Users
                    </Button>
                    <Button onClick={() => setActiveTab("notifications")}>
                      View All Notifications
                    </Button>
                  </Flex>
                </Box>
              </Card>
            </Grid>
          </Tabs.Content>

          <Tabs.Content value="users" className="mt-6">
            <Card>
              <Box className="p-6">
                <Flex justify="between" align="center" className="mb-4">
                  <Text size="4" weight="bold">
                    User Management
                  </Text>
                  <Flex gap="3" align="center">
                    <TextField.Root
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    >
                      <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                      </TextField.Slot>
                    </TextField.Root>
                    <Select.Root
                      value={filterRole}
                      onValueChange={setFilterRole}
                    >
                      <Select.Trigger placeholder="Filter by role" />
                      <Select.Content>
                        <Select.Item value="all">All Roles</Select.Item>
                        <Select.Item value="ADMIN">Admin</Select.Item>
                        <Select.Item value="LIBRARIAN">Librarian</Select.Item>
                        <Select.Item value="USER">User</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Select.Root
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <Select.Trigger placeholder="Filter by status" />
                      <Select.Content>
                        <Select.Item value="all">All Status</Select.Item>
                        <Select.Item value="ACTIVE">Active</Select.Item>
                        <Select.Item value="SUSPENDED">Suspended</Select.Item>
                        <Select.Item value="PENDING">Pending</Select.Item>
                        <Select.Item value="EXPIRED">Expired</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button onClick={() => setShowCreateUser(true)}>
                      <PlusIcon />
                      Add User
                    </Button>
                  </Flex>
                </Flex>

                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>
                        Member Since
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Activity</Table.ColumnHeaderCell>
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
                        <Table.Cell>{getRoleBadge(user.role)}</Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(user.membershipStatus)}
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            {new Date(user.memberSince).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex direction="column" gap="1">
                            <Text size="1">
                              {user._count.borrowings} borrowings
                            </Text>
                            <Text size="1">{user._count.fines} fines</Text>
                            <Text size="1">
                              {user._count.notifications} notifications
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <IconButton
                              size="1"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserForm({
                                  name: user.name,
                                  email: user.email,
                                  password: "",
                                  role: user.role,
                                  membershipStatus: user.membershipStatus,
                                });
                                setShowEditUser(true);
                              }}
                            >
                              <Pencil1Icon />
                            </IconButton>
                            <IconButton
                              size="1"
                              onClick={() => {
                                setNotificationForm({
                                  ...notificationForm,
                                  targetUserId: user.id,
                                  sendToAll: false,
                                });
                                setShowSendNotification(true);
                              }}
                            >
                              <PlusIcon />
                            </IconButton>
                            <IconButton
                              size="1"
                              color="red"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteUser(true);
                              }}
                            >
                              <TrashIcon />
                            </IconButton>
                          </Flex>
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
                    <TextField.Root
                      placeholder="Search notifications..."
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
                      <Select.Trigger placeholder="Filter by type" />
                      <Select.Content>
                        <Select.Item value="all">All Types</Select.Item>
                        <Select.Item value="GENERAL">General</Select.Item>
                        <Select.Item value="SYSTEM_MAINTENANCE">
                          System Maintenance
                        </Select.Item>
                        <Select.Item value="ANNOUNCEMENT">
                          Announcement
                        </Select.Item>
                        <Select.Item value="POLICY_UPDATE">
                          Policy Update
                        </Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Button onClick={() => setShowBroadcastNotification(true)}>
                      <PlusIcon />
                      Broadcast Notification
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

          <Tabs.Content value="system" className="mt-6">
            <Card>
              <Box className="p-6">
                <Text size="4" weight="bold" className="mb-4">
                  System Settings
                </Text>
                <Text color="gray">
                  System settings and configuration options will be implemented
                  here.
                </Text>
              </Box>
            </Card>
          </Tabs.Content>
        </Tabs.Root>

        {/* Create User Dialog */}
        <Dialog.Root open={showCreateUser} onOpenChange={setShowCreateUser}>
          <Dialog.Content maxWidth="500px">
            <Dialog.Title>Add New User</Dialog.Title>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Name
                </Text>
                <TextField.Root
                  placeholder="Full name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Email
                </Text>
                <TextField.Root
                  type="email"
                  placeholder="email@example.com"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Password
                </Text>
                <TextField.Root
                  type="password"
                  placeholder="Password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Role
                </Text>
                <Select.Root
                  value={userForm.role}
                  onValueChange={(value) =>
                    setUserForm({ ...userForm, role: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="USER">User</Select.Item>
                    <Select.Item value="LIBRARIAN">Librarian</Select.Item>
                    <Select.Item value="ADMIN">Admin</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Status
                </Text>
                <Select.Root
                  value={userForm.membershipStatus}
                  onValueChange={(value) =>
                    setUserForm({ ...userForm, membershipStatus: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="ACTIVE">Active</Select.Item>
                    <Select.Item value="SUSPENDED">Suspended</Select.Item>
                    <Select.Item value="PENDING">Pending</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleCreateUser}>Create User</Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Edit User Dialog */}
        <Dialog.Root open={showEditUser} onOpenChange={setShowEditUser}>
          <Dialog.Content maxWidth="500px">
            <Dialog.Title>Edit User</Dialog.Title>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Name
                </Text>
                <TextField.Root
                  placeholder="Full name"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, name: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Email
                </Text>
                <TextField.Root
                  type="email"
                  placeholder="email@example.com"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  New Password (leave blank to keep current)
                </Text>
                <TextField.Root
                  type="password"
                  placeholder="New password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Role
                </Text>
                <Select.Root
                  value={userForm.role}
                  onValueChange={(value) =>
                    setUserForm({ ...userForm, role: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="USER">User</Select.Item>
                    <Select.Item value="LIBRARIAN">Librarian</Select.Item>
                    <Select.Item value="ADMIN">Admin</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Status
                </Text>
                <Select.Root
                  value={userForm.membershipStatus}
                  onValueChange={(value) =>
                    setUserForm({ ...userForm, membershipStatus: value })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="ACTIVE">Active</Select.Item>
                    <Select.Item value="SUSPENDED">Suspended</Select.Item>
                    <Select.Item value="PENDING">Pending</Select.Item>
                    <Select.Item value="EXPIRED">Expired</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Delete User Dialog */}
        <Dialog.Root open={showDeleteUser} onOpenChange={setShowDeleteUser}>
          <Dialog.Content maxWidth="400px">
            <Dialog.Title>Delete User</Dialog.Title>
            <Text>
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name}</strong>? This action cannot be
              undone.
            </Text>
            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button color="red" onClick={handleDeleteUser}>
                Delete User
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Broadcast Notification Dialog */}
        <Dialog.Root
          open={showBroadcastNotification}
          onOpenChange={setShowBroadcastNotification}
        >
          <Dialog.Content maxWidth="600px">
            <Dialog.Title>Broadcast Notification</Dialog.Title>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Send to
                </Text>
                <Select.Root
                  value={notificationForm.sendToAll ? "all" : "role"}
                  onValueChange={(value) =>
                    setNotificationForm({
                      ...notificationForm,
                      sendToAll: value === "all",
                    })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value="all">All Users</Select.Item>
                    <Select.Item value="role">By Role</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
              {!notificationForm.sendToAll && (
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Target Role
                  </Text>
                  <Select.Root
                    value={notificationForm.targetRole}
                    onValueChange={(value) =>
                      setNotificationForm({
                        ...notificationForm,
                        targetRole: value,
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="USER">Users</Select.Item>
                      <Select.Item value="LIBRARIAN">Librarians</Select.Item>
                      <Select.Item value="ADMIN">Admins</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </label>
              )}
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
                    <Select.Item value="ANNOUNCEMENT">Announcement</Select.Item>
                    <Select.Item value="SYSTEM_MAINTENANCE">
                      System Maintenance
                    </Select.Item>
                    <Select.Item value="POLICY_UPDATE">
                      Policy Update
                    </Select.Item>
                    <Select.Item value="EMERGENCY">Emergency</Select.Item>
                  </Select.Content>
                </Select.Root>
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Action URL (Optional)
                </Text>
                <TextField.Root
                  placeholder="e.g., /announcements"
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
              <Button onClick={handleSendNotification}>
                Send Notification
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>

        {/* Send Individual Notification Dialog */}
        <Dialog.Root
          open={showSendNotification}
          onOpenChange={setShowSendNotification}
        >
          <Dialog.Content maxWidth="600px">
            <Dialog.Title>Send Notification</Dialog.Title>
            <Flex direction="column" gap="3">
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
                    <Select.Item value="ANNOUNCEMENT">Announcement</Select.Item>
                    <Select.Item value="SYSTEM_MAINTENANCE">
                      System Maintenance
                    </Select.Item>
                    <Select.Item value="POLICY_UPDATE">
                      Policy Update
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
              <Button onClick={handleSendNotification}>
                Send Notification
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </ProtectedRoute>
  );
}
