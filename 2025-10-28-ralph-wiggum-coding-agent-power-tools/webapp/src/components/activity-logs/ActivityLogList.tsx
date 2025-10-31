"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityType } from "@/generated/prisma";

interface ActivityLog {
  id: string;
  activityType: ActivityType;
  description: string;
  metadata: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  todo?: {
    id: string;
    title: string;
  } | null;
  list?: {
    id: string;
    name: string;
  } | null;
}

interface ActivityLogListProps {
  todoId?: string;
  listId?: string;
  limit?: number;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function getActivityIcon(activityType: ActivityType): string {
  switch (activityType) {
    case "TODO_CREATED":
      return "✨";
    case "TODO_UPDATED":
      return "✏️";
    case "TODO_DELETED":
      return "🗑️";
    case "TODO_STATUS_CHANGED":
      return "🔄";
    case "TODO_PRIORITY_CHANGED":
      return "⚡";
    case "TODO_ASSIGNED_TO_LIST":
      return "📋";
    case "TODO_MOVED_TO_LIST":
      return "↔️";
    case "LIST_CREATED":
      return "📂";
    case "LIST_UPDATED":
      return "✏️";
    case "LIST_DELETED":
      return "🗑️";
    case "LIST_SHARED":
      return "🤝";
    case "LIST_UNSHARED":
      return "❌";
    case "COMMENT_ADDED":
      return "💬";
    case "COMMENT_DELETED":
      return "🗑️";
    case "REACTION_ADDED":
      return "❤️";
    case "REACTION_REMOVED":
      return "💔";
    case "ATTACHMENT_ADDED":
      return "📎";
    case "ATTACHMENT_DELETED":
      return "🗑️";
    case "BATCH_UPDATE":
      return "⚙️";
    case "BATCH_DELETE":
      return "🗑️";
    default:
      return "📝";
  }
}

export default function ActivityLogList({
  todoId,
  listId,
  limit = 50,
}: ActivityLogListProps) {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivityLogs = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (todoId) params.set("todoId", todoId);
      if (listId) params.set("listId", listId);
      params.set("limit", limit.toString());

      const response = await fetch(`/api/activity-logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();
      setActivityLogs(data.activityLogs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load activity logs",
      );
    } finally {
      setIsLoading(false);
    }
  }, [todoId, listId, limit]);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          Activity History
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : activityLogs.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No activity yet
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-shrink-0 text-xl">
                {getActivityIcon(log.activityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">
                    {log.user.name || log.user.email}
                  </span>{" "}
                  {log.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatTimeAgo(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
