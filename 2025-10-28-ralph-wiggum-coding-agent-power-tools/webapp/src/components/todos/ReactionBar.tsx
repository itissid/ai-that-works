"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactionWithUser } from "@/app/actions/comments";
import { getReactionsByTodo, toggleReaction } from "@/app/actions/comments";

interface ReactionBarProps {
  todoId: string;
  currentUserId: string;
  initialReactions?: ReactionWithUser[];
}

interface GroupedReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
  users: Array<{ id: string; name: string | null; email: string }>;
}

const COMMON_EMOJIS = ["👍", "❤️", "😄", "😮", "😢", "🎉", "🚀", "👏"];

export default function ReactionBar({
  todoId,
  currentUserId,
  initialReactions = [],
}: ReactionBarProps) {
  const [reactions, setReactions] =
    useState<ReactionWithUser[]>(initialReactions);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReactions = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getReactionsByTodo(todoId);
      if (!result.success) {
        setError(result.error || "Failed to fetch reactions");
        return;
      }
      setReactions(result.reactions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch reactions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchReactions();
    }
  }, [fetchReactions, initialReactions.length]);

  const handleToggleReaction = async (emoji: string) => {
    setError("");
    setShowEmojiPicker(false);

    // Optimistic update
    const existingReaction = reactions.find(
      (r) => r.emoji === emoji && r.userId === currentUserId,
    );

    if (existingReaction) {
      // Remove optimistically
      setReactions((prev) => prev.filter((r) => r.id !== existingReaction.id));
    } else {
      // Add optimistically
      const optimisticReaction: ReactionWithUser = {
        id: `temp-${Date.now()}`,
        emoji,
        todoId,
        userId: currentUserId,
        createdAt: new Date(),
        user: {
          id: currentUserId,
          email: "",
          name: "You",
        },
      };
      setReactions((prev) => [...prev, optimisticReaction]);
    }

    try {
      const result = await toggleReaction(todoId, emoji);
      if (!result.success) {
        setError(result.error || "Failed to toggle reaction");
        // Revert optimistic update on error
        await fetchReactions();
        return;
      }
      // Refresh to get accurate state from server
      await fetchReactions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle reaction",
      );
      // Revert optimistic update on error
      await fetchReactions();
    }
  };

  const groupReactions = (): GroupedReaction[] => {
    const grouped = new Map<string, GroupedReaction>();

    reactions.forEach((reaction) => {
      const existing = grouped.get(reaction.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(reaction.user);
        if (reaction.userId === currentUserId) {
          existing.userReacted = true;
        }
      } else {
        grouped.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          userReacted: reaction.userId === currentUserId,
          users: [reaction.user],
        });
      }
    });

    // Sort by count (most popular first)
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  };

  const groupedReactions = groupReactions();

  const getUserNames = (
    users: Array<{ name: string | null; email: string }>,
  ) => {
    return users.map((u) => u.name || u.email.split("@")[0]).join(", ");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {groupedReactions.map((group) => (
          <button
            key={group.emoji}
            type="button"
            onClick={() => handleToggleReaction(group.emoji)}
            disabled={isLoading}
            title={getUserNames(group.users)}
            className={`
              inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm
              border transition-all disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-sm
              ${
                group.userReacted
                  ? "bg-blue-100 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                  : "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
            aria-label={
              group.userReacted
                ? `Remove ${group.emoji} reaction`
                : `Add ${group.emoji} reaction`
            }
          >
            <span>{group.emoji}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {group.count}
            </span>
          </button>
        ))}

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isLoading}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add reaction"
          >
            <span className="text-sm">😊</span>
          </button>

          {showEmojiPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
                aria-hidden="true"
              />
              <div className="absolute z-20 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleToggleReaction(emoji)}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
