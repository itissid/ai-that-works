import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUnreadCount } from "@/lib/notifications-server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getUnreadCount(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch unread count" },
        { status: 500 },
      );
    }

    return NextResponse.json({ unreadCount: result.count }, { status: 200 });
  } catch (error) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
