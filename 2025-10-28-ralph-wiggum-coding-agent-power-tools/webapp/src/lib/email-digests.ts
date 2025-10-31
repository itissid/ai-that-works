import { Resend } from "resend";
import { config } from "./config";
import type { Notification, NotificationType } from "./types/notifications";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(config.email.resendApiKey);
  }
  return resend;
}

export interface GroupedNotifications {
  TODO_CREATED: Notification[];
  TODO_UPDATED: Notification[];
  TODO_DELETED: Notification[];
  TODO_COMMENTED: Notification[];
  TODO_REACTED: Notification[];
  LIST_SHARED: Notification[];
}

function groupNotificationsByType(
  notifications: Notification[],
): GroupedNotifications {
  const grouped: GroupedNotifications = {
    TODO_CREATED: [],
    TODO_UPDATED: [],
    TODO_DELETED: [],
    TODO_COMMENTED: [],
    TODO_REACTED: [],
    LIST_SHARED: [],
  };

  for (const notification of notifications) {
    grouped[notification.type].push(notification);
  }

  return grouped;
}

function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    TODO_CREATED: "New Todos",
    TODO_UPDATED: "Updated Todos",
    TODO_DELETED: "Deleted Todos",
    TODO_COMMENTED: "New Comments",
    TODO_REACTED: "New Reactions",
    LIST_SHARED: "Shared Lists",
  };
  return labels[type];
}

function getNotificationTypeColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    TODO_CREATED: "#28a745",
    TODO_UPDATED: "#17a2b8",
    TODO_DELETED: "#dc3545",
    TODO_COMMENTED: "#ffc107",
    TODO_REACTED: "#e83e8c",
    LIST_SHARED: "#007bff",
  };
  return colors[type];
}

function getSummaryStats(grouped: GroupedNotifications): string[] {
  const stats: string[] = [];

  if (grouped.TODO_CREATED.length > 0) {
    stats.push(
      `${grouped.TODO_CREATED.length} new todo${grouped.TODO_CREATED.length > 1 ? "s" : ""}`,
    );
  }
  if (grouped.TODO_COMMENTED.length > 0) {
    stats.push(
      `${grouped.TODO_COMMENTED.length} comment${grouped.TODO_COMMENTED.length > 1 ? "s" : ""}`,
    );
  }
  if (grouped.TODO_REACTED.length > 0) {
    stats.push(
      `${grouped.TODO_REACTED.length} reaction${grouped.TODO_REACTED.length > 1 ? "s" : ""}`,
    );
  }
  if (grouped.TODO_UPDATED.length > 0) {
    stats.push(
      `${grouped.TODO_UPDATED.length} update${grouped.TODO_UPDATED.length > 1 ? "s" : ""}`,
    );
  }
  if (grouped.TODO_DELETED.length > 0) {
    stats.push(
      `${grouped.TODO_DELETED.length} deletion${grouped.TODO_DELETED.length > 1 ? "s" : ""}`,
    );
  }
  if (grouped.LIST_SHARED.length > 0) {
    stats.push(
      `${grouped.LIST_SHARED.length} shared list${grouped.LIST_SHARED.length > 1 ? "s" : ""}`,
    );
  }

  return stats;
}

function buildNotificationSectionHtml(
  type: NotificationType,
  notifications: Notification[],
): string {
  if (notifications.length === 0) {
    return "";
  }

  const color = getNotificationTypeColor(type);
  const label = getNotificationTypeLabel(type);

  const notificationItems = notifications
    .map(
      (notification) => `
        <div style="background-color: #fff; border-left: 4px solid ${color}; padding: 15px; margin: 10px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333; font-size: 15px;">${notification.message}</p>
          <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      `,
    )
    .join("");

  return `
    <div style="margin: 30px 0;">
      <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${color};">
        ${label} (${notifications.length})
      </h2>
      ${notificationItems}
    </div>
  `;
}

