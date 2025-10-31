"use client";

import { useState } from "react";
import { deleteList, type ListWithUser } from "@/app/actions/lists";
import ActivityLogList from "@/components/activity-logs/ActivityLogList";
import ListForm from "./ListForm";
import SharedUsersList from "./SharedUsersList";
import ShareListForm from "./ShareListForm";

interface ListItemProps {
  list: ListWithUser;
  currentUserId: string;
  onUpdate?: () => void;
}

export default function ListItem({
  list,
  currentUserId,
  onUpdate,
}: ListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [showSharedUsers, setShowSharedUsers] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [error, setError] = useState("");

  const isOwner = list.userId === currentUserId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this list?")) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteList(list.id);
      if (!result.success) {
        setError(result.error || "Failed to delete list");
        return;
      }
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete list");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onUpdate?.();
  };

  const handleShareSuccess = () => {
    setShowShareForm(false);
    onUpdate?.();
  };

  if (isEditing) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-sm font-medium mb-4">Edit List</h3>
        <ListForm
          list={list}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium truncate">{list.name}</h3>
            {isOwner ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Owner
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Shared with you
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareForm(!showShareForm)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showShareForm ? "Hide Share" : "Share"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowSharedUsers(!showSharedUsers)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              {showSharedUsers ? "Hide Access" : "View Access"}
            </button>
            <button
              type="button"
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              {showActivityLog ? "Hide Activity" : "Show Activity"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {showShareForm && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-3">Share this list</h4>
          <ShareListForm
            listId={list.id}
            onSuccess={handleShareSuccess}
            onCancel={() => setShowShareForm(false)}
          />
        </div>
      )}

      {showSharedUsers && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-3">List access</h4>
          <SharedUsersList listId={list.id} isOwner={isOwner} />
        </div>
      )}

      {showActivityLog && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ActivityLogList listId={list.id} />
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
        Created {new Date(list.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
