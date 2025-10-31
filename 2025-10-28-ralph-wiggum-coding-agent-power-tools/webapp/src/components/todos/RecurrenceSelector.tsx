"use client";

import { useState } from "react";
import type { RecurrencePattern } from "@/generated/prisma";
import {
  type CustomRecurrencePattern,
  DAY_NAMES,
  type DayOfWeek,
  formatCustomRecurrencePattern,
  MONTHLY_PATTERNS,
  type MonthlyPatternType,
} from "@/lib/recurrence-custom";

interface RecurrenceSelectorProps {
  value: CustomRecurrencePattern;
  onChange: (value: CustomRecurrencePattern) => void;
  disabled?: boolean;
}

const BASIC_PATTERNS: RecurrencePattern[] = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
];

export default function RecurrenceSelector({
  value,
  onChange,
  disabled = false,
}: RecurrenceSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const baseInputClassName =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";

  const handlePatternChange = (pattern: RecurrencePattern) => {
    onChange({
      ...value,
      pattern,
      interval: pattern === "NONE" ? undefined : value.interval || 1,
      daysOfWeek:
        pattern === "WEEKLY" || pattern === "BIWEEKLY"
          ? value.daysOfWeek || []
          : undefined,
      dayOfMonth: pattern === "MONTHLY" ? value.dayOfMonth : undefined,
      monthlyPattern:
        pattern === "MONTHLY"
          ? value.monthlyPattern || "DAY_OF_MONTH"
          : undefined,
    });
  };

  const handleIntervalChange = (interval: number) => {
    onChange({ ...value, interval });
  };

  const handleDayOfWeekToggle = (day: DayOfWeek) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    onChange({ ...value, daysOfWeek: newDays });
  };

  const handleDayOfMonthChange = (day: number) => {
    onChange({ ...value, dayOfMonth: day });
  };

  const handleMonthlyPatternChange = (pattern: MonthlyPatternType) => {
    onChange({
      ...value,
      monthlyPattern: pattern,
      dayOfMonth:
        pattern === "DAY_OF_MONTH" ? value.dayOfMonth || 1 : undefined,
    });
  };

  const getPatternLabel = (pattern: RecurrencePattern): string => {
    const labels: Record<RecurrencePattern, string> = {
      NONE: "Does not repeat",
      DAILY: "Daily",
      WEEKLY: "Weekly",
      BIWEEKLY: "Every 2 weeks",
      MONTHLY: "Monthly",
    };
    return labels[pattern];
  };

  const showWeeklyOptions =
    value.pattern === "WEEKLY" || value.pattern === "BIWEEKLY";
  const showMonthlyOptions = value.pattern === "MONTHLY";
  const showIntervalInput = value.pattern !== "NONE";

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="recurrence-pattern"
          className="block text-sm font-medium mb-2"
        >
          Repeat
        </label>
        <select
          id="recurrence-pattern"
          value={value.pattern}
          onChange={(e) =>
            handlePatternChange(e.target.value as RecurrencePattern)
          }
          disabled={disabled}
          className={baseInputClassName}
        >
          {BASIC_PATTERNS.map((pattern) => (
            <option key={pattern} value={pattern}>
              {getPatternLabel(pattern)}
            </option>
          ))}
        </select>
      </div>

      {value.pattern !== "NONE" && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={disabled}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showAdvanced ? "Hide advanced options" : "Show advanced options"}
          </button>
        </div>
      )}

      {showAdvanced && value.pattern !== "NONE" && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {showIntervalInput && (
            <div>
              <label
                htmlFor="interval"
                className="block text-sm font-medium mb-2"
              >
                Every
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="interval"
                  type="number"
                  min="1"
                  max="365"
                  value={value.interval || 1}
                  onChange={(e) =>
                    handleIntervalChange(parseInt(e.target.value, 10) || 1)
                  }
                  disabled={disabled}
                  className={`${baseInputClassName} max-w-[100px]`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value.pattern === "DAILY" && "day(s)"}
                  {value.pattern === "WEEKLY" && "week(s)"}
                  {value.pattern === "BIWEEKLY" && "week(s)"}
                  {value.pattern === "MONTHLY" && "month(s)"}
                </span>
              </div>
            </div>
          )}

          {showWeeklyOptions && (
            <div>
              <span className="block text-sm font-medium mb-2">Repeat on</span>
              <div className="grid grid-cols-7 gap-2">
                {DAY_NAMES.map((dayName, index) => {
                  const day = index as DayOfWeek;
                  const isSelected = (value.daysOfWeek || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayOfWeekToggle(day)}
                      disabled={disabled}
                      className={`px-2 py-2 text-xs rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      {dayName.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showMonthlyOptions && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="monthly-pattern"
                  className="block text-sm font-medium mb-2"
                >
                  Pattern
                </label>
                <select
                  id="monthly-pattern"
                  value={value.monthlyPattern || "DAY_OF_MONTH"}
                  onChange={(e) =>
                    handleMonthlyPatternChange(
                      e.target.value as MonthlyPatternType,
                    )
                  }
                  disabled={disabled}
                  className={baseInputClassName}
                >
                  {MONTHLY_PATTERNS.map((pattern) => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>
              </div>

              {value.monthlyPattern === "DAY_OF_MONTH" && (
                <div>
                  <label
                    htmlFor="day-of-month"
                    className="block text-sm font-medium mb-2"
                  >
                    Day of month
                  </label>
                  <input
                    id="day-of-month"
                    type="number"
                    min="1"
                    max="31"
                    value={value.dayOfMonth || 1}
                    onChange={(e) =>
                      handleDayOfMonthChange(parseInt(e.target.value, 10) || 1)
                    }
                    disabled={disabled}
                    className={`${baseInputClassName} max-w-[100px]`}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter a day between 1-31
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Summary:</strong> {formatCustomRecurrencePattern(value)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
