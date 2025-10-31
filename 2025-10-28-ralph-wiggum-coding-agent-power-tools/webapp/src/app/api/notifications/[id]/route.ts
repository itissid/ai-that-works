import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { markAsRead } from "@/lib/notifications-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const result = await markAsRead(id, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { notification: result.notification },
      { status: 200 },
    );
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
