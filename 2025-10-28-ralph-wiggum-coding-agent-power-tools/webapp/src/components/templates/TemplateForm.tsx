"use client";

import { type FormEvent, useState } from "react";
import { createTemplate, updateTemplate } from "@/app/actions/templates";
import type {
  RecurrencePattern,
  RecurrenceType,
  Template,
  TodoPriority,
} from "@/generated/prisma";
import { formatRecurrencePattern } from "@/lib/recurrence";

interface TemplateFormProps {
  template?: Template;
  onSuccess?: (template: Template) => void;
  onCancel?: () => void;
}

const PRIORITY_OPTIONS: TodoPriority[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const RECURRENCE_OPTIONS: RecurrencePattern[] = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
];

export default function TemplateForm({
  template,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const [name, setName] = useState(template?.name || "");
  const [title, setTitle] = useState(template?.title || "");
  const [description, setDescription] = useState(template?.description || "");
  const [priority, setPriority] = useState<TodoPriority>(
    template?.priority || "NONE",
  );
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    template?.recurrencePattern || "NONE",
  );
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    template?.recurrenceType || "SIMPLE",
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(
    template?.recurrenceInterval || 1,
  );
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<Set<number>>(
    new Set(
      template?.recurrenceDaysOfWeek
        ? template.recurrenceDaysOfWeek.split(",").map(Number)
        : [],
    ),
  );
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(
    template?.recurrenceDayOfMonth || 1,
  );
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState<number>(
    template?.recurrenceWeekOfMonth || 0,
  );
  const [recurrenceMonthDay, setRecurrenceMonthDay] = useState<string>(
    template?.recurrenceMonthDay || "1",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!template;
  const baseInputClassName =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    if (!title.trim()) {
      setError("Default title is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = isEditing
        ? await updateTemplate(template.id, {
            name: name.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            recurrencePattern,
            recurrenceType,
            recurrenceInterval:
              recurrenceType === "INTERVAL" ? recurrenceInterval : null,
            recurrenceDaysOfWeek:
              recurrenceType === "WEEKDAYS"
                ? Array.from(recurrenceDaysOfWeek).sort().join(",")
                : null,
            recurrenceDayOfMonth:
              recurrenceType === "MONTHDAY" ? recurrenceDayOfMonth : null,
            recurrenceWeekOfMonth:
              recurrenceType === "COMPLEX" ? recurrenceWeekOfMonth : null,
            recurrenceMonthDay:
              recurrenceType === "COMPLEX" ? recurrenceMonthDay : null,
          })
        : await createTemplate({
            name: name.trim(),
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            recurrencePattern,
            recurrenceType,
            recurrenceInterval:
              recurrenceType === "INTERVAL" ? recurrenceInterval : undefined,
            recurrenceDaysOfWeek:
              recurrenceType === "WEEKDAYS"
                ? Array.from(recurrenceDaysOfWeek).sort().join(",")
                : undefined,
            recurrenceDayOfMonth:
              recurrenceType === "MONTHDAY" ? recurrenceDayOfMonth : undefined,
            recurrenceWeekOfMonth:
              recurrenceType === "COMPLEX" ? recurrenceWeekOfMonth : undefined,
            recurrenceMonthDay:
              recurrenceType === "COMPLEX" ? recurrenceMonthDay : undefined,
          });

      if (!result.success) {
        setError(result.error || "Failed to save template");
        return;
      }

      if (result.template) {
        setName("");
        setTitle("");
        setDescription("");
        setPriority("NONE");
        setRecurrencePattern("NONE");
        setRecurrenceType("SIMPLE");
        setRecurrenceInterval(1);
        setRecurrenceDaysOfWeek(new Set());
        setRecurrenceDayOfMonth(1);
        setRecurrenceWeekOfMonth(0);
        setRecurrenceMonthDay("1");
        onSuccess?.(result.template);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Template Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className={baseInputClassName}
          placeholder="e.g., Weekly Report, Daily Standup"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Default Todo Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className={baseInputClassName}
          placeholder="Default title for todos created from this template"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium mb-2">
          Default Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          disabled={isLoading}
          className={baseInputClassName}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="recurrence" className="block text-sm font-medium mb-2">
          Default Recurrence
        </label>
        <select
          id="recurrence"
          value={recurrencePattern}
          onChange={(e) => {
            setRecurrencePattern(e.target.value as RecurrencePattern);
            if (e.target.value === "NONE") {
              setRecurrenceType("SIMPLE");
            }
          }}
          disabled={isLoading}
          className={baseInputClassName}
        >
          {RECURRENCE_OPTIONS.map((pattern) => (
            <option key={pattern} value={pattern}>
              {formatRecurrencePattern(pattern)}
            </option>
          ))}
        </select>
      </div>

      {recurrencePattern !== "NONE" && (
        <>
          <div>
            <label
              htmlFor="recurrenceType"
              className="block text-sm font-medium mb-2"
            >
              Recurrence Type
            </label>
            <select
              id="recurrenceType"
              value={recurrenceType}
              onChange={(e) =>
                setRecurrenceType(e.target.value as RecurrenceType)
              }
              disabled={isLoading}
              className={baseInputClassName}
            >
              <option value="SIMPLE">Simple (default)</option>
              <option value="INTERVAL">
                Custom Interval (every N days/weeks/months)
              </option>
              {(recurrencePattern === "WEEKLY" ||
                recurrencePattern === "BIWEEKLY") && (
                <option value="WEEKDAYS">Specific Days of Week</option>
              )}
              {recurrencePattern === "MONTHLY" && (
                <>
                  <option value="MONTHDAY">Specific Day of Month</option>
                  <option value="COMPLEX">
                    Specific Weekday (e.g., first Monday)
                  </option>
                </>
              )}
            </select>
          </div>

          {recurrenceType === "INTERVAL" && (
            <div>
              <label
                htmlFor="recurrenceInterval"
                className="block text-sm font-medium mb-2"
              >
                Repeat Every
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="recurrenceInterval"
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={(e) =>
                    setRecurrenceInterval(
                      Number.parseInt(e.target.value, 10) || 1,
                    )
                  }
                  disabled={isLoading}
                  className={baseInputClassName}
                />
                <span className="text-sm">
                  {recurrencePattern === "DAILY"
                    ? "days"
                    : recurrencePattern === "WEEKLY" ||
                        recurrencePattern === "BIWEEKLY"
                      ? "weeks"
                      : "months"}
                </span>
              </div>
            </div>
          )}

          {recurrenceType === "WEEKDAYS" && (
            <div>
              <span className="block text-sm font-medium mb-2">
                Days of Week
              </span>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <label
                      key={day}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={recurrenceDaysOfWeek.has(index)}
                        onChange={(e) => {
                          const newSet = new Set(recurrenceDaysOfWeek);
                          if (e.target.checked) {
                            newSet.add(index);
                          } else {
                            newSet.delete(index);
                          }
                          setRecurrenceDaysOfWeek(newSet);
                        }}
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-xs">{day}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}

          {recurrenceType === "MONTHDAY" && (
            <div>
              <label
                htmlFor="recurrenceDayOfMonth"
                className="block text-sm font-medium mb-2"
              >
                Day of Month
              </label>
              <input
                id="recurrenceDayOfMonth"
                type="number"
                min="1"
                max="31"
                value={recurrenceDayOfMonth}
                onChange={(e) =>
                  setRecurrenceDayOfMonth(
                    Number.parseInt(e.target.value, 10) || 1,
                  )
                }
                disabled={isLoading}
                className={baseInputClassName}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For months with fewer days, the last day will be used
              </p>
            </div>
          )}

          {recurrenceType === "COMPLEX" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="recurrenceWeekOfMonth"
                  className="block text-sm font-medium mb-2"
                >
                  Week
                </label>
                <select
                  id="recurrenceWeekOfMonth"
                  value={recurrenceWeekOfMonth}
                  onChange={(e) =>
                    setRecurrenceWeekOfMonth(
                      Number.parseInt(e.target.value, 10),
                    )
                  }
                  disabled={isLoading}
                  className={baseInputClassName}
                >
                  <option value="0">First</option>
                  <option value="1">Second</option>
                  <option value="2">Third</option>
                  <option value="3">Fourth</option>
                  <option value="4">Last</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="recurrenceMonthDay"
                  className="block text-sm font-medium mb-2"
                >
                  Day of Week
                </label>
                <select
                  id="recurrenceMonthDay"
                  value={recurrenceMonthDay}
                  onChange={(e) => setRecurrenceMonthDay(e.target.value)}
                  disabled={isLoading}
                  className={baseInputClassName}
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Default Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          className={`${baseInputClassName} resize-none`}
          placeholder="Default description (optional)"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading
            ? "Saving..."
            : isEditing
              ? "Update Template"
              : "Create Template"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