export function getDigestEmailHtml(
  frequency: "DAILY" | "WEEKLY",
  notifications: GroupedNotifications,
): string {
  const title =
    frequency === "DAILY" ? "Your Daily Digest" : "Your Weekly Digest";
  const stats = getSummaryStats(notifications);
  const statsText =
    stats.length > 0 ? `You have ${stats.join(", ")}` : "No new notifications";

  const sections = [
    buildNotificationSectionHtml("TODO_CREATED", notifications.TODO_CREATED),
    buildNotificationSectionHtml(
      "TODO_COMMENTED",
      notifications.TODO_COMMENTED,
    ),
    buildNotificationSectionHtml("TODO_REACTED", notifications.TODO_REACTED),
    buildNotificationSectionHtml("TODO_UPDATED", notifications.TODO_UPDATED),
    buildNotificationSectionHtml("TODO_DELETED", notifications.TODO_DELETED),
    buildNotificationSectionHtml("LIST_SHARED", notifications.LIST_SHARED),
  ].join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">${title}</h1>
          <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">${statsText}</p>
          </div>
          ${sections}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.app.url}/notifications"
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View All Notifications
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this digest because you have ${frequency.toLowerCase()} notifications enabled in your preferences.
          </p>
        </div>
      </body>
    </html>
  `;
}

function buildNotificationSectionText(
  type: NotificationType,
  notifications: Notification[],
): string {
  if (notifications.length === 0) {
    return "";
  }

  const label = getNotificationTypeLabel(type);
  const notificationItems = notifications
    .map(
      (notification) =>
        `  - ${notification.message} (${new Date(notification.createdAt).toLocaleString()})`,
    )
    .join("\n");

  return `\n${label} (${notifications.length}):\n${notificationItems}\n`;
}

export function getDigestEmailText(
  frequency: "DAILY" | "WEEKLY",
  notifications: GroupedNotifications,
): string {
  const title =
    frequency === "DAILY" ? "Your Daily Digest" : "Your Weekly Digest";
  const stats = getSummaryStats(notifications);
  const statsText =
    stats.length > 0 ? `You have ${stats.join(", ")}` : "No new notifications";

  const sections = [
    buildNotificationSectionText("TODO_CREATED", notifications.TODO_CREATED),
    buildNotificationSectionText(
      "TODO_COMMENTED",
      notifications.TODO_COMMENTED,
    ),
    buildNotificationSectionText("TODO_REACTED", notifications.TODO_REACTED),
    buildNotificationSectionText("TODO_UPDATED", notifications.TODO_UPDATED),
    buildNotificationSectionText("TODO_DELETED", notifications.TODO_DELETED),
    buildNotificationSectionText("LIST_SHARED", notifications.LIST_SHARED),
  ]
    .filter((section) => section.length > 0)
    .join("\n");

  return `
${title}
${"=".repeat(title.length)}

${statsText}

${sections}

View all notifications: ${config.app.url}/notifications

You received this digest because you have ${frequency.toLowerCase()} notifications enabled in your preferences.
  `.trim();
}

export async function sendDigestEmail(
  userEmail: string,
  frequency: "DAILY" | "WEEKLY",
  notifications: Notification[],
): Promise<boolean> {
  if (notifications.length === 0) {
    return true;
  }

  const grouped = groupNotificationsByType(notifications);
  const subject =
    frequency === "DAILY"
      ? "Your Daily Todo Digest"
      : "Your Weekly Todo Digest";

  if (config.app.env === "development") {
    console.log(
      `\n${frequency} Digest email for ${userEmail}:\n${notifications.length} notifications\n`,
    );
    console.log(getDigestEmailText(frequency, grouped));
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: userEmail,
      subject,
      text: getDigestEmailText(frequency, grouped),
      html: getDigestEmailHtml(frequency, grouped),
    });
    return true;
  } catch (error) {
    console.error("Failed to send digest email:", error);
    return false;
  }
}
