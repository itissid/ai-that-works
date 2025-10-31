"use server";

import { revalidatePath } from "next/cache";
import type {
  RecurrencePattern,
  RecurrenceType,
  Template,
  TodoPriority,
} from "@/generated/prisma";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export interface CreateTemplateInput {
  name: string;
  title: string;
  description?: string;
  priority?: TodoPriority;
  recurrencePattern?: RecurrencePattern;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceDaysOfWeek?: string;
  recurrenceDayOfMonth?: number;
  recurrenceWeekOfMonth?: number;
  recurrenceMonthDay?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  recurrencePattern?: RecurrencePattern;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number | null;
  recurrenceDaysOfWeek?: string | null;
  recurrenceDayOfMonth?: number | null;
  recurrenceWeekOfMonth?: number | null;
  recurrenceMonthDay?: string | null;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createTemplate(
  input: CreateTemplateInput,
): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const session = await requireAuth();

    if (!input.name?.trim()) {
      return { success: false, error: "Name is required" };
    }

    if (!input.title?.trim()) {
      return { success: false, error: "Title is required" };
    }

    const template = await prisma.template.create({
      data: {
        name: input.name.trim(),
        title: input.title.trim(),
        description: input.description?.trim() || null,
        priority: input.priority || "NONE",
        recurrencePattern: input.recurrencePattern || "NONE",
        recurrenceType: input.recurrenceType || "SIMPLE",
        recurrenceInterval: input.recurrenceInterval,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth,
        recurrenceWeekOfMonth: input.recurrenceWeekOfMonth,
        recurrenceMonthDay: input.recurrenceMonthDay,
        userId: session.userId,
      },
    });

    revalidatePath("/");
    return { success: true, template };
  } catch (error) {
    console.error("Create template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function getTemplates(): Promise<{
  success: boolean;
  templates?: Template[];
  error?: string;
}> {
  try {
    const session = await requireAuth();

    const templates = await prisma.template.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, templates };
  } catch (error) {
    console.error("Get templates error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch templates",
    };
  }
}

export async function getTemplate(
  id: string,
): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const session = await requireAuth();

    const template = await prisma.template.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, template };
  } catch (error) {
    console.error("Get template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch template",
    };
  }
}

export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput,
): Promise<{ success: boolean; template?: Template; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.template.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    if (input.name !== undefined && !input.name?.trim()) {
      return { success: false, error: "Name cannot be empty" };
    }

    if (input.title !== undefined && !input.title?.trim()) {
      return { success: false, error: "Title cannot be empty" };
    }

    const data: {
      name?: string;
      title?: string;
      description?: string | null;
      priority?: TodoPriority;
      recurrencePattern?: RecurrencePattern;
      recurrenceType?: RecurrenceType;
      recurrenceInterval?: number | null;
      recurrenceDaysOfWeek?: string | null;
      recurrenceDayOfMonth?: number | null;
      recurrenceWeekOfMonth?: number | null;
      recurrenceMonthDay?: string | null;
    } = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined)
      data.description = input.description?.trim() || null;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.recurrencePattern !== undefined)
      data.recurrencePattern = input.recurrencePattern;
    if (input.recurrenceType !== undefined)
      data.recurrenceType = input.recurrenceType;
    if (input.recurrenceInterval !== undefined)
      data.recurrenceInterval = input.recurrenceInterval;
    if (input.recurrenceDaysOfWeek !== undefined)
      data.recurrenceDaysOfWeek = input.recurrenceDaysOfWeek;
    if (input.recurrenceDayOfMonth !== undefined)
      data.recurrenceDayOfMonth = input.recurrenceDayOfMonth;
    if (input.recurrenceWeekOfMonth !== undefined)
      data.recurrenceWeekOfMonth = input.recurrenceWeekOfMonth;
    if (input.recurrenceMonthDay !== undefined)
      data.recurrenceMonthDay = input.recurrenceMonthDay;

    const template = await prisma.template.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    return { success: true, template };
  } catch (error) {
    console.error("Update template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update template",
    };
  }
}

export async function deleteTemplate(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.template.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return { success: false, error: "Template not found" };
    }

    await prisma.template.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete template",
    };
  }
}
