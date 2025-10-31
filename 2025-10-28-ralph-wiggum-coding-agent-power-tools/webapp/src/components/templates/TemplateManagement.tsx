"use client";

import { useCallback, useEffect, useState } from "react";
import { getTemplates } from "@/app/actions/templates";
import type { Template } from "@/generated/prisma";
import TemplateForm from "./TemplateForm";
import TemplateItem from "./TemplateItem";

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadTemplates = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await getTemplates();

      if (!result.success) {
        setError(result.error || "Failed to load templates");
        return;
      }

      setTemplates(result.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateSuccess = () => {
    setShowForm(false);
    loadTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? "Cancel" : "New Template"}
        </button>
      </div>

      {showForm && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
          <TemplateForm
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
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Empty template list"
            >
              <title>Empty template list</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No templates yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateItem
              key={template.id}
              template={template}
              onUpdate={loadTemplates}
            />
          ))}
        </div>
      )}

      {!isLoading && templates.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          Showing {templates.length}{" "}
          {templates.length === 1 ? "template" : "templates"}
        </div>
      )}
    </div>
  );
}
