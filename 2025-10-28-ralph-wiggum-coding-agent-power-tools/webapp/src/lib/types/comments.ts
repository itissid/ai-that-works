import type { Comment, Reaction } from "@/generated/prisma";

export type { Comment, Reaction };

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

export interface CreateCommentInput {
  content: string;
}

export interface CreateReactionInput {
  emoji: string;
}

export interface CommentResult {
  success: boolean;
  comment?: CommentWithUser;
  error?: string;
}

export interface CommentsResult {
  success: boolean;
  comments?: CommentWithUser[];
  error?: string;
}

export interface ReactionResult {
  success: boolean;
  reaction?: Reaction;
  error?: string;
}

export interface ReactionsResult {
  success: boolean;
  reactions?: ReactionWithUser[];
  error?: string;
}
