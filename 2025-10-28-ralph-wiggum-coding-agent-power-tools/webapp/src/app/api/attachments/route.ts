import { type NextRequest, NextResponse } from "next/server";
import { createAttachment, getAttachments } from "@/lib/attachments-server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const todoId = formData.get("todoId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!todoId) {
      return NextResponse.json(
        { error: "No todoId provided" },
        { status: 400 },
      );
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await createAttachment({
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      buffer,
      todoId,
      userId: session.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.attachment, { status: 201 });
  } catch (error) {
    console.error("Upload attachment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todoId = request.nextUrl.searchParams.get("todoId");
    if (!todoId) {
      return NextResponse.json(
        { error: "No todoId provided" },
        { status: 400 },
      );
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const result = await getAttachments(todoId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.attachments, { status: 200 });
  } catch (error) {
    console.error("Get attachments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
