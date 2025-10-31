import type { Notification, NotificationType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

interface UnsentNotificationsResult {
  success: boolean;
  notifications?: Notification[];
  error?: string;
}

interface MarkDigestedResult {
  success: boolean;
  count?: number;
  error?: string;
}

interface UpdateDigestResult {
  success: boolean;
  error?: string;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

export async function getUnsentDigestNotifications(
  userId: string,
): Promise<UnsentNotificationsResult> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        includedInDigest: false,
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
        error instanceof Error
          ? error.message
          : "Failed to fetch unsent digest notifications",
    };
  }
}

export async function markNotificationsAsDigested(
  notificationIds: string[],
): Promise<MarkDigestedResult> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        includedInDigest: true,
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as digested",
    };
  }
}

export function shouldSendDailyDigest(lastDigestSentAt: Date | null): boolean {
  if (!lastDigestSentAt) {
    return true;
  }

  const now = new Date();
  const hoursSinceLastDigest =
    (now.getTime() - lastDigestSentAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastDigest >= 24;
}

export function shouldSendWeeklyDigest(lastDigestSentAt: Date | null): boolean {
  if (!lastDigestSentAt) {
    return true;
  }

  const now = new Date();
  const daysSinceLastDigest =
    (now.getTime() - lastDigestSentAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceLastDigest >= 7;
}

export async function updateLastDigestSentAt(
  userId: string,
): Promise<UpdateDigestResult> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastDigestSentAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update last digest sent timestamp",
    };
  }
}

export function groupNotificationsByType(
  notifications: Notification[],
): GroupedNotifications {
  return notifications.reduce<GroupedNotifications>((grouped, notification) => {
    const type = notification.type as NotificationType;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(notification);
    return grouped;
  }, {});
}
