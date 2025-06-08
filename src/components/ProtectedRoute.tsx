"use client";

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Text } from "@radix-ui/themes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"USER" | "LIBRARIAN" | "ADMIN">;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["USER", "LIBRARIAN", "ADMIN"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Loading...</Text>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Text size="5" color="red" className="mb-4">
            Access Denied
          </Text>
          <Text color="gray">
            You don't have permission to access this page.
          </Text>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
