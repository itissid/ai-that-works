import { type NextRequest, NextResponse } from "next/server";
import { createMagicToken, sendMagicLinkEmail } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const token = createMagicToken(email.toLowerCase());
    await sendMagicLinkEmail(email.toLowerCase(), token);

    return NextResponse.json(
      {
        message:
          "Magic link sent. Check your email (or console in development).",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
