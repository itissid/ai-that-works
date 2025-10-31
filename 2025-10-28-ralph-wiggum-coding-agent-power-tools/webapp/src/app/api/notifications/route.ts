import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getNotifications, markAllAsRead } from "@/lib/notifications-server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getNotifications(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch notifications" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { notifications: result.notifications },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await markAllAsRead(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to mark all as read" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
