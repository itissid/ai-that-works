import { config } from "@/lib/config";
import { sendNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import type {
  NotificationResult,
  NotificationsResult,
  NotificationType,
  UnreadCountResult,
} from "./types/notifications";

interface CreateNotificationInput {
  type: NotificationType;
  message: string;
  userId: string;
  todoId?: string;
  listId?: string;
  actorId?: string;
}

function buildActionUrl(todoId?: string, listId?: string): string {
  if (todoId) {
    return `${config.app.url}/todos/${todoId}`;
  }
  if (listId) {
    return `${config.app.url}/lists/${listId}`;
  }
  return config.app.url;
}

export async function createNotification(
  data: CreateNotificationInput,
): Promise<NotificationResult> {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        ...(data.todoId && { todoId: data.todoId }),
        ...(data.listId && { listId: data.listId }),
        ...(data.actorId && { actorId: data.actorId }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        todo: true,
        list: true,
      },
    });

    const actionUrl = buildActionUrl(data.todoId, data.listId);
    sendNotificationEmail(
      notification.user.email,
      data.type,
      data.message,
      actionUrl,
    ).catch((error) => {
      console.error("Error sending notification email:", error);
    });

    return { success: true, notification };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create notification",
    };
  }
}

export async function getNotifications(
  userId: string,
): Promise<NotificationsResult> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        todo: true,
        list: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, notifications };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get notifications",
    };
  }
}

export async function getUnreadCount(
  userId: string,
): Promise<UnreadCountResult> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { success: true, count };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get unread count",
    };
  }
}

export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<NotificationResult> {
  try {
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Notification not found or unauthorized",
      };
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        todo: true,
        list: true,
      },
    });

    return { success: true, notification };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}

export async function markAllAsRead(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark all as read",
    };
  }
}
