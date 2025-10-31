import { type NextRequest, NextResponse } from "next/server";
import {
  createSession,
  findOrCreateUser,
  verifyMagicToken,
} from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const email = verifyMagicToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const user = await findOrCreateUser(email);
    await createSession(user.id, user.email);

    return NextResponse.redirect(new URL("/verify", request.url));
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
