"use client";

import { type FormEvent, useState } from "react";
import { createTodo, updateTodo } from "@/app/actions/todos";
import ListSelector from "@/components/lists/ListSelector";
import TemplateSelector from "@/components/templates/TemplateSelector";
import type {
  RecurrencePattern,
  RecurrenceType,
  Template,
  Todo,
  TodoPriority,
} from "@/generated/prisma";
import { formatRecurrencePattern } from "@/lib/recurrence";

interface TodoFormProps {
  todo?: Todo;
  onSuccess?: (todo: Todo) => void;
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

export default function TodoForm({ todo, onSuccess, onCancel }: TodoFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [listId, setListId] = useState<string | null>(todo?.listId || null);
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : "",
  );
  const [priority, setPriority] = useState<TodoPriority>(
    todo?.priority || "NONE",
  );
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(
    todo?.recurrencePattern || "NONE",
  );
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    todo?.recurrenceType || "SIMPLE",
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(
    todo?.recurrenceInterval || 1,
  );
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<Set<number>>(
    new Set(
      todo?.recurrenceDaysOfWeek
        ? todo.recurrenceDaysOfWeek.split(",").map(Number)
        : [],
    ),
  );
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(
    todo?.recurrenceDayOfMonth || 1,
  );
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState<number>(
    todo?.recurrenceWeekOfMonth || 0,
  );
  const [recurrenceMonthDay, setRecurrenceMonthDay] = useState<string>(
    todo?.recurrenceMonthDay || "1",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    todo?.recurrenceEndDate
      ? new Date(todo.recurrenceEndDate).toISOString().split("T")[0]
      : "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTemplateSelected = (template: Template | null) => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || "");
      setPriority(template.priority);
      setRecurrencePattern(template.recurrencePattern);
      setRecurrenceType(template.recurrenceType);
      setRecurrenceInterval(template.recurrenceInterval || 1);
      setRecurrenceDaysOfWeek(
        new Set(
          template.recurrenceDaysOfWeek
            ? template.recurrenceDaysOfWeek.split(",").map(Number)
            : [],
        ),
      );
      setRecurrenceDayOfMonth(template.recurrenceDayOfMonth || 1);
      setRecurrenceWeekOfMonth(template.recurrenceWeekOfMonth || 0);
      setRecurrenceMonthDay(template.recurrenceMonthDay || "1");
    }
  };

  const isEditing = !!todo;
  const baseInputClassName =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = isEditing
        ? await updateTodo(todo.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            listId: listId || undefined,
            dueDate: dueDate ? new Date(dueDate) : null,
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
            recurrenceEndDate: recurrenceEndDate
              ? new Date(recurrenceEndDate)
              : null,
          })
        : await createTodo({
            title: title.trim(),
            description: description.trim() || undefined,
            listId: listId || undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined,
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
            recurrenceEndDate: recurrenceEndDate
              ? new Date(recurrenceEndDate)
              : undefined,
          });

      if (!result.success) {
        setError(result.error || "Failed to save todo");
        return;
      }

      if (result.todo) {
        setSelectedTemplateId(null);
        setTitle("");
        setDescription("");
        setListId(null);
        setDueDate("");
        setPriority("NONE");
        setRecurrencePattern("NONE");
        setRecurrenceType("SIMPLE");
        setRecurrenceInterval(1);
        setRecurrenceDaysOfWeek(new Set());
        setRecurrenceDayOfMonth(1);
        setRecurrenceWeekOfMonth(0);
        setRecurrenceMonthDay("1");
        setRecurrenceEndDate("");
        onSuccess?.(result.todo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div>
          <label htmlFor="template" className="block text-sm font-medium mb-2">
            Use Template (Optional)
          </label>
          <TemplateSelector
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            onTemplateSelected={handleTemplateSelected}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select a template to prefill the form
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          className={baseInputClassName}
          placeholder="Enter todo title"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="list" className="block text-sm font-medium mb-2">
          List
        </label>
        <ListSelector
          value={listId}
          onChange={setListId}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium mb-2">
          Priority
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
        <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
          Due Date
        </label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
          className={baseInputClassName}
        />
      </div>

      <div>
        <label htmlFor="recurrence" className="block text-sm font-medium mb-2">
          Repeat
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

          <div>
            <label
              htmlFor="recurrenceEndDate"
              className="block text-sm font-medium mb-2"
            >
              End Date (Optional)
            </label>
            <input
              id="recurrenceEndDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              disabled={isLoading}
              min={dueDate || undefined}
              className={baseInputClassName}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to repeat indefinitely
            </p>
          </div>
        </>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          className={`${baseInputClassName} resize-none`}
          placeholder="Add description (optional)"
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
          {isLoading ? "Saving..." : isEditing ? "Update Todo" : "Create Todo"}
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
