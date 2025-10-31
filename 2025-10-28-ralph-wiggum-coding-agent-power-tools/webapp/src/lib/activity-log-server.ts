"use server";

import type { ActivityType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface CreateActivityLogInput {
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  userId: string;
  todoId?: string;
  listId?: string;
}

export interface ActivityLogWithRelations {
  id: string;
  activityType: ActivityType;
  description: string;
  metadata: string | null;
  userId: string;
  todoId: string | null;
  listId: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  todo?: {
    id: string;
    title: string;
  } | null;
  list?: {
    id: string;
    name: string;
  } | null;
}

export async function createActivityLog(
  input: CreateActivityLogInput,
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        activityType: input.activityType,
        description: input.description,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        userId: input.userId,
        todoId: input.todoId,
        listId: input.listId,
      },
    });
  } catch (error) {
    console.error("Failed to create activity log:", error);
  }
}

export async function getActivityLogsForTodo(
  todoId: string,
  limit = 50,
): Promise<ActivityLogWithRelations[]> {
  const logs = await prisma.activityLog.findMany({
    where: { todoId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      todo: {
        select: {
          id: true,
          title: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs;
}

export async function getActivityLogsForList(
  listId: string,
  limit = 50,
): Promise<ActivityLogWithRelations[]> {
  const logs = await prisma.activityLog.findMany({
    where: { listId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      todo: {
        select: {
          id: true,
          title: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs;
}

export async function getActivityLogsForUser(
  userId: string,
  limit = 50,
): Promise<ActivityLogWithRelations[]> {
  const logs = await prisma.activityLog.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      todo: {
        select: {
          id: true,
          title: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs;
}

export async function getRecentActivityLogs(
  limit = 100,
): Promise<ActivityLogWithRelations[]> {
  const logs = await prisma.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      todo: {
        select: {
          id: true,
          title: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs;
}
