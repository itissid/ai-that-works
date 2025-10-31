"use server";

import { revalidatePath } from "next/cache";
import type { Comment, Reaction } from "@/generated/prisma";
import { createActivityLog } from "@/lib/activity-log-server";
import { getSession } from "@/lib/auth-server";
import { createNotification } from "@/lib/notifications-server";
import { prisma } from "@/lib/prisma";

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface ReactionWithUser extends Reaction {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function getTodoNotificationRecipients(
  todoId: string,
  excludeUserId: string,
): Promise<{
  recipients: string[];
  todo: {
    id: string;
    title: string;
    userId: string;
    listId: string | null;
  } | null;
}> {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId },
    include: {
      list: {
        include: {
          shares: { select: { userId: true } },
        },
      },
    },
  });

  if (!todo) return { recipients: [], todo: null };

  const recipients = new Set<string>();
  if (todo.userId !== excludeUserId) {
    recipients.add(todo.userId);
  }

  if (todo.list) {
    if (todo.list.userId !== excludeUserId) {
      recipients.add(todo.list.userId);
    }
    for (const share of todo.list.shares) {
      if (share.userId !== excludeUserId) {
        recipients.add(share.userId);
      }
    }
  }

  return {
    recipients: Array.from(recipients),
    todo: {
      id: todo.id,
      title: todo.title,
      userId: todo.userId,
      listId: todo.listId,
    },
  };
}

export async function createComment(
  todoId: string,
  content: string,
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    const session = await requireAuth();

    if (!content?.trim()) {
      return { success: false, error: "Comment content is required" };
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        todoId,
        userId: session.userId,
      },
    });

    const { recipients, todo } = await getTodoNotificationRecipients(
      todoId,
      session.userId,
    );

    if (todo) {
      await createActivityLog({
        activityType: "COMMENT_ADDED",
        description: "added a comment",
        metadata: { commentContent: content.trim() },
        userId: session.userId,
        todoId: todo.id,
        listId: todo.listId || undefined,
      });

      for (const recipientId of recipients) {
        await createNotification({
          type: "TODO_COMMENTED",
          message: `${session.email} commented on: "${todo.title}"`,
          userId: recipientId,
          todoId: todo.id,
          listId: todo.listId || undefined,
          actorId: session.userId,
        });
      }
    }

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Create comment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function getCommentsByTodo(
  todoId: string,
): Promise<{ success: boolean; comments?: CommentWithUser[]; error?: string }> {
  try {
    const _session = await requireAuth();

    const comments = await prisma.comment.findMany({
      where: {
        todoId,
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
        createdAt: "asc",
      },
    });

    return { success: true, comments };
  } catch (error) {
    console.error("Get comments error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch comments",
    };
  }
}

export async function deleteComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.comment.findFirst({
      where: {
        id: commentId,
      },
      include: {
        todo: {
          select: {
            id: true,
            listId: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Comment not found" };
    }

    if (existing.userId !== session.userId) {
      return { success: false, error: "Unauthorized to delete this comment" };
    }

    await createActivityLog({
      activityType: "COMMENT_DELETED",
      description: "deleted a comment",
      metadata: { commentContent: existing.content },
      userId: session.userId,
      todoId: existing.todoId,
      listId: existing.todo?.listId || undefined,
    });

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export async function toggleReaction(
  todoId: string,
  emoji: string,
): Promise<{ success: boolean; reaction?: Reaction; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.reaction.findFirst({
      where: {
        todoId,
        userId: session.userId,
        emoji,
      },
    });

    if (existing) {
      const todo = await prisma.todo.findUnique({
        where: { id: todoId },
        select: { listId: true },
      });

      await createActivityLog({
        activityType: "REACTION_REMOVED",
        description: `removed reaction ${emoji}`,
        metadata: { emoji },
        userId: session.userId,
        todoId,
        listId: todo?.listId || undefined,
      });

      await prisma.reaction.delete({
        where: { id: existing.id },
      });
      revalidatePath("/");
      return { success: true };
    }

    const reaction = await prisma.reaction.create({
      data: {
        emoji,
        todoId,
        userId: session.userId,
      },
    });

    const { recipients, todo } = await getTodoNotificationRecipients(
      todoId,
      session.userId,
    );
    if (todo) {
      await createActivityLog({
        activityType: "REACTION_ADDED",
        description: `reacted with ${emoji}`,
        metadata: { emoji },
        userId: session.userId,
        todoId: todo.id,
        listId: todo.listId || undefined,
      });

      for (const recipientId of recipients) {
        await createNotification({
          type: "TODO_REACTED",
          message: `${session.email} reacted ${emoji} to: "${todo.title}"`,
          userId: recipientId,
          todoId: todo.id,
          listId: todo.listId || undefined,
          actorId: session.userId,
        });
      }
    }

    revalidatePath("/");
    return { success: true, reaction };
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle reaction",
    };
  }
}

export async function getReactionsByTodo(todoId: string): Promise<{
  success: boolean;
  reactions?: ReactionWithUser[];
  error?: string;
}> {
  try {
    const _session = await requireAuth();

    const reactions = await prisma.reaction.findMany({
      where: {
        todoId,
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
        createdAt: "asc",
      },
    });

    return { success: true, reactions };
  } catch (error) {
    console.error("Get reactions error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch reactions",
    };
  }
}
