"use client";

import { useState } from "react";
import { deleteTodo } from "@/app/actions/todos";
import AttachmentList from "@/components/attachments/AttachmentList";
import FileUpload from "@/components/attachments/FileUpload";
import DependencyList from "@/components/dependencies/DependencyList";
import DependencySelector from "@/components/dependencies/DependencySelector";
import type { Todo, TodoPriority } from "@/generated/prisma";
import { getUser } from "@/lib/auth";
import { formatCustomRecurrence } from "@/lib/recurrence";
import CommentThread from "./CommentThread";
import ReactionBar from "./ReactionBar";
import TodoForm from "./TodoForm";

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

interface KanbanCardProps {
  todo: Todo;
  onUpdate?: () => void;
  onDragStart: (e: React.DragEvent, todoId: string) => void;
  batchMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (todoId: string) => void;
}

export default function KanbanCard({
  todo,
  onUpdate,
  onDragStart,
  batchMode = false,
  isSelected = false,
  onToggleSelection,
}: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [attachmentRefresh, setAttachmentRefresh] = useState(0);
  const [dependencyRefresh, setDependencyRefresh] = useState(0);

  const currentUser = getUser();
  const currentUserId = currentUser?.id || "";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteTodo(todo.id);
      if (!result.success) {
        setError(result.error || "Failed to delete todo");
        return;
      }
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onUpdate?.();
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
    // biome-ignore lint/a11y/noStaticElementInteractions: HTML5 drag-and-drop requires draggable div
    // biome-ignore lint/a11y/useKeyWithClickEvents: Checkbox provides keyboard access for batch mode
    <div
      draggable={!batchMode}
      onDragStart={(e) => !batchMode && onDragStart(e, todo.id)}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition ${
        batchMode ? "cursor-pointer" : "cursor-move"
      }`}
      onClick={(e) => {
        if (batchMode && onToggleSelection) {
          e.stopPropagation();
          onToggleSelection(todo.id);
        }
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {batchMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                if (onToggleSelection) {
                  onToggleSelection(todo.id);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          )}
          <h3 className="text-base font-medium flex-1">{todo.title}</h3>
          {todo.priority !== "NONE" && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_COLORS[todo.priority]}`}
            >
              {PRIORITY_LABELS[todo.priority]}
            </span>
          )}
        </div>

        {todo.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {todo.description}
          </p>
        )}

        {todo.dueDate && (
          <div>
            {(() => {
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
                  className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}
                >
                  <span>{isOverdue ? "⚠️" : "📅"}</span>
                  <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                </div>
              );
            })()}
          </div>
        )}

        {todo.recurrencePattern !== "NONE" && (
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <span>🔁</span>
            <span>
              {formatCustomRecurrence({
                recurrencePattern: todo.recurrencePattern,
                recurrenceType: todo.recurrenceType,
                recurrenceInterval: todo.recurrenceInterval,
                recurrenceDaysOfWeek: todo.recurrenceDaysOfWeek,
                recurrenceDayOfMonth: todo.recurrenceDayOfMonth,
                recurrenceWeekOfMonth: todo.recurrenceWeekOfMonth,
                recurrenceMonthDay: todo.recurrenceMonthDay,
              })}
            </span>
          </div>
        )}

        <ReactionBar todoId={todo.id} currentUserId={currentUserId} />

        <AttachmentList todoId={todo.id} refreshTrigger={attachmentRefresh} />

        <FileUpload
          todoId={todo.id}
          onUploadSuccess={() => setAttachmentRefresh((prev) => prev + 1)}
        />

        {!batchMode && (
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              data-action="edit"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              disabled={isDeleting}
              className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              disabled={isDeleting}
              className="text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50"
            >
              {showComments ? "Hide" : "Comments"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDependencies(!showDependencies);
              }}
              disabled={isDeleting}
              className="text-gray-600 dark:text-gray-400 hover:underline disabled:opacity-50"
            >
              {showDependencies ? "Hide" : "Dependencies"}
            </button>
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-xs">
            {error}
          </div>
        )}

        {showComments && <CommentThread todoId={todo.id} />}

        {showDependencies && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dependencies
            </h5>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Add Dependency
                </p>
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
      </div>
    </div>
  );
}
