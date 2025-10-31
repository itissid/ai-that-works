import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { config } from "./config";
import { sendMagicLinkEmail } from "./email";

export { sendMagicLinkEmail };

export interface Session {
  userId: string;
  email: string;
  expiresAt: Date;
}

interface MagicLinkTokenPayload {
  email: string;
  exp: number;
}

const SESSION_COOKIE = "session_token";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const TOKEN_DURATION = 15 * 60;

export function createMagicToken(email: string): string {
  const payload: MagicLinkTokenPayload = {
    email: email.toLowerCase().trim(),
    exp: Math.floor(Date.now() / 1000) + TOKEN_DURATION,
  };
  return jwt.sign(payload, config.jwt.secret);
}

export function verifyMagicToken(token: string): string | null {
  try {
    const decoded = jwt.verify(
      token,
      config.jwt.secret,
    ) as MagicLinkTokenPayload;
    return decoded.email;
  } catch {
    return null;
  }
}

export async function findOrCreateUser(email: string): Promise<User> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: { email: normalizedEmail },
  });

  return user;
}

export async function createSession(
  userId: string,
  email: string,
): Promise<void> {
  const session: Session = {
    userId,
    email,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
  };

  const sessionToken = jwt.sign(session, config.jwt.secret);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: config.app.env === "production",
    sameSite: "lax",
    expires: session.expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  try {
    const session = jwt.verify(sessionToken, config.jwt.secret) as Session;
    session.expiresAt = new Date(session.expiresAt);
    return session.expiresAt > new Date() ? session : null;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function sendMagicLink(
  email: string,
  token: string,
): Promise<void> {
  await sendMagicLinkEmail(email, token);
}
