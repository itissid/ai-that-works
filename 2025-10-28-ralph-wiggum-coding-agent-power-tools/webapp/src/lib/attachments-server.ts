import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import type { AttachmentWithUser } from "@/lib/types/attachments";

const UPLOAD_DIR = join(process.cwd(), "uploads");

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function createAttachment(params: {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  todoId: string;
  userId: string;
}): Promise<{
  success: boolean;
  attachment?: AttachmentWithUser;
  error?: string;
}> {
  try {
    await ensureUploadDir();

    const timestamp = Date.now();
    const safeFilename = params.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filepath = join(UPLOAD_DIR, `${timestamp}_${safeFilename}`);

    await writeFile(filepath, params.buffer);

    const attachment = await prisma.attachment.create({
      data: {
        filename: params.filename,
        filepath: filepath,
        mimetype: params.mimetype,
        size: params.size,
        todoId: params.todoId,
        userId: params.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return { success: true, attachment };
  } catch (error) {
    console.error("Create attachment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create attachment",
    };
  }
}

export async function getAttachments(todoId: string): Promise<{
  success: boolean;
  attachments?: AttachmentWithUser[];
  error?: string;
}> {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { todoId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { success: true, attachments };
  } catch (error) {
    console.error("Get attachments error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch attachments",
    };
  }
}

export async function getAttachment(id: string): Promise<{
  success: boolean;
  attachment?: AttachmentWithUser;
  error?: string;
}> {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    return { success: true, attachment };
  } catch (error) {
    console.error("Get attachment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch attachment",
    };
  }
}

export async function deleteAttachment(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    try {
      if (existsSync(attachment.filepath)) {
        await unlink(attachment.filepath);
      }
    } catch (fileError) {
      console.error("Failed to delete file:", fileError);
    }

    await prisma.attachment.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete attachment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete attachment",
    };
  }
}
