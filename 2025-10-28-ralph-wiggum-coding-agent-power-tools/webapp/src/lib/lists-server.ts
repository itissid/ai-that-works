import { prisma } from "@/lib/prisma";
import type {
  CreateListInput,
  ListResult,
  ListShareResult,
  ListSharesResult,
  ListsResult,
  ShareListInput,
  UpdateListInput,
} from "./types/lists";

export async function createList(
  userId: string,
  input: CreateListInput,
): Promise<ListResult> {
  try {
    const list = await prisma.list.create({
      data: {
        name: input.name,
        userId,
      },
    });

    return { success: true, list };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create list",
    };
  }
}

export async function getList(
  listId: string,
  userId: string,
): Promise<ListResult> {
  try {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [{ userId }, { shares: { some: { userId } } }],
      },
    });

    if (!list) {
      return { success: false, error: "List not found" };
    }

    return { success: true, list };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get list",
    };
  }
}

export async function getLists(userId: string): Promise<ListsResult> {
  try {
    const lists = await prisma.list.findMany({
      where: {
        OR: [{ userId }, { shares: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, lists };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get lists",
    };
  }
}

export async function updateList(
  listId: string,
  userId: string,
  input: UpdateListInput,
): Promise<ListResult> {
  try {
    const existing = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!existing) {
      return { success: false, error: "List not found or unauthorized" };
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
      },
    });

    return { success: true, list };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update list",
    };
  }
}

export async function deleteList(
  listId: string,
  userId: string,
): Promise<ListResult> {
  try {
    const existing = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!existing) {
      return { success: false, error: "List not found or unauthorized" };
    }

    const list = await prisma.list.delete({
      where: { id: listId },
    });

    return { success: true, list };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete list",
    };
  }
}

export async function shareList(
  listId: string,
  userId: string,
  input: ShareListInput,
): Promise<ListShareResult> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email.toLowerCase(),
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId,
      },
    });

    if (!list) {
      return { success: false, error: "Only list owner can share" };
    }

    const existingShare = await prisma.listShare.findFirst({
      where: {
        listId,
        userId: user.id,
      },
    });

    if (existingShare) {
      return {
        success: false,
        error: "List already shared with this user",
      };
    }

    const share = await prisma.listShare.create({
      data: {
        listId,
        userId: user.id,
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

    return { success: true, share };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to share list",
    };
  }
}

export async function unshareList(
  listId: string,
  ownerId: string,
  shareUserId: string,
): Promise<ListShareResult> {
  try {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        userId: ownerId,
      },
    });

    if (!list) {
      return { success: false, error: "Only list owner can unshare" };
    }

    await prisma.listShare.delete({
      where: {
        listId_userId: {
          listId,
          userId: shareUserId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unshare list",
    };
  }
}

export async function getListShares(
  listId: string,
  userId: string,
): Promise<ListSharesResult> {
  try {
    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        OR: [{ userId }, { shares: { some: { userId } } }],
      },
    });

    if (!list) {
      return { success: false, error: "List not found or unauthorized" };
    }

    const shares = await prisma.listShare.findMany({
      where: {
        listId,
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

    return { success: true, shares };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get list shares",
    };
  }
}
