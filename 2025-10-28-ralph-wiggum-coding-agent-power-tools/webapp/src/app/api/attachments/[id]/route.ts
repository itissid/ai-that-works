import { readFile } from "node:fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import { deleteAttachment, getAttachment } from "@/lib/attachments-server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await getAttachment(id);

    if (!result.success || !result.attachment) {
      return NextResponse.json(
        { error: result.error || "Attachment not found" },
        { status: 404 },
      );
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: result.attachment.todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const fileBuffer = await readFile(result.attachment.filepath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": result.attachment.mimetype,
        "Content-Disposition": `attachment; filename="${result.attachment.filename}"`,
        "Content-Length": result.attachment.size.toString(),
      },
    });
  } catch (error) {
    console.error("Download attachment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const attachmentResult = await getAttachment(id);

    if (!attachmentResult.success || !attachmentResult.attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: attachmentResult.attachment.todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await deleteAttachment(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete attachment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
