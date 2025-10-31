"use client";

import { useState } from "react";
import { deleteTodo, updateTodoStatus } from "@/app/actions/todos";
import ActivityLogList from "@/components/activity-logs/ActivityLogList";
import AttachmentList from "@/components/attachments/AttachmentList";
import FileUpload from "@/components/attachments/FileUpload";
import DependencyList from "@/components/dependencies/DependencyList";
import DependencySelector from "@/components/dependencies/DependencySelector";
import type { Todo, TodoPriority, TodoStatus } from "@/generated/prisma";
import { getUser } from "@/lib/auth";
import { formatCustomRecurrence } from "@/lib/recurrence";
import CommentThread from "./CommentThread";
import ReactionBar from "./ReactionBar";
import TodoForm from "./TodoForm";

interface TodoItemProps {
  todo: Todo;
  onUpdate?: () => void;
  isSelected?: boolean;
  onToggleSelection?: (todoId: string) => void;
  showCheckbox?: boolean;
}

const STATUS_COLORS: Record<TodoStatus, string> = {
  TODO: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  DOING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 line-through",
};

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  NONE: "text-gray-400 dark:text-gray-600",
  LOW: "text-blue-500 dark:text-blue-400",
  MEDIUM: "text-yellow-500 dark:text-yellow-400",
  HIGH: "text-orange-500 dark:text-orange-400",
  URGENT: "text-red-600 dark:text-red-400 font-bold",
};

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  NONE: "",
  LOW: "🔵 Low",
  MEDIUM: "🟡 Medium",
  HIGH: "🟠 High",
  URGENT: "🔴 Urgent",
};

const STATUS_OPTIONS: TodoStatus[] = ["TODO", "DOING", "DONE", "CANCELLED"];

export default function TodoItem({
  todo,
  onUpdate,
  isSelected = false,
  onToggleSelection,
  showCheckbox = false,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [attachmentRefresh, setAttachmentRefresh] = useState(0);
  const [dependencyRefresh, setDependencyRefresh] = useState(0);

  const currentUser = getUser();
  const currentUserId = currentUser?.id || "";
  const isDisabled = isDeleting || isUpdatingStatus;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteTodo(todo.id);
      if (!result.success) {
        setError(result.error || "Failed to delete todo");
      } else {
        onUpdate?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: TodoStatus) => {
    if (newStatus === todo.status) return;

    setError("");
    setIsUpdatingStatus(true);

    try {
      const result = await updateTodoStatus(todo.id, newStatus);
      if (!result.success) {
        setError(result.error || "Failed to update status");
      } else {
        onUpdate?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onUpdate?.();
  };

  if (isEditing) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-sm font-medium mb-4">Edit Todo</h3>
        <TodoForm
          todo={todo}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {showCheckbox && (
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection?.(todo.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              aria-label={`Select todo: ${todo.title}`}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium truncate">{todo.title}</h3>
            <select
              value={todo.status}
              onChange={(e) => handleStatusChange(e.target.value as TodoStatus)}
              disabled={isDisabled}
              className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${STATUS_COLORS[todo.status]}`}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {todo.priority !== "NONE" && (
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_COLORS[todo.priority]}`}
              >
                {PRIORITY_LABELS[todo.priority]}
              </span>
            )}
          </div>

          {todo.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-3">
              {todo.description}
            </p>
          )}

          {todo.dueDate &&
            (() => {
              const dueDate = new Date(todo.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dueDate.setHours(0, 0, 0, 0);
              const isOverdue =
                dueDate < today &&
                todo.status !== "DONE" &&
                todo.status !== "CANCELLED";

              return (
                <div
                  className={`mb-3 text-sm flex items-center gap-2 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}
                >
                  <span>{isOverdue ? "⚠️ Overdue:" : "📅 Due:"}</span>
                  <span>{dueDate.toLocaleDateString()}</span>
                </div>
              );
            })()}

          {todo.recurrencePattern !== "NONE" && (
            <div className="mb-3 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <span>🔁</span>
              <span>
                Repeats{" "}
                {formatCustomRecurrence({
                  recurrencePattern: todo.recurrencePattern,
                  recurrenceType: todo.recurrenceType,
                  recurrenceInterval: todo.recurrenceInterval,
                  recurrenceDaysOfWeek: todo.recurrenceDaysOfWeek,
                  recurrenceDayOfMonth: todo.recurrenceDayOfMonth,
                  recurrenceWeekOfMonth: todo.recurrenceWeekOfMonth,
                  recurrenceMonthDay: todo.recurrenceMonthDay,
                }).toLowerCase()}
              </span>
              {todo.recurrenceEndDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (until {new Date(todo.recurrenceEndDate).toLocaleDateString()}
                  )
                </span>
              )}
            </div>
          )}

          {todo.parentRecurringTodoId && (
            <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>🔗</span>
              <span>Part of recurring series</span>
            </div>
          )}

          <div className="mb-3">
            <ReactionBar todoId={todo.id} currentUserId={currentUserId} />
          </div>

          <div className="mb-3">
            <AttachmentList
              todoId={todo.id}
              refreshTrigger={attachmentRefresh}
            />
          </div>

          <div className="mb-3">
            <FileUpload
              todoId={todo.id}
              onUploadSuccess={() => setAttachmentRefresh((prev) => prev + 1)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-action="edit"
              onClick={() => setIsEditing(true)}
              disabled={isDisabled}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDisabled}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              disabled={isDisabled}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showComments ? "Hide Comments" : "Show Comments"}
            </button>
            <button
              type="button"
              onClick={() => setShowActivityLog(!showActivityLog)}
              disabled={isDisabled}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showActivityLog ? "Hide Activity" : "Show Activity"}
            </button>
            <button
              type="button"
              onClick={() => setShowDependencies(!showDependencies)}
              disabled={isDisabled}
              className="text-sm text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showDependencies ? "Hide Dependencies" : "Show Dependencies"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      {showComments && (
        <div className="mt-4">
          <CommentThread todoId={todo.id} />
        </div>
      )}

      {showActivityLog && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ActivityLogList todoId={todo.id} />
        </div>
      )}

      {showDependencies && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Dependencies
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Add Dependency
              </h5>
              <DependencySelector
                todoId={todo.id}
                onDependencyAdded={() =>
                  setDependencyRefresh((prev) => prev + 1)
                }
              />
            </div>
            <div>
              <DependencyList
                todoId={todo.id}
                refreshKey={dependencyRefresh}
                onUpdate={() => setDependencyRefresh((prev) => prev + 1)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
        Created {new Date(todo.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
