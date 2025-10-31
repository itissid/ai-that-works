"use client";

import { useEffect, useState } from "react";
import type { TodoWithDependencies } from "@/app/actions/todos";
import { getTodoDependencies, removeTodoDependency } from "@/app/actions/todos";

interface DependencyListProps {
  todoId: string;
  refreshKey?: number;
  onUpdate?: () => void;
}

export default function DependencyList({
  todoId,
  refreshKey = 0,
  onUpdate,
}: DependencyListProps) {
  const [dependencies, setDependencies] = useState<TodoWithDependencies | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentionally used to trigger reloads
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getTodoDependencies(todoId);
        if (result.success) {
          setDependencies(result.dependencies || null);
        } else {
          setError(result.error || "Failed to load dependencies");
        }
      } catch (err) {
        console.error("Failed to load dependencies:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [todoId, refreshKey]);

  const handleRemove = async (dependsOnTodoId: string) => {
    setRemovingId(dependsOnTodoId);
    setError("");

    try {
      const result = await removeTodoDependency(todoId, dependsOnTodoId);

      if (result.success) {
        const updated = await getTodoDependencies(todoId);
        if (updated.success) {
          setDependencies(updated.dependencies || null);
        }
        onUpdate?.();
      } else {
        setError(result.error || "Failed to remove dependency");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Remove dependency error:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading dependencies...
      </div>
    );
  }

  if (error && !dependencies) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
    );
  }

  const blockedByCount = dependencies?.blockedBy?.length || 0;
  const blockingCount = dependencies?.blocking?.length || 0;

  if (blockedByCount === 0 && blockingCount === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No dependencies
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blockedByCount > 0 && dependencies && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🚧 Blocked By ({blockedByCount})
          </h4>
          <div className="space-y-2">
            {dependencies.blockedBy.map((dep) => {
              const isCompleted =
                dep.dependsOnTodo.status === "DONE" ||
                dep.dependsOnTodo.status === "CANCELLED";
              return (
                <div
                  key={dep.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCompleted
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-green-900 dark:text-green-200 line-through"
                            : "text-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {dep.dependsOnTodo.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isCompleted
                            ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                            : "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {dep.dependsOnTodo.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Assigned to {dep.dependsOnTodo.user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(dep.dependsOnTodoId)}
                    disabled={removingId === dep.dependsOnTodoId}
                    className="ml-2 px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {removingId === dep.dependsOnTodoId ? "..." : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {blockingCount > 0 && dependencies && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ⛔ Blocking ({blockingCount})
          </h4>
          <div className="space-y-2">
            {dependencies.blocking.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {dep.todo.title}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      {dep.todo.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Assigned to {dep.todo.user.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            These todos are waiting for this one to be completed
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
    </div>
  );
}
