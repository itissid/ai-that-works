import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { deleteList, getList, updateList } from "@/lib/lists-server";
import type { UpdateListInput } from "@/lib/types/lists";

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

    const result = await getList(id, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "List not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ list: result.list }, { status: 200 });
  } catch (error) {
    console.error("Get list error:", error);
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
    const { name } = body as UpdateListInput;

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 },
      );
    }

    const updateData: UpdateListInput = {};
    if (name !== undefined) updateData.name = name.trim();

    const result = await updateList(id, session.userId, updateData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "List not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ list: result.list }, { status: 200 });
  } catch (error) {
    console.error("Update list error:", error);
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

    const result = await deleteList(id, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "List not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "List deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
