import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { createTodo, getTodos } from "@/lib/todos-server";
import type { CreateTodoInput } from "@/lib/types/todos";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, listId } = body as CreateTodoInput;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "Description must be a string" },
        { status: 400 },
      );
    }

    if (
      status !== undefined &&
      !["TODO", "DOING", "DONE", "CANCELLED"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    if (listId !== undefined && typeof listId !== "string") {
      return NextResponse.json(
        { error: "List ID must be a string" },
        { status: 400 },
      );
    }

    const result = await createTodo(session.userId, {
      title: title.trim(),
      description: description?.trim(),
      status,
      listId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create todo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ todo: result.todo }, { status: 201 });
  } catch (error) {
    console.error("Create todo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getTodos(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch todos" },
        { status: 500 },
      );
    }

    return NextResponse.json({ todos: result.todos }, { status: 200 });
  } catch (error) {
    console.error("Get todos error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
