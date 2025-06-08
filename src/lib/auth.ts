import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface AuthUser {
  userId: string;
  email: string;
  role: "USER" | "LIBRARIAN" | "ADMIN";
}

// Client-side helper to get authorization headers
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export function validateAuthToken(request: NextRequest): AuthUser | null {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as AuthUser;

    return decoded;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}

export function requireAdmin(request: NextRequest): AuthUser | null {
  const user = validateAuthToken(request);
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export function requireLibrarian(request: NextRequest): AuthUser | null {
  const user = validateAuthToken(request);
  if (!user || (user.role !== "LIBRARIAN" && user.role !== "ADMIN")) {
    return null;
  }
  return user;
}
