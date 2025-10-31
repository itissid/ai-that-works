"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLists, type ListWithUser } from "@/app/actions/lists";
import type { TodoWithUser } from "@/app/actions/todos";
import {
  batchDeleteTodos,
  batchUpdateTodos,
  deleteTodo,
  getTodos,
  updateTodoStatus,
} from "@/app/actions/todos";
import KeyboardShortcutsHelp from "@/components/common/KeyboardShortcutsHelp";
import type { TodoPriority, TodoStatus } from "@/generated/prisma";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import BatchActionBar from "./BatchActionBar";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "TODO", label: "Todo" },
  { value: "DOING", label: "Doing" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "NONE", label: "None" },
];

const DUE_DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Due Dates" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due Today" },
  { value: "week", label: "Due This Week" },
  { value: "none", label: "No Due Date" },
];

export default function TodoList() {
  const [todos, setTodos] = useState<TodoWithUser[]>([]);
  const [lists, setLists] = useState<ListWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedListId, setSelectedListId] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedTodoIndex, setSelectedTodoIndex] = useState<number>(-1);
  const [showHelp, setShowHelp] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(
    new Set(),
  );
  const [isBatchOperating, setIsBatchOperating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadTodos = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const filters: {
        status?: TodoStatus;
        listId?: string | null;
        search?: string;
        priority?: TodoPriority;
        dueDate?: "all" | "overdue" | "today" | "week" | "none";
      } = {};

      if (statusFilter !== "all") {
        filters.status = statusFilter as TodoStatus;
      }
      if (selectedListId !== "all") {
        filters.listId = selectedListId === "no-list" ? null : selectedListId;
      }
      if (searchText.trim()) {
        filters.search = searchText;
      }
      if (priorityFilter !== "all") {
        filters.priority = priorityFilter as TodoPriority;
      }
      if (dueDateFilter !== "all") {
        filters.dueDate = dueDateFilter as
          | "overdue"
          | "today"
          | "week"
          | "none";
      }

      const result = await getTodos(
        Object.keys(filters).length ? filters : undefined,
      );

      if (!result.success) {
        setError(result.error || "Failed to load todos");
        return;
      }

      setTodos(result.todos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedListId, searchText, priorityFilter, dueDateFilter]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getLists();
        if (result.success) {
          setLists(result.lists || []);
        }
      } catch (err) {
        console.error("Failed to load lists:", err);
      }
    };
    load();
  }, []);

  const handleCreateSuccess = () => {
    setShowForm(false);
    loadTodos();
  };

  const handleNavigateNext = () => {
    if (todos.length === 0) return;
    setSelectedTodoIndex((prev) => (prev + 1) % todos.length);
  };

  const handleNavigatePrevious = () => {
    if (todos.length === 0) return;
    setSelectedTodoIndex((prev) => (prev - 1 + todos.length) % todos.length);
  };

  const handleEditSelected = () => {
    if (selectedTodoIndex >= 0 && selectedTodoIndex < todos.length) {
      const todoElement = document.querySelector(
        `[data-todo-id="${todos[selectedTodoIndex].id}"]`,
      );
      if (todoElement) {
        const editButton = todoElement.querySelector(
          'button[data-action="edit"]',
        );
        if (editButton instanceof HTMLButtonElement) {
          editButton.click();
        }
      }
    }
  };

  const handleMarkDone = async () => {
    if (selectedTodoIndex >= 0 && selectedTodoIndex < todos.length) {
      const todo = todos[selectedTodoIndex];
      try {
        await updateTodoStatus(todo.id, "DONE");
        loadTodos();
      } catch (err) {
        console.error("Failed to mark todo as done:", err);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTodoIndex >= 0 && selectedTodoIndex < todos.length) {
      const todo = todos[selectedTodoIndex];
      if (confirm("Are you sure you want to delete this todo?")) {
        try {
          await deleteTodo(todo.id);
          loadTodos();
          setSelectedTodoIndex(-1);
        } catch (err) {
          console.error("Failed to delete todo:", err);
        }
      }
    }
  };

  const handleToggleSelection = (todoId: string) => {
    setSelectedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(todoId)) {
        next.delete(todoId);
      } else {
        next.add(todoId);
      }
      return next;
    });
  };

  const _handleSelectAll = () => {
    setSelectedTodoIds(new Set(todos.map((t) => t.id)));
  };

  const handleClearSelection = () => {
    setSelectedTodoIds(new Set());
  };

  const handleBatchStatusUpdate = async (status: TodoStatus) => {
    if (selectedTodoIds.size === 0) return;

    setIsBatchOperating(true);
    try {
      const result = await batchUpdateTodos(Array.from(selectedTodoIds), {
        status,
      });
      if (result.success) {
        await loadTodos();
        handleClearSelection();
      } else {
        setError(result.error || "Failed to update todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todos");
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchPriorityUpdate = async (priority: TodoPriority) => {
    if (selectedTodoIds.size === 0) return;

    setIsBatchOperating(true);
    try {
      const result = await batchUpdateTodos(Array.from(selectedTodoIds), {
        priority,
      });
      if (result.success) {
        await loadTodos();
        handleClearSelection();
      } else {
        setError(result.error || "Failed to update todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todos");
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchMoveToList = async (listId: string | null) => {
    if (selectedTodoIds.size === 0) return;

    setIsBatchOperating(true);
    try {
      const result = await batchUpdateTodos(Array.from(selectedTodoIds), {
        listId,
      });
      if (result.success) {
        await loadTodos();
        handleClearSelection();
      } else {
        setError(result.error || "Failed to move todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move todos");
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTodoIds.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedTodoIds.size} todo(s)?`,
      )
    ) {
      return;
    }

    setIsBatchOperating(true);
    try {
      const result = await batchDeleteTodos(Array.from(selectedTodoIds));
      if (result.success) {
        await loadTodos();
        handleClearSelection();
      } else {
        setError(result.error || "Failed to delete todos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todos");
    } finally {
      setIsBatchOperating(false);
    }
  };

  useKeyboardShortcuts({
    n: () => setShowForm(true),
    c: () => setShowForm(true),
    "/": () => searchInputRef.current?.focus(),
    j: handleNavigateNext,
    ArrowDown: handleNavigateNext,
    k: handleNavigatePrevious,
    ArrowUp: handleNavigatePrevious,
    Enter: handleEditSelected,
    d: handleMarkDone,
    x: handleDeleteSelected,
    Delete: handleDeleteSelected,
    Escape: () => {
      if (showForm) setShowForm(false);
      if (showHelp) setShowHelp(false);
    },
    "?": () => setShowHelp(true),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search todos... (Press / to focus)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
            title="Keyboard shortcuts (Press ?)"
          >
            ?
          </button>
          <button
            type="button"
            onClick={() => {
              setBatchMode(!batchMode);
              if (batchMode) {
                handleClearSelection();
              }
            }}
            className={`font-medium py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap ${
              batchMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {batchMode ? "Exit Batch Mode" : "Batch Select"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
          >
            {showForm ? "Cancel" : "New Todo"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          >
            {PRIORITY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          >
            {DUE_DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
          >
            <option value="all">All Lists</option>
            <option value="no-list">No List</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {batchMode && selectedTodoIds.size > 0 && (
        <BatchActionBar
          selectedCount={selectedTodoIds.size}
          onBatchStatusUpdate={handleBatchStatusUpdate}
          onBatchPriorityUpdate={handleBatchPriorityUpdate}
          onBatchMoveToList={handleBatchMoveToList}
          onBatchDelete={handleBatchDelete}
          onClearSelection={handleClearSelection}
          lists={lists}
          isProcessing={isBatchOperating}
        />
      )}

      {showForm && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Create New Todo</h3>
          <TodoForm
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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Empty todo list</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {statusFilter === "all" &&
            selectedListId === "all" &&
            !searchText &&
            priorityFilter === "all" &&
            dueDateFilter === "all"
              ? "No todos yet. Create your first one!"
              : "No matching todos."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              data-todo-id={todo.id}
              className={`${
                selectedTodoIndex === index
                  ? "ring-2 ring-blue-500 rounded-lg"
                  : ""
              }`}
            >
              <TodoItem
                todo={todo}
                onUpdate={loadTodos}
                showCheckbox={batchMode}
                isSelected={selectedTodoIds.has(todo.id)}
                onToggleSelection={handleToggleSelection}
              />
            </div>
          ))}
        </div>
      )}

      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
