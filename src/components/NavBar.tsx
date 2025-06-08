"use client";

import { Button, Box, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <Box className="bg-white shadow-sm border-b">
      <Flex
        justify="between"
        align="center"
        className="container mx-auto px-4 py-3"
      >
        <Link href="/">
          <Text size="5" weight="bold" className="text-blue-600">
            Library System
          </Text>
        </Link>

        <Flex align="center" gap="4">
          <Link href="/books">
            <Button variant="ghost" size="2">
              Books
            </Button>
          </Link>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="2">
                  Dashboard
                </Button>
              </Link>
              <Text size="2" className="text-gray-600">
                Welcome, {user.name}
              </Text>
              <Text
                size="1"
                className="text-gray-500 px-2 py-1 bg-gray-100 rounded"
              >
                {user.role}
              </Text>
              <Button variant="outline" size="2" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="2">Login</Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
