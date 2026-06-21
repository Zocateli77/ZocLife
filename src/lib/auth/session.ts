import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  DEFAULT_USER_ID,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "./constants";

export type SessionPayload = {
  userId: string;
  email: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(email: string): Promise<string> {
  const payload: SessionPayload = {
    userId: DEFAULT_USER_ID,
    email,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function validateCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.APP_LOGIN_EMAIL;
  const expectedPassword = process.env.APP_LOGIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    throw new Error("APP_LOGIN_EMAIL and APP_LOGIN_PASSWORD must be configured");
  }

  return email === expectedEmail && password === expectedPassword;
}
