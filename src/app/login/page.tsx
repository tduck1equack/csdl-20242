"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Flex,
  Text,
  TextField,
  Heading,
  Box,
} from "@radix-ui/themes";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(email, password);

    if (success) {
      router.push("/");
    } else {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <Box p="6">
          <Heading size="6" className="text-center mb-6">
            Login to Library System
          </Heading>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <div>
                <Text size="2" weight="medium" className="mb-2 block">
                  Email
                </Text>
                <TextField.Root
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Text size="2" weight="medium" className="mb-2 block">
                  Password
                </Text>
                <TextField.Root
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <Text size="2" color="red">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                size="3"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Flex>
          </form>

          <Box className="mt-6 p-4 bg-gray-50 rounded">
            <Text size="1" className="text-gray-600 mb-2 block">
              Demo Accounts:
            </Text>
            <Text size="1" className="text-gray-600 block">
              User: user@library.com / password123
            </Text>
            <Text size="1" className="text-gray-600 block">
              Librarian: librarian@library.com / password123
            </Text>
            <Text size="1" className="text-gray-600 block">
              Admin: admin@library.com / password123
            </Text>
          </Box>
        </Box>
      </Card>
    </div>
  );
}
