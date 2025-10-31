"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListWithUser } from "@/app/actions/lists";
import { getCurrentUserId, getLists } from "@/app/actions/lists";
import ListForm from "./ListForm";
import ListItem from "./ListItem";

export default function ListManagement() {
  const [lists, setLists] = useState<ListWithUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadLists = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [listsResult, userIdResult] = await Promise.all([
        getLists(),
        getCurrentUserId(),
      ]);

      if (!listsResult.success) {
        setError(listsResult.error || "Failed to load lists");
        return;
      }

      if (!userIdResult.success) {
        setError(userIdResult.error || "Failed to get user");
        return;
      }

      setLists(listsResult.lists || []);
      setCurrentUserId(userIdResult.userId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lists");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateSuccess = () => {
    setShowForm(false);
    loadLists();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? "Cancel" : "New List"}
        </button>
      </div>

      {showForm && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Create New List</h3>
          <ListForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Empty list"
            >
              <title>Empty list</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No lists yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
              currentUserId={currentUserId}
              onUpdate={loadLists}
            />
          ))}
        </div>
      )}

      {!isLoading && lists.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          Showing {lists.length} {lists.length === 1 ? "list" : "lists"}
        </div>
      )}
    </div>
  );
}
