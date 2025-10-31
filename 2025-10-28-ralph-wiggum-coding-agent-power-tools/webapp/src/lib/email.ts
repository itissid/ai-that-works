import { Resend } from "resend";
import { config } from "./config";
import { prisma } from "./prisma";
import type { NotificationType } from "./types/notifications";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(config.email.resendApiKey);
  }
  return resend;
}

function getMagicLinkEmailTemplate(magicLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Magic Link Login</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin-top: 0;">Sign in to your account</h1>
          <p style="font-size: 16px; color: #555;">
            Click the button below to sign in to your account. This link will expire in 15 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}"
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Sign In
            </a>
          </div>
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            Or copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #007bff; word-break: break-all; background-color: #f1f3f5; padding: 10px; border-radius: 4px;">
            ${magicLink}
          </p>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            If you didn't request this email, you can safely ignore it. Someone may have entered your email address by mistake.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getMagicLinkEmailText(magicLink: string): string {
  return `
Sign in to your account

Click the link below to sign in. This link will expire in 15 minutes.

${magicLink}

If you didn't request this email, you can safely ignore it.
  `.trim();
}

function getNotificationEmailTemplate(
  message: string,
  actionUrl: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
          <p style="font-size: 16px; color: #555;">
            ${message}
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}"
               style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View in App
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; margin-bottom: 0;">
            You received this email because you have notifications enabled in your preferences.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getNotificationEmailText(message: string, actionUrl: string): string {
  return `
${message}

View in App: ${actionUrl}

You received this email because you have notifications enabled in your preferences.
  `.trim();
}

function getNotificationEmailSubject(
  notificationType: NotificationType,
): string {
  const subjects: Record<NotificationType, string> = {
    TODO_CREATED: "New todo created",
    TODO_UPDATED: "Todo updated",
    TODO_DELETED: "Todo deleted",
    TODO_COMMENTED: "New comment on todo",
    TODO_REACTED: "New reaction on todo",
    LIST_SHARED: "List shared with you",
  };
  return subjects[notificationType] || "New notification";
}

export async function sendMagicLinkEmail(
  email: string,
  token: string,
): Promise<boolean> {
  const magicLink = `${config.app.url}/api/auth/verify?token=${token}`;

  console.log(`\nMagic link for ${email}:\n${magicLink}\n`);

  if (
    !config.email.resendApiKey ||
    !config.email.from ||
    config.email.from === "noreply@example.com"
  ) {
    console.log(
      "SET RESEND_API_KEY and RESEND_EMAIL_ADDRESS in .env to send emails via Resend\n",
    );
    return true;
  }

  try {
    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: email,
      subject: "Sign in to your account",
      text: getMagicLinkEmailText(magicLink),
      html: getMagicLinkEmailTemplate(magicLink),
    });
    console.log(`Email sent successfully to ${email}\n`);
    return true;
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    return false;
  }
}

export async function sendNotificationEmail(
  recipientEmail: string,
  notificationType: NotificationType,
  message: string,
  actionUrl: string,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { emailNotificationFrequency: true },
    });

    if (!user || user.emailNotificationFrequency !== "IMMEDIATE") {
      return true;
    }

    console.log(
      `\nNotification email for ${recipientEmail}:\nType: ${notificationType}\nMessage: ${message}\nAction URL: ${actionUrl}\n`,
    );

    if (
      !config.email.resendApiKey ||
      !config.email.from ||
      config.email.from === "noreply@example.com"
    ) {
      console.log(
        "SET RESEND_API_KEY and RESEND_EMAIL_ADDRESS in .env to send emails via Resend\n",
      );
      return true;
    }

    const resendClient = getResend();
    await resendClient.emails.send({
      from: config.email.from,
      to: recipientEmail,
      subject: getNotificationEmailSubject(notificationType),
      text: getNotificationEmailText(message, actionUrl),
      html: getNotificationEmailTemplate(message, actionUrl),
    });
    return true;
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return false;
  }
}
