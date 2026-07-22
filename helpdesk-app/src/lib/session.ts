// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-for-development-only-32-chars"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: "MANAGER" | "TECHNICAL" | "EMPLOYEE";
  name: string;
}

/**
 * Encrypts user session payload into a signed JWT string.
 */
export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Session lasts 24 hours
    .sign(SECRET_KEY);
}

/**
 * Decrypts and verifies a JWT token. Returns null if invalid or expired.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Creates an HTTP-only session cookie.
 */
export async function createSession(payload: SessionPayload) {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

/**
 * Gets and verifies the current logged-in user's session from cookies.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Clears the session cookie on logout.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}