"use client";

import { useCallback, useEffect, useState } from "react";
import type { AttachmentWithUser } from "@/lib/types/attachments";

interface AttachmentListProps {
  todoId: string;
  refreshTrigger?: number;
}

export default function AttachmentList({
  todoId,
  refreshTrigger,
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<AttachmentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/attachments?todoId=${todoId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch attachments");
      }

      const data = await response.json();
      setAttachments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch attachments",
      );
    } finally {
      setIsLoading(false);
    }
  }, [todoId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is a prop that triggers refetch
  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      const response = await fetch(`/api/attachments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete attachment");
      }

      await fetchAttachments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete attachment",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimetype: string): string => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.startsWith("video/")) return "🎥";
    if (mimetype.startsWith("audio/")) return "🎵";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("zip") || mimetype.includes("tar")) return "📦";
    if (mimetype.includes("text")) return "📝";
    return "📎";
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading attachments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
        {error}
      </div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Attachments
      </h4>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-lg">
                {getFileIcon(attachment.mimetype)}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={`/api/attachments/${attachment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {attachment.filename}
                </a>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(attachment.size)} • {attachment.user.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(attachment.id)}
              disabled={deletingId === attachment.id}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              {deletingId === attachment.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
