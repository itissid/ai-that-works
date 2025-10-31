import { prisma } from "@/lib/prisma";
import type {
  CommentResult,
  CommentsResult,
  CreateCommentInput,
  ReactionResult,
  ReactionsResult,
} from "./types/comments";

export async function createComment(
  todoId: string,
  userId: string,
  input: CreateCommentInput,
): Promise<CommentResult> {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        todoId,
        userId,
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

    return { success: true, comment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function getCommentsByTodo(
  todoId: string,
): Promise<CommentsResult> {
  try {
    const comments = await prisma.comment.findMany({
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
      orderBy: { createdAt: "asc" },
    });

    return { success: true, comments };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get comments",
    };
  }
}

export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<CommentResult> {
  try {
    const existing = await prisma.comment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });

    if (!existing) {
      return { success: false, error: "Comment not found or unauthorized" };
    }

    const comment = await prisma.comment.delete({
      where: { id: commentId },
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

    return { success: true, comment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export async function toggleReaction(
  todoId: string,
  userId: string,
  emoji: string,
): Promise<ReactionResult> {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    const existing = await prisma.reaction.findFirst({
      where: {
        todoId,
        userId,
        emoji,
      },
    });

    if (existing) {
      const reaction = await prisma.reaction.delete({
        where: { id: existing.id },
      });
      return { success: true, reaction };
    } else {
      const reaction = await prisma.reaction.create({
        data: {
          emoji,
          todoId,
          userId,
        },
      });
      return { success: true, reaction };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle reaction",
    };
  }
}

export async function getReactionsByTodo(
  todoId: string,
): Promise<ReactionsResult> {
  try {
    const reactions = await prisma.reaction.findMany({
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
      orderBy: { createdAt: "asc" },
    });

    return { success: true, reactions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get reactions",
    };
  }
}
