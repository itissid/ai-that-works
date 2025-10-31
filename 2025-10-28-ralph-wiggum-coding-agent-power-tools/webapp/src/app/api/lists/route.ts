import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { createList, getLists } from "@/lib/lists-server";
import type { CreateListInput } from "@/lib/types/lists";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body as CreateListInput;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await createList(session.userId, {
      name: name.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create list" },
        { status: 500 },
      );
    }

    return NextResponse.json({ list: result.list }, { status: 201 });
  } catch (error) {
    console.error("Create list error:", error);
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

    const result = await getLists(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch lists" },
        { status: 500 },
      );
    }

    return NextResponse.json({ lists: result.lists }, { status: 200 });
  } catch (error) {
    console.error("Get lists error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
