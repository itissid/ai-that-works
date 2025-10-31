"use client";

import { useCallback, useEffect, useState } from "react";
import { getListShares, unshareList } from "@/app/actions/lists";

interface Share {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface SharedUsersListProps {
  listId: string;
  isOwner: boolean;
}

export default function SharedUsersList({
  listId,
  isOwner,
}: SharedUsersListProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShares = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await getListShares(listId);

      if (!result.success) {
        setError(result.error || "Failed to load shares");
        return;
      }

      setShares(result.shares || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shares");
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  const handleRemove = async (userId: string, userEmail: string) => {
    if (!confirm(`Remove access for ${userEmail}?`)) {
      return;
    }

    try {
      const result = await unshareList(listId, userId);

      if (!result.success) {
        setError(result.error || "Failed to remove access");
        return;
      }

      await loadShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove access");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {shares.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No one else has access to this list
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {shares.map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {share.user.email}
                </div>
                {share.user.name && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {share.user.name}
                  </div>
                )}
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleRemove(share.user.id, share.user.email)}
                  className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
