"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CommentWithUser,
  createComment,
  deleteComment,
  getCommentsByTodo,
} from "@/app/actions/comments";
import { getUser } from "@/lib/auth";

interface CommentThreadProps {
  todoId: string;
  initialComments?: CommentWithUser[];
}

export default function CommentThread({
  todoId,
  initialComments = [],
}: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(!initialComments.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentUser = getUser();

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getCommentsByTodo(todoId);
      if (result.success && result.comments) {
        setComments(result.comments);
      } else {
        setError(result.error || "Failed to load comments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    if (!initialComments.length) {
      loadComments();
    }
  }, [initialComments.length, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError("Comment content is required");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const result = await createComment(todoId, newComment);
      if (result.success && result.comment) {
        const newCommentWithUser: CommentWithUser = {
          ...result.comment,
          user: {
            id: currentUser?.id || "",
            email: currentUser?.email || "",
            name: null,
          },
        };
        setComments([...comments, newCommentWithUser]);
        setNewComment("");
        setSuccessMessage("Comment added successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        await loadComments();
      } else {
        setError(result.error || "Failed to create comment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setError("");

    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        setComments(comments.filter((c) => c.id !== commentId));
        setSuccessMessage("Comment deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Failed to delete comment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const handleClear = () => {
    setNewComment("");
    setError("");
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Comments</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded text-sm">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Loading comments...
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
              No comments yet
            </div>
          ) : (
            <ul
              className={`space-y-3 mb-4 list-none ${
                comments.length > 5 ? "max-h-96 overflow-y-auto pr-2" : ""
              }`}
            >
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900/30"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {comment.user.name || comment.user.email}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {currentUser?.id === comment.userId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        aria-label="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="comment-content"
                className="block text-sm font-medium mb-2"
              >
                Add a comment
              </label>
              <textarea
                id="comment-content"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                placeholder="Write your comment here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Comment content"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Clear
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
