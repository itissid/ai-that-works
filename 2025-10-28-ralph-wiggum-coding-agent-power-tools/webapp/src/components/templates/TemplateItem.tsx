"use client";

import { useState } from "react";
import { deleteTemplate } from "@/app/actions/templates";
import type { Template } from "@/generated/prisma";
import { formatRecurrencePattern } from "@/lib/recurrence";
import TemplateForm from "./TemplateForm";

interface TemplateItemProps {
  template: Template;
  onUpdate?: () => void;
}

export default function TemplateItem({
  template,
  onUpdate,
}: TemplateItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const result = await deleteTemplate(template.id);
      if (!result.success) {
        setError(result.error || "Failed to delete template");
        return;
      }
      onUpdate?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete template",
      );
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
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-sm font-medium mb-4">Edit Template</h3>
        <TemplateForm
          template={template}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium truncate">{template.name}</h3>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div>
              <span className="font-medium">Title:</span> {template.title}
            </div>
            {template.description && (
              <div>
                <span className="font-medium">Description:</span>{" "}
                {template.description}
              </div>
            )}
            {template.priority !== "NONE" && (
              <div>
                <span className="font-medium">Priority:</span>{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    template.priority === "URGENT"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : template.priority === "HIGH"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                        : template.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {template.priority}
                </span>
              </div>
            )}
            {template.recurrencePattern !== "NONE" && (
              <div>
                <span className="font-medium">Recurrence:</span>{" "}
                {formatRecurrencePattern(template.recurrencePattern)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
        Created {new Date(template.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
