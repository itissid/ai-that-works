"use server";

import { revalidatePath } from "next/cache";
import type { List, ListShare } from "@/generated/prisma";
import { createActivityLog } from "@/lib/activity-log-server";
import { getSession } from "@/lib/auth-server";
import { createNotification } from "@/lib/notifications-server";
import { prisma } from "@/lib/prisma";

export interface ListWithUser extends List {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface CreateListInput {
  name: string;
}

export interface UpdateListInput {
  name?: string;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createList(
  input: CreateListInput,
): Promise<{ success: boolean; list?: List; error?: string }> {
  try {
    const session = await requireAuth();

    if (!input.name?.trim()) {
      return { success: false, error: "Name is required" };
    }

    const list = await prisma.list.create({
      data: {
        name: input.name.trim(),
        userId: session.userId,
      },
    });

    await createActivityLog({
      activityType: "LIST_CREATED",
      description: "created this list",
      userId: session.userId,
      listId: list.id,
    });

    revalidatePath("/");
    return { success: true, list };
  } catch (error) {
    console.error("Create list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create list",
    };
  }
}

export async function getLists(): Promise<{
  success: boolean;
  lists?: ListWithUser[];
  error?: string;
}> {
  try {
    const session = await requireAuth();

    const lists = await prisma.list.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { shares: { some: { userId: session.userId } } },
        ],
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, lists };
  } catch (error) {
    console.error("Get lists error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch lists",
    };
  }
}

export async function getList(
  id: string,
): Promise<{ success: boolean; list?: ListWithUser; error?: string }> {
  try {
    const session = await requireAuth();

    const list = await prisma.list.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { shares: { some: { userId: session.userId } } },
        ],
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

    if (!list) {
      return { success: false, error: "List not found" };
    }

    return { success: true, list };
  } catch (error) {
    console.error("Get list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch list",
    };
  }
}

export async function updateList(
  id: string,
  input: UpdateListInput,
): Promise<{ success: boolean; list?: List; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.list.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return { success: false, error: "List not found or unauthorized" };
    }

    if (input.name !== undefined && !input.name?.trim()) {
      return { success: false, error: "Name cannot be empty" };
    }

    const data: { name?: string } = {};
    if (input.name !== undefined) data.name = input.name.trim();

    const list = await prisma.list.update({
      where: { id },
      data,
    });

    if (input.name !== undefined && input.name !== existing.name) {
      await createActivityLog({
        activityType: "LIST_UPDATED",
        description: `updated name from "${existing.name}" to "${input.name}"`,
        metadata: {
          field: "name",
          oldValue: existing.name,
          newValue: input.name,
        },
        userId: session.userId,
        listId: list.id,
      });
    }

    revalidatePath("/");
    return { success: true, list };
  } catch (error) {
    console.error("Update list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update list",
    };
  }
}

export async function deleteList(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.list.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return { success: false, error: "List not found or unauthorized" };
    }

    await createActivityLog({
      activityType: "LIST_DELETED",
      description: "deleted this list",
      metadata: { listName: existing.name },
      userId: session.userId,
      listId: existing.id,
    });

    await prisma.list.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete list",
    };
  }
}

export async function shareList(
  listId: string,
  email: string,
): Promise<{ success: boolean; share?: ListShare; error?: string }> {
  try {
    const session = await requireAuth();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: "Email is required" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "User not found. They need to sign up first.",
      };
    }

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: session.userId,
      },
    });

    if (!list) {
      return { success: false, error: "Only list owner can share" };
    }

    if (targetUser.id === session.userId) {
      return { success: false, error: "Cannot share list with yourself" };
    }

    const existingShare = await prisma.listShare.findFirst({
      where: {
        listId,
        userId: targetUser.id,
      },
    });

    if (existingShare) {
      return { success: false, error: "List already shared with this user" };
    }

    const share = await prisma.listShare.create({
      data: {
        listId,
        userId: targetUser.id,
      },
    });

    await createActivityLog({
      activityType: "LIST_SHARED",
      description: `shared list with ${targetUser.email}`,
      metadata: { sharedWithEmail: targetUser.email },
      userId: session.userId,
      listId: list.id,
    });

    await createNotification({
      type: "LIST_SHARED",
      message: `${session.email} shared list "${list.name}" with you`,
      userId: targetUser.id,
      listId: list.id,
      actorId: session.userId,
    });

    revalidatePath("/");
    return { success: true, share };
  } catch (error) {
    console.error("Share list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to share list",
    };
  }
}

export async function unshareList(
  listId: string,
  shareUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: session.userId,
      },
    });

    if (!list) {
      return { success: false, error: "Only list owner can unshare" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: shareUserId },
    });

    await createActivityLog({
      activityType: "LIST_UNSHARED",
      description: `unshared list with ${targetUser?.email || shareUserId}`,
      metadata: { unsharedWithEmail: targetUser?.email || shareUserId },
      userId: session.userId,
      listId: list.id,
    });

    await prisma.listShare.deleteMany({
      where: {
        listId,
        userId: shareUserId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Unshare list error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unshare list",
    };
  }
}

export async function getListShares(listId: string): Promise<{
  success: boolean;
  shares?: Array<{
    id: string;
    user: { id: string; email: string; name: string | null };
  }>;
  error?: string;
}> {
  try {
    const session = await requireAuth();

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [
          { userId: session.userId },
          { shares: { some: { userId: session.userId } } },
        ],
      },
    });

    if (!list) {
      return { success: false, error: "List not found or unauthorized" };
    }

    const shares = await prisma.listShare.findMany({
      where: { listId },
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

    return { success: true, shares };
  } catch (error) {
    console.error("Get list shares error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch list shares",
    };
  }
}

export async function getCurrentUserId(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const session = await requireAuth();
    return { success: true, userId: session.userId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unauthorized",
    };
  }
}
