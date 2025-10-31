"use server";

import { revalidatePath } from "next/cache";
import type {
  RecurrencePattern,
  Todo,
  TodoPriority,
  TodoStatus,
} from "@/generated/prisma";
import { createActivityLog } from "@/lib/activity-log-server";
import { getSession } from "@/lib/auth-server";
import { createNotification } from "@/lib/notifications-server";
import { prisma } from "@/lib/prisma";
import {
  calculateNextDueDate,
  shouldCreateNextInstance,
} from "@/lib/recurrence";

export interface TodoWithUser extends Todo {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  listId?: string;
  dueDate?: Date;
  priority?: TodoPriority;
  recurrencePattern?: RecurrencePattern;
  recurrenceType?: import("@/generated/prisma").RecurrenceType;
  recurrenceInterval?: number;
  recurrenceDaysOfWeek?: string;
  recurrenceDayOfMonth?: number;
  recurrenceWeekOfMonth?: number;
  recurrenceMonthDay?: string;
  recurrenceEndDate?: Date;
  parentRecurringTodoId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  listId?: string | null;
  dueDate?: Date | null;
  priority?: TodoPriority;
  recurrencePattern?: RecurrencePattern;
  recurrenceType?: import("@/generated/prisma").RecurrenceType;
  recurrenceInterval?: number | null;
  recurrenceDaysOfWeek?: string | null;
  recurrenceDayOfMonth?: number | null;
  recurrenceWeekOfMonth?: number | null;
  recurrenceMonthDay?: string | null;
  recurrenceEndDate?: Date | null;
}

export interface BatchUpdateResult {
  success: boolean;
  updatedCount: number;
  failedIds: string[];
  error?: string;
}

export interface BatchDeleteResult {
  success: boolean;
  deletedCount: number;
  failedIds: string[];
  error?: string;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function createNextRecurringInstance(
  completedTodo: Todo,
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    if (completedTodo.recurrencePattern === "NONE") {
      return { success: true };
    }

    const nextDueDate = calculateNextDueDate(completedTodo.dueDate, {
      recurrencePattern: completedTodo.recurrencePattern,
      recurrenceType: completedTodo.recurrenceType,
      recurrenceInterval: completedTodo.recurrenceInterval,
      recurrenceDaysOfWeek: completedTodo.recurrenceDaysOfWeek,
      recurrenceDayOfMonth: completedTodo.recurrenceDayOfMonth,
      recurrenceWeekOfMonth: completedTodo.recurrenceWeekOfMonth,
      recurrenceMonthDay: completedTodo.recurrenceMonthDay,
    });

    if (
      !shouldCreateNextInstance(completedTodo.recurrenceEndDate, nextDueDate)
    ) {
      return { success: true };
    }

    const parentId = completedTodo.parentRecurringTodoId || completedTodo.id;

    const nextInstance = await prisma.todo.create({
      data: {
        title: completedTodo.title,
        description: completedTodo.description,
        status: "TODO",
        priority: completedTodo.priority,
        listId: completedTodo.listId,
        dueDate: nextDueDate,
        recurrencePattern: completedTodo.recurrencePattern,
        recurrenceType: completedTodo.recurrenceType,
        recurrenceInterval: completedTodo.recurrenceInterval,
        recurrenceDaysOfWeek: completedTodo.recurrenceDaysOfWeek,
        recurrenceDayOfMonth: completedTodo.recurrenceDayOfMonth,
        recurrenceWeekOfMonth: completedTodo.recurrenceWeekOfMonth,
        recurrenceMonthDay: completedTodo.recurrenceMonthDay,
        recurrenceEndDate: completedTodo.recurrenceEndDate,
        parentRecurringTodoId: parentId,
        userId: completedTodo.userId,
      },
    });

    const recipients = await getNotificationRecipients(
      nextInstance.listId,
      completedTodo.userId,
    );

    for (const recipientId of recipients) {
      await createNotification({
        type: "TODO_CREATED",
        message: `Recurring todo created: "${nextInstance.title}"`,
        userId: recipientId,
        todoId: nextInstance.id,
        listId: nextInstance.listId || undefined,
        actorId: completedTodo.userId,
      });
    }

    return { success: true, todo: nextInstance };
  } catch (error) {
    console.error("Create next recurring instance error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create next instance",
    };
  }
}

