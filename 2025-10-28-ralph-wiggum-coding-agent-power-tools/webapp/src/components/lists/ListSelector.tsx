"use client";

import { useEffect, useState } from "react";
import type { ListWithUser } from "@/app/actions/lists";
import { getLists } from "@/app/actions/lists";

interface ListSelectorProps {
  value: string | null | undefined;
  onChange: (listId: string | null) => void;
  disabled?: boolean;
}

export default function ListSelector({
  value,
  onChange,
  disabled = false,
}: ListSelectorProps) {
  const [lists, setLists] = useState<ListWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getLists();

        if (!result.success) {
          setError(result.error || "Failed to fetch lists");
          return;
        }

        setLists(result.lists || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || isLoading}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{isLoading ? "Loading lists..." : "None"}</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
