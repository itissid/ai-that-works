import type { RecurrencePattern } from "@/generated/prisma";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MonthlyPatternType =
  | "DAY_OF_MONTH"
  | "FIRST_MONDAY"
  | "FIRST_TUESDAY"
  | "FIRST_WEDNESDAY"
  | "FIRST_THURSDAY"
  | "FIRST_FRIDAY"
  | "FIRST_SATURDAY"
  | "FIRST_SUNDAY"
  | "LAST_MONDAY"
  | "LAST_TUESDAY"
  | "LAST_WEDNESDAY"
  | "LAST_THURSDAY"
  | "LAST_FRIDAY"
  | "LAST_SATURDAY"
  | "LAST_SUNDAY";

export interface CustomRecurrencePattern {
  pattern: RecurrencePattern;
  interval?: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthlyPattern?: MonthlyPatternType;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MONTHLY_PATTERNS: Array<{
  value: MonthlyPatternType;
  label: string;
}> = [
  { value: "DAY_OF_MONTH", label: "Specific day of month" },
  { value: "FIRST_MONDAY", label: "First Monday" },
  { value: "FIRST_TUESDAY", label: "First Tuesday" },
  { value: "FIRST_WEDNESDAY", label: "First Wednesday" },
  { value: "FIRST_THURSDAY", label: "First Thursday" },
  { value: "FIRST_FRIDAY", label: "First Friday" },
  { value: "FIRST_SATURDAY", label: "First Saturday" },
  { value: "FIRST_SUNDAY", label: "First Sunday" },
  { value: "LAST_MONDAY", label: "Last Monday" },
  { value: "LAST_TUESDAY", label: "Last Tuesday" },
  { value: "LAST_WEDNESDAY", label: "Last Wednesday" },
  { value: "LAST_THURSDAY", label: "Last Thursday" },
  { value: "LAST_FRIDAY", label: "Last Friday" },
  { value: "LAST_SATURDAY", label: "Last Saturday" },
  { value: "LAST_SUNDAY", label: "Last Sunday" },
];

export function formatCustomRecurrencePattern(
  pattern: CustomRecurrencePattern,
): string {
  if (pattern.pattern === "NONE") {
    return "Does not repeat";
  }

  const interval = pattern.interval || 1;
  let result = "";

  switch (pattern.pattern) {
    case "DAILY":
      result = interval === 1 ? "Daily" : `Every ${interval} days`;
      break;
    case "WEEKLY":
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const days = pattern.daysOfWeek.map((d) => DAY_NAMES[d]).join(", ");
        result =
          interval === 1
            ? `Weekly on ${days}`
            : `Every ${interval} weeks on ${days}`;
      } else {
        result = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
      }
      break;
    case "BIWEEKLY":
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const days = pattern.daysOfWeek.map((d) => DAY_NAMES[d]).join(", ");
        result = `Every 2 weeks on ${days}`;
      } else {
        result = "Every 2 weeks";
      }
      break;
    case "MONTHLY":
      if (pattern.monthlyPattern && pattern.monthlyPattern !== "DAY_OF_MONTH") {
        const patternLabel =
          MONTHLY_PATTERNS.find((p) => p.value === pattern.monthlyPattern)
            ?.label || "";
        result =
          interval === 1
            ? `Monthly on ${patternLabel}`
            : `Every ${interval} months on ${patternLabel}`;
      } else if (pattern.dayOfMonth) {
        result =
          interval === 1
            ? `Monthly on day ${pattern.dayOfMonth}`
            : `Every ${interval} months on day ${pattern.dayOfMonth}`;
      } else {
        result = interval === 1 ? "Monthly" : `Every ${interval} months`;
      }
      break;
  }

  return result;
}