async function getNotificationRecipients(
  listId: string | null,
  excludeUserId: string,
): Promise<string[]> {
  if (!listId) return [];

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      shares: { select: { userId: true } },
    },
  });

  if (!list) return [];

  const recipients = new Set<string>();
  if (list.userId !== excludeUserId) {
    recipients.add(list.userId);
  }
  for (const share of list.shares) {
    if (share.userId !== excludeUserId) {
      recipients.add(share.userId);
    }
  }
  return Array.from(recipients);
}

export async function createTodo(
  input: CreateTodoInput,
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const session = await requireAuth();

    if (!input.title?.trim()) {
      return { success: false, error: "Title is required" };
    }

    const todo = await prisma.todo.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        listId: input.listId || null,
        dueDate: input.dueDate || null,
        priority: input.priority || "NONE",
        recurrencePattern: input.recurrencePattern || "NONE",
        recurrenceType: input.recurrenceType || "SIMPLE",
        recurrenceInterval: input.recurrenceInterval || null,
        recurrenceDaysOfWeek: input.recurrenceDaysOfWeek || null,
        recurrenceDayOfMonth: input.recurrenceDayOfMonth || null,
        recurrenceWeekOfMonth: input.recurrenceWeekOfMonth || null,
        recurrenceMonthDay: input.recurrenceMonthDay || null,
        recurrenceEndDate: input.recurrenceEndDate || null,
        parentRecurringTodoId: input.parentRecurringTodoId || null,
        userId: session.userId,
      },
    });

    await createActivityLog({
      activityType: "TODO_CREATED",
      description: "created this todo",
      userId: session.userId,
      todoId: todo.id,
      listId: todo.listId || undefined,
    });

    const recipients = await getNotificationRecipients(
      todo.listId,
      session.userId,
    );
    for (const recipientId of recipients) {
      await createNotification({
        type: "TODO_CREATED",
        message: `${session.email} created a new todo: "${todo.title}"`,
        userId: recipientId,
        todoId: todo.id,
        listId: todo.listId || undefined,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return { success: true, todo };
  } catch (error) {
    console.error("Create todo error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create todo",
    };
  }
}

export async function getTodos(filters?: {
  status?: TodoStatus;
  listId?: string | null;
  search?: string;
  priority?: TodoPriority;
  dueDate?: "all" | "overdue" | "today" | "week" | "none";
}): Promise<{ success: boolean; todos?: TodoWithUser[]; error?: string }> {
  try {
    const session = await requireAuth();

    const where: Record<string, unknown> = {
      OR: [
        { userId: session.userId },
        { list: { shares: { some: { userId: session.userId } } } },
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.listId !== undefined) {
      where.listId = filters.listId;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.search?.trim()) {
      where.AND = [
        {
          OR: [
            { title: { contains: filters.search.trim() } },
            { description: { contains: filters.search.trim() } },
          ],
        },
      ];
    }

    if (filters?.dueDate && filters.dueDate !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      if (filters.dueDate === "overdue") {
        where.dueDate = { lt: today, not: null };
      } else if (filters.dueDate === "today") {
        where.dueDate = { gte: today, lt: tomorrow };
      } else if (filters.dueDate === "week") {
        where.dueDate = { gte: today, lt: weekEnd };
      } else if (filters.dueDate === "none") {
        where.dueDate = null;
      }
    }

    const todos = await prisma.todo.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, todos };
  } catch (error) {
    console.error("Get todos error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todos",
    };
  }
}

export async function getTodo(
  id: string,
): Promise<{ success: boolean; todo?: TodoWithUser; error?: string }> {
  try {
    const session = await requireAuth();

    const todo = await prisma.todo.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    return { success: true, todo };
  } catch (error) {
    console.error("Get todo error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todo",
    };
  }
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput,
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.todo.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!existing) {
      return { success: false, error: "Todo not found" };
    }

    if (input.title !== undefined && !input.title?.trim()) {
      return { success: false, error: "Title cannot be empty" };
    }

    const data: {
      title?: string;
      description?: string | null;
      status?: TodoStatus;
      listId?: string | null;
      dueDate?: Date | null;
      priority?: TodoPriority;
      recurrencePattern?: RecurrencePattern;
      recurrenceType?: import("@/generated/prisma").RecurrenceType;
      recurrenceInterval?: number | null;
      recurrenceDaysOfWeek?: string | null;
      recurrenceDayOfMonth?: number | null;
      recurrenceWeekOfMonth?: number | null;
      recurrenceMonthDay?: string | null;
      recurrenceEndDate?: Date | null;
    } = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined)
      data.description = input.description?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.listId !== undefined) data.listId = input.listId;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate;
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
    if (input.recurrenceEndDate !== undefined)
      data.recurrenceEndDate = input.recurrenceEndDate;

    const todo = await prisma.todo.update({
      where: { id },
      data,
    });

    if (input.status && input.status !== existing.status) {
      await createActivityLog({
        activityType: "TODO_STATUS_CHANGED",
        description: `changed status from ${existing.status} to ${input.status}`,
        metadata: {
          oldStatus: existing.status,
          newStatus: input.status,
        },
        userId: session.userId,
        todoId: todo.id,
        listId: todo.listId || undefined,
      });
    }

    if (input.priority && input.priority !== existing.priority) {
      await createActivityLog({
        activityType: "TODO_PRIORITY_CHANGED",
        description: `changed priority from ${existing.priority} to ${input.priority}`,
        metadata: {
          oldPriority: existing.priority,
          newPriority: input.priority,
        },
        userId: session.userId,
        todoId: todo.id,
        listId: todo.listId || undefined,
      });
    }

    if (input.listId !== undefined && input.listId !== existing.listId) {
      if (existing.listId === null && input.listId !== null) {
        const list = await prisma.list.findUnique({
          where: { id: input.listId },
        });
        await createActivityLog({
          activityType: "TODO_ASSIGNED_TO_LIST",
          description: `assigned to list "${list?.name || input.listId}"`,
          metadata: {
            listName: list?.name || input.listId,
          },
          userId: session.userId,
          todoId: todo.id,
          listId: input.listId,
        });
      } else if (existing.listId !== null) {
        const oldList = await prisma.list.findUnique({
          where: { id: existing.listId },
        });
        const newList = input.listId
          ? await prisma.list.findUnique({ where: { id: input.listId } })
          : null;
        await createActivityLog({
          activityType: "TODO_MOVED_TO_LIST",
          description: `moved from "${oldList?.name || existing.listId}" to "${newList?.name || "no list"}"`,
          metadata: {
            oldListName: oldList?.name || existing.listId,
            newListName: newList?.name || "no list",
          },
          userId: session.userId,
          todoId: todo.id,
          listId: input.listId || undefined,
        });
      }
    }

    if (
      input.title !== undefined ||
      input.description !== undefined ||
      input.dueDate !== undefined ||
      input.recurrencePattern !== undefined
    ) {
      const changes: string[] = [];
      if (input.title !== undefined && input.title !== existing.title) {
        changes.push("title");
      }
      if (
        input.description !== undefined &&
        input.description !== existing.description
      ) {
        changes.push("description");
      }
      if (input.dueDate !== undefined) {
        changes.push("due date");
      }
      if (
        input.recurrencePattern !== undefined &&
        input.recurrencePattern !== existing.recurrencePattern
      ) {
        changes.push("recurrence");
      }
      if (changes.length > 0) {
        await createActivityLog({
          activityType: "TODO_UPDATED",
          description: `updated ${changes.join(", ")}`,
          metadata: { fields: changes },
          userId: session.userId,
          todoId: todo.id,
          listId: todo.listId || undefined,
        });
      }
    }

    if (
      input.status &&
      (input.status === "DONE" || input.status === "CANCELLED") &&
      existing.status !== "DONE" &&
      existing.status !== "CANCELLED"
    ) {
      await createNextRecurringInstance(todo);
    }

    const notificationRecipients = new Set<string>();
    if (existing.userId !== session.userId) {
      notificationRecipients.add(existing.userId);
    }
    const listRecipients = await getNotificationRecipients(
      todo.listId,
      session.userId,
    );
    for (const recipientId of listRecipients) {
      notificationRecipients.add(recipientId);
    }

    for (const recipientId of Array.from(notificationRecipients)) {
      await createNotification({
        type: "TODO_UPDATED",
        message: `${session.email} updated todo: "${todo.title}"`,
        userId: recipientId,
        todoId: todo.id,
        listId: todo.listId || undefined,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return { success: true, todo };
  } catch (error) {
    console.error("Update todo error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update todo",
    };
  }
}

export async function deleteTodo(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const existing = await prisma.todo.findFirst({
      where: {
        id,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!existing) {
      return { success: false, error: "Todo not found" };
    }

    const notificationRecipients = new Set<string>();
    if (existing.userId !== session.userId) {
      notificationRecipients.add(existing.userId);
    }
    const listRecipients = await getNotificationRecipients(
      existing.listId,
      session.userId,
    );
    for (const recipientId of listRecipients) {
      notificationRecipients.add(recipientId);
    }

    await createActivityLog({
      activityType: "TODO_DELETED",
      description: "deleted this todo",
      metadata: { todoTitle: existing.title },
      userId: session.userId,
      todoId: existing.id,
      listId: existing.listId || undefined,
    });

    await prisma.todo.delete({
      where: { id },
    });

    for (const recipientId of Array.from(notificationRecipients)) {
      await createNotification({
        type: "TODO_DELETED",
        message: `${session.email} deleted todo: "${existing.title}"`,
        userId: recipientId,
        listId: existing.listId || undefined,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete todo error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
}

export async function batchUpdateTodos(
  todoIds: string[],
  updates: UpdateTodoInput,
): Promise<BatchUpdateResult> {
  try {
    const session = await requireAuth();

    if (!todoIds || todoIds.length === 0) {
      return {
        success: false,
        updatedCount: 0,
        failedIds: [],
        error: "No todos specified",
      };
    }

    const todos = await prisma.todo.findMany({
      where: {
        id: { in: todoIds },
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    const failedIds = todoIds.filter(
      (id) => !todos.find((todo) => todo.id === id),
    );

    if (todos.length === 0) {
      return {
        success: false,
        updatedCount: 0,
        failedIds,
        error: "No accessible todos found",
      };
    }

    if (updates.title !== undefined && !updates.title?.trim()) {
      return {
        success: false,
        updatedCount: 0,
        failedIds: todoIds,
        error: "Title cannot be empty",
      };
    }

    const data: Record<string, unknown> = {};
    if (updates.title !== undefined) data.title = updates.title.trim();
    if (updates.description !== undefined)
      data.description = updates.description?.trim() || null;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.listId !== undefined) data.listId = updates.listId;
    if (updates.dueDate !== undefined) data.dueDate = updates.dueDate;
    if (updates.priority !== undefined) data.priority = updates.priority;
    if (updates.recurrencePattern !== undefined)
      data.recurrencePattern = updates.recurrencePattern;
    if (updates.recurrenceType !== undefined)
      data.recurrenceType = updates.recurrenceType;
    if (updates.recurrenceInterval !== undefined)
      data.recurrenceInterval = updates.recurrenceInterval;
    if (updates.recurrenceDaysOfWeek !== undefined)
      data.recurrenceDaysOfWeek = updates.recurrenceDaysOfWeek;
    if (updates.recurrenceDayOfMonth !== undefined)
      data.recurrenceDayOfMonth = updates.recurrenceDayOfMonth;
    if (updates.recurrenceWeekOfMonth !== undefined)
      data.recurrenceWeekOfMonth = updates.recurrenceWeekOfMonth;
    if (updates.recurrenceMonthDay !== undefined)
      data.recurrenceMonthDay = updates.recurrenceMonthDay;
    if (updates.recurrenceEndDate !== undefined)
      data.recurrenceEndDate = updates.recurrenceEndDate;

    const updatedTodos = await prisma.todo.updateMany({
      where: { id: { in: todos.map((t) => t.id) } },
      data,
    });

    await createActivityLog({
      activityType: "BATCH_UPDATE",
      description: `updated ${todos.length} todo${todos.length > 1 ? "s" : ""}`,
      metadata: {
        count: todos.length,
        updates: Object.keys(updates),
      },
      userId: session.userId,
    });

    if (
      updates.status &&
      (updates.status === "DONE" || updates.status === "CANCELLED")
    ) {
      for (const todo of todos) {
        if (todo.status !== "DONE" && todo.status !== "CANCELLED") {
          const updated = await prisma.todo.findUnique({
            where: { id: todo.id },
          });
          if (updated) {
            await createNextRecurringInstance(updated);
          }
        }
      }
    }

    const allRecipients = new Set<string>();
    for (const todo of todos) {
      if (todo.userId !== session.userId) {
        allRecipients.add(todo.userId);
      }
      const listRecipients = await getNotificationRecipients(
        todo.listId,
        session.userId,
      );
      for (const recipientId of listRecipients) {
        allRecipients.add(recipientId);
      }
    }

    for (const recipientId of Array.from(allRecipients)) {
      await createNotification({
        type: "TODO_UPDATED",
        message: `${session.email} updated ${todos.length} todo${todos.length > 1 ? "s" : ""}`,
        userId: recipientId,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      updatedCount: updatedTodos.count,
      failedIds,
    };
  } catch (error) {
    console.error("Batch update todos error:", error);
    return {
      success: false,
      updatedCount: 0,
      failedIds: todoIds,
      error: error instanceof Error ? error.message : "Failed to update todos",
    };
  }
}

export async function batchDeleteTodos(
  todoIds: string[],
): Promise<BatchDeleteResult> {
  try {
    const session = await requireAuth();

    if (!todoIds || todoIds.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        failedIds: [],
        error: "No todos specified",
      };
    }

    const todos = await prisma.todo.findMany({
      where: {
        id: { in: todoIds },
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    const failedIds = todoIds.filter(
      (id) => !todos.find((todo) => todo.id === id),
    );

    if (todos.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        failedIds,
        error: "No accessible todos found",
      };
    }

    const allRecipients = new Set<string>();
    for (const todo of todos) {
      if (todo.userId !== session.userId) {
        allRecipients.add(todo.userId);
      }
      const listRecipients = await getNotificationRecipients(
        todo.listId,
        session.userId,
      );
      for (const recipientId of listRecipients) {
        allRecipients.add(recipientId);
      }
    }

    await createActivityLog({
      activityType: "BATCH_DELETE",
      description: `deleted ${todos.length} todo${todos.length > 1 ? "s" : ""}`,
      metadata: {
        count: todos.length,
      },
      userId: session.userId,
    });

    const result = await prisma.todo.deleteMany({
      where: { id: { in: todos.map((t) => t.id) } },
    });

    for (const recipientId of Array.from(allRecipients)) {
      await createNotification({
        type: "TODO_DELETED",
        message: `${session.email} deleted ${todos.length} todo${todos.length > 1 ? "s" : ""}`,
        userId: recipientId,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      deletedCount: result.count,
      failedIds,
    };
  } catch (error) {
    console.error("Batch delete todos error:", error);
    return {
      success: false,
      deletedCount: 0,
      failedIds: todoIds,
      error: error instanceof Error ? error.message : "Failed to delete todos",
    };
  }
}

export async function updateTodoStatus(
  id: string,
  status: TodoStatus,
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  return updateTodo(id, { status });
}

export interface TodoDependency {
  id: string;
  todoId: string;
  dependsOnTodoId: string;
  createdAt: Date;
  todo: {
    id: string;
    title: string;
    status: TodoStatus;
    user: {
      email: string;
    };
  };
  dependsOnTodo: {
    id: string;
    title: string;
    status: TodoStatus;
    user: {
      email: string;
    };
  };
}

export interface TodoWithDependencies {
  blockedBy: TodoDependency[];
  blocking: TodoDependency[];
}

async function detectCircularDependency(
  todoId: string,
  dependsOnTodoId: string,
): Promise<boolean> {
  const visited = new Set<string>();
  const stack = [dependsOnTodoId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    if (currentId === todoId) {
      return true;
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    const dependencies = await prisma.todoDependency.findMany({
      where: { todoId: currentId },
      select: { dependsOnTodoId: true },
    });

    for (const dep of dependencies) {
      stack.push(dep.dependsOnTodoId);
    }
  }

  return false;
}

export async function addTodoDependency(
  todoId: string,
  dependsOnTodoId: string,
): Promise<{ success: boolean; dependency?: TodoDependency; error?: string }> {
  try {
    const session = await requireAuth();

    if (todoId === dependsOnTodoId) {
      return {
        success: false,
        error: "A todo cannot depend on itself",
      };
    }

    const hasCircularDependency = await detectCircularDependency(
      todoId,
      dependsOnTodoId,
    );

    if (hasCircularDependency) {
      return {
        success: false,
        error:
          "Cannot add dependency: This would create a circular dependency chain",
      };
    }

    const [todo, dependsOnTodo] = await Promise.all([
      prisma.todo.findFirst({
        where: {
          id: todoId,
          OR: [
            { userId: session.userId },
            { list: { shares: { some: { userId: session.userId } } } },
          ],
        },
      }),
      prisma.todo.findFirst({
        where: {
          id: dependsOnTodoId,
          OR: [
            { userId: session.userId },
            { list: { shares: { some: { userId: session.userId } } } },
          ],
        },
      }),
    ]);

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    if (!dependsOnTodo) {
      return { success: false, error: "Dependency todo not found" };
    }

    const existing = await prisma.todoDependency.findFirst({
      where: {
        todoId,
        dependsOnTodoId,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Dependency already exists",
      };
    }

    const dependency = await prisma.todoDependency.create({
      data: {
        todoId,
        dependsOnTodoId,
      },
      include: {
        todo: {
          select: {
            id: true,
            title: true,
            status: true,
            user: { select: { email: true } },
          },
        },
        dependsOnTodo: {
          select: {
            id: true,
            title: true,
            status: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    await createActivityLog({
      activityType: "DEPENDENCY_ADDED",
      description: `added dependency: blocked by "${dependsOnTodo.title}"`,
      metadata: {
        dependsOnTodoId,
        dependsOnTodoTitle: dependsOnTodo.title,
      },
      userId: session.userId,
      todoId: todo.id,
      listId: todo.listId || undefined,
    });

    const notificationRecipients = new Set<string>();
    if (todo.userId !== session.userId) {
      notificationRecipients.add(todo.userId);
    }
    if (dependsOnTodo.userId !== session.userId) {
      notificationRecipients.add(dependsOnTodo.userId);
    }

    const todoListRecipients = await getNotificationRecipients(
      todo.listId,
      session.userId,
    );
    for (const recipientId of todoListRecipients) {
      notificationRecipients.add(recipientId);
    }

    const dependsOnListRecipients = await getNotificationRecipients(
      dependsOnTodo.listId,
      session.userId,
    );
    for (const recipientId of dependsOnListRecipients) {
      notificationRecipients.add(recipientId);
    }

    for (const recipientId of Array.from(notificationRecipients)) {
      await createNotification({
        type: "TODO_UPDATED",
        message: `${session.email} added a dependency: "${todo.title}" is blocked by "${dependsOnTodo.title}"`,
        userId: recipientId,
        todoId: todo.id,
        listId: todo.listId || undefined,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return { success: true, dependency };
  } catch (error) {
    console.error("Add todo dependency error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add dependency",
    };
  }
}

export async function removeTodoDependency(
  todoId: string,
  dependsOnTodoId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const dependency = await prisma.todoDependency.findFirst({
      where: {
        todoId,
        dependsOnTodoId,
      },
      include: {
        todo: {
          select: {
            id: true,
            title: true,
            listId: true,
            userId: true,
          },
        },
        dependsOnTodo: {
          select: {
            id: true,
            title: true,
            listId: true,
            userId: true,
          },
        },
      },
    });

    if (!dependency) {
      return { success: false, error: "Dependency not found" };
    }

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
    });

    if (!todo) {
      return { success: false, error: "Todo not found or access denied" };
    }

    await createActivityLog({
      activityType: "DEPENDENCY_REMOVED",
      description: `removed dependency: no longer blocked by "${dependency.dependsOnTodo.title}"`,
      metadata: {
        dependsOnTodoId,
        dependsOnTodoTitle: dependency.dependsOnTodo.title,
      },
      userId: session.userId,
      todoId: todo.id,
      listId: todo.listId || undefined,
    });

    await prisma.todoDependency.delete({
      where: { id: dependency.id },
    });

    const notificationRecipients = new Set<string>();
    if (dependency.todo.userId !== session.userId) {
      notificationRecipients.add(dependency.todo.userId);
    }
    if (dependency.dependsOnTodo.userId !== session.userId) {
      notificationRecipients.add(dependency.dependsOnTodo.userId);
    }

    const todoListRecipients = await getNotificationRecipients(
      dependency.todo.listId,
      session.userId,
    );
    for (const recipientId of todoListRecipients) {
      notificationRecipients.add(recipientId);
    }

    const dependsOnListRecipients = await getNotificationRecipients(
      dependency.dependsOnTodo.listId,
      session.userId,
    );
    for (const recipientId of dependsOnListRecipients) {
      notificationRecipients.add(recipientId);
    }

    for (const recipientId of Array.from(notificationRecipients)) {
      await createNotification({
        type: "TODO_UPDATED",
        message: `${session.email} removed a dependency: "${dependency.todo.title}" is no longer blocked by "${dependency.dependsOnTodo.title}"`,
        userId: recipientId,
        todoId: todo.id,
        listId: todo.listId || undefined,
        actorId: session.userId,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Remove todo dependency error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove dependency",
    };
  }
}

export async function getTodoDependencies(todoId: string): Promise<{
  success: boolean;
  dependencies?: TodoWithDependencies;
  error?: string;
}> {
  try {
    const session = await requireAuth();

    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        OR: [
          { userId: session.userId },
          { list: { shares: { some: { userId: session.userId } } } },
        ],
      },
      include: {
        blockedBy: {
          include: {
            dependsOnTodo: {
              select: {
                id: true,
                title: true,
                status: true,
                user: { select: { email: true } },
              },
            },
            todo: {
              select: {
                id: true,
                title: true,
                status: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        blocking: {
          include: {
            todo: {
              select: {
                id: true,
                title: true,
                status: true,
                user: { select: { email: true } },
              },
            },
            dependsOnTodo: {
              select: {
                id: true,
                title: true,
                status: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    if (!todo) {
      return { success: false, error: "Todo not found" };
    }

    return {
      success: true,
      dependencies: {
        blockedBy: todo.blockedBy,
        blocking: todo.blocking,
      },
    };
  } catch (error) {
    console.error("Get todo dependencies error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch dependencies",
    };
  }
}

export interface TodoNodeData extends Record<string, unknown> {
  id: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: Date | null;
  listId: string | null;
  listName: string | null;
  userId: string;
  userName: string | null;
  userEmail: string;
}

export interface DependencyGraphData {
  nodes: TodoNodeData[];
  edges: Array<{
    source: string;
    target: string;
  }>;
}

export async function getDependencyGraph(filters?: {
  listId?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
}): Promise<{
  success: boolean;
  data?: DependencyGraphData;
  error?: string;
}> {
  try {
    const session = await requireAuth();

    const whereClause: {
      OR: Array<{
        userId?: string;
        list?: { shares?: { some?: { userId?: string } } };
      }>;
      listId?: string;
      status?: TodoStatus;
      priority?: TodoPriority;
    } = {
      OR: [
        { userId: session.userId },
        { list: { shares: { some: { userId: session.userId } } } },
      ],
    };

    if (filters?.listId) {
      whereClause.listId = filters.listId;
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.priority) {
      whereClause.priority = filters.priority;
    }

    const todos = await prisma.todo.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        list: {
          select: {
            name: true,
          },
        },
        blockedBy: {
          select: {
            dependsOnTodoId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nodes: TodoNodeData[] = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate,
      listId: todo.listId,
      listName: todo.list?.name || null,
      userId: todo.userId,
      userName: todo.user.name,
      userEmail: todo.user.email,
    }));

    const edges: Array<{ source: string; target: string }> = [];
    for (const todo of todos) {
      for (const dep of todo.blockedBy) {
        edges.push({
          source: dep.dependsOnTodoId,
          target: todo.id,
        });
      }
    }

    return {
      success: true,
      data: {
        nodes,
        edges,
      },
    };
  } catch (error) {
    console.error("Get dependency graph error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch dependency graph",
    };
  }
}
