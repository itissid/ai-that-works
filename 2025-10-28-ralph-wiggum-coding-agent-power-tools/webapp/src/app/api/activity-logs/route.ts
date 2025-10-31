import { NextResponse } from "next/server";
import type { ActivityLogWithRelations } from "@/lib/activity-log-server";
import {
  getActivityLogsForList,
  getActivityLogsForTodo,
  getActivityLogsForUser,
} from "@/lib/activity-log-server";
import { getSession } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const todoId = searchParams.get("todoId");
    const listId = searchParams.get("listId");
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);

    let logs: ActivityLogWithRelations[];

    if (todoId) {
      logs = await getActivityLogsForTodo(todoId, limit);
    } else if (listId) {
      logs = await getActivityLogsForList(listId, limit);
    } else {
      logs = await getActivityLogsForUser(session.userId, limit);
    }

    return NextResponse.json({ activityLogs: logs }, { status: 200 });
  } catch (error) {
    console.error("Get activity logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
