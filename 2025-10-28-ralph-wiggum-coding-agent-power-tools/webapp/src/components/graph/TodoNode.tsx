"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import type { TodoPriority, TodoStatus } from "@/generated/prisma";

export interface TodoNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: Date | null;
  listName: string | null;
  userName: string | null;
  userEmail: string;
}

const STATUS_COLORS: Record<TodoStatus, string> = {
  TODO: "bg-gray-100 border-gray-400 dark:bg-gray-800 dark:border-gray-600",
  DOING: "bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600",
  DONE: "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-600",
  CANCELLED: "bg-red-100 border-red-400 dark:bg-red-900/30 dark:border-red-600",
};

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  NONE: "",
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-600",
};

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  NONE: "",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function TodoNode({ data }: { data: TodoNodeData }) {
  const isOverdue = (() => {
    if (!data.dueDate) return false;
    const dueDate = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return (
      dueDate < today && data.status !== "DONE" && data.status !== "CANCELLED"
    );
  })();

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px] max-w-[300px] ${STATUS_COLORS[data.status]}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-600 dark:!bg-gray-400"
      />

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div
              className={`text-sm font-medium text-gray-900 dark:text-gray-100 break-words ${data.status === "CANCELLED" ? "line-through" : ""}`}
            >
              {data.title}
            </div>
          </div>
          {data.priority !== "NONE" && (
            <span
              className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium text-white rounded ${PRIORITY_COLORS[data.priority]}`}
            >
              {PRIORITY_LABELS[data.priority]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span
            className={`px-2 py-0.5 rounded font-medium ${
              data.status === "TODO"
                ? "bg-gray-200 dark:bg-gray-700"
                : data.status === "DOING"
                  ? "bg-blue-200 dark:bg-blue-800"
                  : data.status === "DONE"
                    ? "bg-green-200 dark:bg-green-800"
                    : "bg-red-200 dark:bg-red-800"
            }`}
          >
            {data.status}
          </span>
        </div>

        {data.listName && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            📋 {data.listName}
          </div>
        )}

        {data.dueDate && (
          <div
            className={`text-xs flex items-center gap-1 ${
              isOverdue
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-gray-500 dark:text-gray-500"
            }`}
          >
            <span>{isOverdue ? "⚠️" : "📅"}</span>
            <span>
              {new Date(data.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-500 truncate">
          👤 {data.userName || data.userEmail}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-600 dark:!bg-gray-400"
      />
    </div>
  );
}

export default memo(TodoNode);
