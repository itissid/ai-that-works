"use client";

import { useEffect, useState } from "react";
import { getTemplates } from "@/app/actions/templates";
import type { Template } from "@/generated/prisma";

interface TemplateSelectorProps {
  value: string | null;
  onChange: (templateId: string | null) => void;
  onTemplateSelected?: (template: Template | null) => void;
  disabled?: boolean;
}

export default function TemplateSelector({
  value,
  onChange,
  onTemplateSelected,
  disabled,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getTemplates();
        if (result.success) {
          setTemplates(result.templates || []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value || null;
    onChange(templateId);

    if (onTemplateSelected) {
      const template = templates.find((t) => t.id === templateId) || null;
      onTemplateSelected(template);
    }
  };

  if (isLoading) {
    return (
      <select
        disabled
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 opacity-50 cursor-not-allowed"
      >
        <option>Loading templates...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">No template</option>
      {templates.map((template) => (
        <option key={template.id} value={template.id}>
          {template.name}
        </option>
      ))}
    </select>
  );
}
