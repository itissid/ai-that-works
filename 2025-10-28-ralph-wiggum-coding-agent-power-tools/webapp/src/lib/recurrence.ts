import type { RecurrencePattern, RecurrenceType } from "@/generated/prisma";

interface RecurrenceFields {
  recurrencePattern: RecurrencePattern;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number | null;
  recurrenceDaysOfWeek: string | null;
  recurrenceDayOfMonth: number | null;
  recurrenceWeekOfMonth: number | null;
  recurrenceMonthDay: string | null;
}

const WEEKDAY_NAMES: Record<string, string> = {
  "0": "Sun",
  "1": "Mon",
  "2": "Tue",
  "3": "Wed",
  "4": "Thu",
  "5": "Fri",
  "6": "Sat",
};

const WEEK_ORDINALS = ["First", "Second", "Third", "Fourth", "Last"];

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatCustomRecurrence(fields: RecurrenceFields): string {
  const {
    recurrencePattern,
    recurrenceType,
    recurrenceInterval,
    recurrenceDaysOfWeek,
    recurrenceDayOfMonth,
    recurrenceWeekOfMonth,
    recurrenceMonthDay,
  } = fields;

  if (recurrencePattern === "NONE") {
    return "Does not repeat";
  }

  if (recurrenceType === "SIMPLE") {
    const labels: Record<RecurrencePattern, string> = {
      NONE: "Does not repeat",
      DAILY: "Daily",
      WEEKLY: "Weekly",
      BIWEEKLY: "Every 2 weeks",
      MONTHLY: "Monthly",
    };
    return labels[recurrencePattern];
  }

  if (recurrenceType === "INTERVAL" && recurrenceInterval) {
    if (recurrencePattern === "DAILY") {
      return recurrenceInterval === 1
        ? "Daily"
        : `Every ${recurrenceInterval} days`;
    }
    if (recurrencePattern === "WEEKLY") {
      return recurrenceInterval === 1
        ? "Weekly"
        : `Every ${recurrenceInterval} weeks`;
    }
    if (recurrencePattern === "MONTHLY") {
      return recurrenceInterval === 1
        ? "Monthly"
        : `Every ${recurrenceInterval} months`;
    }
  }

  if (recurrenceType === "WEEKDAYS" && recurrenceDaysOfWeek) {
    const days = recurrenceDaysOfWeek
      .split(",")
      .map((d) => WEEKDAY_NAMES[d])
      .filter(Boolean);
    if (days.length === 0) return "Weekly";
    if (days.length === 7) return "Daily";
    return `Weekly on ${days.join(", ")}`;
  }

  if (recurrenceType === "MONTHDAY" && recurrenceDayOfMonth) {
    const suffix = getDaySuffix(recurrenceDayOfMonth);
    return `Monthly on the ${recurrenceDayOfMonth}${suffix}`;
  }

  if (
    recurrenceType === "COMPLEX" &&
    recurrenceWeekOfMonth !== null &&
    recurrenceMonthDay
  ) {
    const weekOrdinal =
      recurrenceWeekOfMonth >= 0 && recurrenceWeekOfMonth < WEEK_ORDINALS.length
        ? WEEK_ORDINALS[recurrenceWeekOfMonth]
        : "Unknown";
    const dayName = WEEKDAY_NAMES[recurrenceMonthDay] || recurrenceMonthDay;
    return `Monthly on the ${weekOrdinal} ${dayName}`;
  }

  return "Custom recurrence";
}

/**
 * Calculate the next due date based on recurrence pattern and type
 * @param currentDueDate - Current todo's due date
 * @param fields - Recurrence configuration fields
 * @returns Next due date or null if no due date provided
 */
