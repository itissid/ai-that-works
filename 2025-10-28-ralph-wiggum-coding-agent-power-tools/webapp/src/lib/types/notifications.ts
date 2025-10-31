import type { Notification, NotificationType } from "@/generated/prisma";

export type { Notification, NotificationType };

export interface NotificationResult {
  success: boolean;
  notification?: Notification;
  error?: string;
}

export interface NotificationsResult {
  success: boolean;
  notifications?: Notification[];
  error?: string;
}

export interface UnreadCountResult {
  success: boolean;
  count?: number;
  error?: string;
}
