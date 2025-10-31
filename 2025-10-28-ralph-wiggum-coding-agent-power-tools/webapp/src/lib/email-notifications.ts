import { Resend } from "resend";
import type { EmailNotificationFrequency } from "@/generated/prisma";
import { config } from "./config";
import { prisma } from "./prisma";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(config.email.resendApiKey);
  }
  return resend;
}

// TODO_CREATED notification templates
function getTodoCreatedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Todo Created</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">New Todo Created</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> created a new todo:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Todo
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this notification because you're a member of a shared todo list.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTodoCreatedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
New Todo Created

${actorEmail} created a new todo:

${message}

View it here: ${actionUrl}

You received this notification because you're a member of a shared todo list.
  `.trim();
}

// TODO_UPDATED notification templates
function getTodoUpdatedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo Updated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">Todo Updated</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> updated a todo:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #17a2b8; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Todo
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this notification because you're a member of a shared todo list.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTodoUpdatedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
Todo Updated

${actorEmail} updated a todo:

${message}

View it here: ${actionUrl}

You received this notification because you're a member of a shared todo list.
  `.trim();
}

// TODO_DELETED notification templates
function getTodoDeletedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo Deleted</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">Todo Deleted</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> deleted a todo:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #dc3545; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View List
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this notification because you're a member of a shared todo list.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTodoDeletedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
Todo Deleted

${actorEmail} deleted a todo:

${message}

View the list here: ${actionUrl}

You received this notification because you're a member of a shared todo list.
  `.trim();
}

// TODO_COMMENTED notification templates
function getTodoCommentedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Comment on Todo</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">New Comment on Todo</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> commented on a todo:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #ffc107; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Comment
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this notification because you're watching this todo.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTodoCommentedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
New Comment on Todo

${actorEmail} commented on a todo:

${message}

View the comment here: ${actionUrl}

You received this notification because you're watching this todo.
  `.trim();
}

// TODO_REACTED notification templates
function getTodoReactedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Reaction on Todo</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">New Reaction on Todo</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> reacted to a todo:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #e83e8c; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #e83e8c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Reactions
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this notification because you're watching this todo.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTodoReactedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
New Reaction on Todo

${actorEmail} reacted to a todo:

${message}

View the reactions here: ${actionUrl}

You received this notification because you're watching this todo.
  `.trim();
}

// LIST_SHARED notification templates
function getListSharedHtml(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Todo List Shared With You</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">Todo List Shared With You</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${actorEmail}</strong> shared a todo list with you:
          </p>
          <div style="background-color: #fff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 15px;">${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Open List
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You can now collaborate on this todo list with other members.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getListSharedText(
  actorEmail: string,
  message: string,
  actionUrl: string,
): string {
  return `
Todo List Shared With You

${actorEmail} shared a todo list with you:

${message}

Access it here: ${actionUrl}

