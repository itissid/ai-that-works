"use client";

import { useEffect, useState } from "react";
import type { TodoWithUser } from "@/app/actions/todos";
import { addTodoDependency, getTodos } from "@/app/actions/todos";

interface DependencySelectorProps {
  todoId: string;
  onDependencyAdded?: () => void;
}

export default function DependencySelector({
  todoId,
  onDependencyAdded,
}: DependencySelectorProps) {
  const [availableTodos, setAvailableTodos] = useState<TodoWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTodoId, setSelectedTodoId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getTodos();
        if (result.success) {
          const todos = (result.todos || []).filter((t) => t.id !== todoId);
          setAvailableTodos(todos);
        }
      } catch (err) {
        console.error("Failed to load todos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [todoId]);

  const handleAdd = async () => {
    if (!selectedTodoId) return;

    setIsAdding(true);
    setError("");

    try {
      const result = await addTodoDependency(todoId, selectedTodoId);

      if (result.success) {
        setSelectedTodoId("");
        onDependencyAdded?.();
      } else {
        setError(result.error || "Failed to add dependency");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Add dependency error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading available todos...
      </div>
    );
  }

  if (availableTodos.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No other todos available to add as dependencies
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={selectedTodoId}
          onChange={(e) => setSelectedTodoId(e.target.value)}
          disabled={isAdding}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select a todo to block this one...</option>
          {availableTodos.map((todo) => (
            <option key={todo.id} value={todo.id}>
              {todo.title} {todo.status !== "TODO" && `(${todo.status})`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedTodoId || isAdding}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isAdding ? "Adding..." : "Add"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
    </div>
  );
}
