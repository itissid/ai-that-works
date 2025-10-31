"use client";

import { useState } from "react";
import type { ListWithUser } from "@/app/actions/lists";
import type { TodoPriority, TodoStatus } from "@/generated/prisma";

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchStatusUpdate: (status: TodoStatus) => Promise<void>;
  onBatchDelete: () => Promise<void>;
  onBatchMoveToList: (listId: string | null) => Promise<void>;
  onBatchPriorityUpdate: (priority: TodoPriority) => Promise<void>;
  lists: ListWithUser[];
  isProcessing: boolean;
}

const STATUS_OPTIONS: TodoStatus[] = ["TODO", "DOING", "DONE", "CANCELLED"];
const PRIORITY_OPTIONS: TodoPriority[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export default function BatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchStatusUpdate,
  onBatchDelete,
  onBatchMoveToList,
  onBatchPriorityUpdate,
  lists,
  isProcessing,
}: BatchActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (!value) return;
    await onBatchStatusUpdate(value as TodoStatus);
    e.target.value = "";
  };

  const handlePriorityChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (!value) return;
    await onBatchPriorityUpdate(value as TodoPriority);
    e.target.value = "";
  };

  const handleListChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "") return;
    await onBatchMoveToList(value === "none" ? null : value);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    await onBatchDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {selectedCount} {selectedCount === 1 ? "todo" : "todos"} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={isProcessing}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              onChange={handleStatusChange}
              disabled={isProcessing}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              defaultValue=""
            >
              <option value="" disabled>
                Change status
              </option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              onChange={handlePriorityChange}
              disabled={isProcessing}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              defaultValue=""
            >
              <option value="" disabled>
                Change priority
              </option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>

            <select
              onChange={handleListChange}
              disabled={isProcessing}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              defaultValue=""
            >
              <option value="" disabled>
                Move to list
              </option>
              <option value="none">No List</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>

            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-sm text-red-700 dark:text-red-400">
                  Delete {selectedCount}{" "}
                  {selectedCount === 1 ? "todo" : "todos"}?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isProcessing}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isProcessing}
                className="text-sm px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
}