You can now collaborate on this todo list with other members.
  `.trim();
}

// Export send functions for each notification type
export async function sendTodoCreatedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nTodo Created notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `New Todo Created by ${actorEmail}`,
      text: getTodoCreatedText(actorEmail, message, actionUrl),
      html: getTodoCreatedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send todo created notification:", error);
    return false;
  }
}

export async function sendTodoUpdatedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nTodo Updated notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `Todo Updated by ${actorEmail}`,
      text: getTodoUpdatedText(actorEmail, message, actionUrl),
      html: getTodoUpdatedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send todo updated notification:", error);
    return false;
  }
}

export async function sendTodoDeletedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nTodo Deleted notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `Todo Deleted by ${actorEmail}`,
      text: getTodoDeletedText(actorEmail, message, actionUrl),
      html: getTodoDeletedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send todo deleted notification:", error);
    return false;
  }
}

export async function sendTodoCommentedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nTodo Commented notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `New Comment from ${actorEmail}`,
      text: getTodoCommentedText(actorEmail, message, actionUrl),
      html: getTodoCommentedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send todo commented notification:", error);
    return false;
  }
}

export async function sendTodoReactedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nTodo Reacted notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `New Reaction from ${actorEmail}`,
      text: getTodoReactedText(actorEmail, message, actionUrl),
      html: getTodoReactedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send todo reacted notification:", error);
    return false;
  }
}

export async function sendListSharedNotification(
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  if (config.app.env === "development") {
    console.log(`\nList Shared notification for ${email}:\n${actionUrl}\n`);
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `${actorEmail} Shared a Todo List With You`,
      text: getListSharedText(actorEmail, message, actionUrl),
      html: getListSharedHtml(actorEmail, message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send list shared notification:", error);
    return false;
  }
}

// Generic notification sender for dynamic notification types
export async function sendNotification(
  notificationType:
    | "TODO_CREATED"
    | "TODO_UPDATED"
    | "TODO_DELETED"
    | "TODO_COMMENTED"
    | "TODO_REACTED"
    | "LIST_SHARED",
  email: string,
  actorEmail: string,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  switch (notificationType) {
    case "TODO_CREATED":
      return sendTodoCreatedNotification(email, actorEmail, message, actionUrl);
    case "TODO_UPDATED":
      return sendTodoUpdatedNotification(email, actorEmail, message, actionUrl);
    case "TODO_DELETED":
      return sendTodoDeletedNotification(email, actorEmail, message, actionUrl);
    case "TODO_COMMENTED":
      return sendTodoCommentedNotification(
        email,
        actorEmail,
        message,
        actionUrl,
      );
    case "TODO_REACTED":
      return sendTodoReactedNotification(email, actorEmail, message, actionUrl);
    case "LIST_SHARED":
      return sendListSharedNotification(email, actorEmail, message, actionUrl);
    default:
      console.error(`Unknown notification type: ${notificationType}`);
      return false;
  }
}

// Digest helper functions
export function shouldSendDailyDigest(lastDigestSentAt: Date | null): boolean {
  if (!lastDigestSentAt) return true;

  const now = new Date();
  const hoursSinceLastDigest =
    (now.getTime() - lastDigestSentAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastDigest >= 24;
}

export function shouldSendWeeklyDigest(lastDigestSentAt: Date | null): boolean {
  if (!lastDigestSentAt) return true;

  const now = new Date();
  const hoursSinceLastDigest =
    (now.getTime() - lastDigestSentAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastDigest >= 168; // 7 days = 168 hours
}

export async function getUnsentDigestNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      includedInDigest: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

function getDigestEmailHtml(
  notifications: Array<{ type: string; message: string; createdAt: Date }>,
  frequency: EmailNotificationFrequency,
): string {
  const frequencyLabel = frequency === "DAILY" ? "Daily" : "Weekly";
  const notificationItems = notifications
    .map(
      (notif) => `
    <div style="background-color: #fff; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; border-radius: 4px;">
      <p style="margin: 0; color: #333; font-size: 15px;">${notif.message}</p>
      <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${new Date(notif.createdAt).toLocaleString()}</p>
    </div>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${frequencyLabel} Digest</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">Your ${frequencyLabel} Notification Digest</h1>
          <p style="font-size: 16px; color: #555;">
            You have ${notifications.length} notification${notifications.length !== 1 ? "s" : ""} from the past ${frequency === "DAILY" ? "day" : "week"}:
          </p>
          ${notificationItems}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.app.url}/notifications"
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View All Notifications
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this ${frequency.toLowerCase()} digest based on your notification preferences.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getDigestEmailText(
  notifications: Array<{ type: string; message: string; createdAt: Date }>,
  frequency: EmailNotificationFrequency,
): string {
  const frequencyLabel = frequency === "DAILY" ? "Daily" : "Weekly";
  const notificationList = notifications
    .map(
      (notif, index) =>
        `${index + 1}. ${notif.message}\n   ${new Date(notif.createdAt).toLocaleString()}`,
    )
    .join("\n\n");

  return `
Your ${frequencyLabel} Notification Digest

You have ${notifications.length} notification${notifications.length !== 1 ? "s" : ""} from the past ${frequency === "DAILY" ? "day" : "week"}:

${notificationList}

View all notifications: ${config.app.url}/notifications

You received this ${frequency.toLowerCase()} digest based on your notification preferences.
  `.trim();
}

export async function sendDigestEmail(
  email: string,
  notifications: Array<{ type: string; message: string; createdAt: Date }>,
  frequency: EmailNotificationFrequency,
): Promise<boolean> {
  if (notifications.length === 0) {
    return true;
  }

  const frequencyLabel = frequency === "DAILY" ? "Daily" : "Weekly";

  if (config.app.env === "development") {
    console.log(
      `\n${frequencyLabel} Digest for ${email}:\n${notifications.length} notifications\n`,
    );
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: `Your ${frequencyLabel} Notification Digest (${notifications.length} notification${notifications.length !== 1 ? "s" : ""})`,
      text: getDigestEmailText(notifications, frequency),
      html: getDigestEmailHtml(notifications, frequency),
    });
    return true;
  } catch (error) {
    console.error("Failed to send digest email:", error);
    return false;
  }
}

export async function markNotificationsAsDigested(
  notificationIds: string[],
): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
    },
    data: {
      includedInDigest: true,
    },
  });
}
