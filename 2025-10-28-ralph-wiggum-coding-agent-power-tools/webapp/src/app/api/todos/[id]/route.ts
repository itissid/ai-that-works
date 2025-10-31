import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { deleteTodo, getTodo, updateTodo } from "@/lib/todos-server";
import type { UpdateTodoInput } from "@/lib/types/todos";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const result = await getTodo(id, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Todo not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ todo: result.todo }, { status: 200 });
  } catch (error) {
    console.error("Get todo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { title, description, status, listId } = body as UpdateTodoInput;

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Title must be a non-empty string" },
        { status: 400 },
      );
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

    if (listId !== undefined && listId !== null && typeof listId !== "string") {
      return NextResponse.json(
        { error: "List ID must be a string or null" },
        { status: 400 },
      );
    }

    const updateData: UpdateTodoInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (listId !== undefined) updateData.listId = listId;

    const result = await updateTodo(id, session.userId, updateData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Todo not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ todo: result.todo }, { status: 200 });
  } catch (error) {
    console.error("Update todo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const result = await deleteTodo(id, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Todo not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Todo deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete todo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