export function calculateNextDueDate(
  currentDueDate: Date | null,
  fields: RecurrenceFields,
): Date | null {
  if (!currentDueDate || fields.recurrencePattern === "NONE") return null;

  const nextDate = new Date(currentDueDate);
  const {
    recurrencePattern,
    recurrenceType,
    recurrenceInterval,
    recurrenceDaysOfWeek,
    recurrenceDayOfMonth,
    recurrenceWeekOfMonth,
    recurrenceMonthDay,
  } = fields;

  // Handle SIMPLE recurrence (backwards compatible)
  if (recurrenceType === "SIMPLE") {
    switch (recurrencePattern) {
      case "DAILY":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "WEEKLY":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "BIWEEKLY":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "MONTHLY":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    return nextDate;
  }

  // Handle INTERVAL recurrence (every N days/weeks/months)
  if (recurrenceType === "INTERVAL" && recurrenceInterval) {
    switch (recurrencePattern) {
      case "DAILY":
        nextDate.setDate(nextDate.getDate() + recurrenceInterval);
        break;
      case "WEEKLY":
        nextDate.setDate(nextDate.getDate() + recurrenceInterval * 7);
        break;
      case "MONTHLY":
        nextDate.setMonth(nextDate.getMonth() + recurrenceInterval);
        break;
    }
    return nextDate;
  }

  // Handle WEEKDAYS recurrence (specific days of week)
  if (recurrenceType === "WEEKDAYS" && recurrenceDaysOfWeek) {
    const selectedDays = recurrenceDaysOfWeek
      .split(",")
      .map(Number)
      .sort((a, b) => a - b);
    if (selectedDays.length === 0) return null;

    const currentDay = nextDate.getDay();
    let daysToAdd = 0;

    // Find the next selected day
    for (const day of selectedDays) {
      if (day > currentDay) {
        daysToAdd = day - currentDay;
        break;
      }
    }

    // If no day found after current day, wrap to next week
    if (daysToAdd === 0) {
      daysToAdd = 7 - currentDay + selectedDays[0];
    }

    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  // Handle MONTHDAY recurrence (specific day of month)
  if (recurrenceType === "MONTHDAY" && recurrenceDayOfMonth) {
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(recurrenceDayOfMonth);

    // Handle months with fewer days (e.g., Feb 30 -> Feb 28/29)
    if (nextDate.getDate() !== recurrenceDayOfMonth) {
      nextDate.setDate(0); // Set to last day of previous month
    }

    return nextDate;
  }

  // Handle COMPLEX recurrence (e.g., "first Monday of every month")
  if (
    recurrenceType === "COMPLEX" &&
    recurrenceWeekOfMonth !== null &&
    recurrenceMonthDay
  ) {
    const targetDay = Number.parseInt(recurrenceMonthDay, 10);
    if (Number.isNaN(targetDay)) return null;

    // Move to next month
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(1);

    // Find the first occurrence of target weekday in the month
    while (nextDate.getDay() !== targetDay) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    // Handle "Last" weekday of month (weekOfMonth = 4 or higher)
    if (recurrenceWeekOfMonth === 4) {
      // Find the last occurrence of this weekday
      const tempDate = new Date(nextDate);
      tempDate.setMonth(tempDate.getMonth() + 1);
      tempDate.setDate(0); // Last day of current month

      // Walk backwards to find the last occurrence of target weekday
      while (tempDate.getDay() !== targetDay) {
        tempDate.setDate(tempDate.getDate() - 1);
      }
      return tempDate;
    }

    // Add weeks for 2nd, 3rd, 4th occurrence
    nextDate.setDate(nextDate.getDate() + recurrenceWeekOfMonth * 7);

    // Verify we didn't roll into next month
    if (nextDate.getMonth() !== (currentDueDate.getMonth() + 1) % 12) {
      // Rolled over, use last occurrence instead
      nextDate.setDate(nextDate.getDate() - 7);
    }

    return nextDate;
  }

  // Fallback to simple pattern if type not recognized
  switch (recurrencePattern) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "BIWEEKLY":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
}

/**
 * Check if a recurring todo should generate next instance
 * @param recurrenceEndDate - Optional end date for recurrence
 * @param nextDueDate - Calculated next due date
 * @returns Boolean indicating if next instance should be created
 */
export function shouldCreateNextInstance(
  recurrenceEndDate: Date | null,
  nextDueDate: Date | null,
): boolean {
  if (!nextDueDate) return false;
  if (!recurrenceEndDate) return true;

  return nextDueDate <= recurrenceEndDate;
}

/**
 * Format recurrence pattern for display
 */
export function formatRecurrencePattern(pattern: RecurrencePattern): string {
  const labels: Record<RecurrencePattern, string> = {
    NONE: "Does not repeat",
    DAILY: "Daily",
    WEEKLY: "Weekly",
    BIWEEKLY: "Every 2 weeks",
    MONTHLY: "Monthly",
  };
  return labels[pattern];
}
