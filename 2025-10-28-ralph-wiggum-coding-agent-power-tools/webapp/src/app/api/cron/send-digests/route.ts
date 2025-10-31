import { NextResponse } from "next/server";
import {
  getUnsentDigestNotifications,
  markNotificationsAsDigested,
  sendDigestEmail,
  shouldSendDailyDigest,
  shouldSendWeeklyDigest,
} from "@/lib/email-notifications";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("Starting digest sending cron job...");

    let dailyDigestsSent = 0;
    let weeklyDigestsSent = 0;
    const errors: string[] = [];

    const usersWithDigestPreferences = await prisma.user.findMany({
      where: {
        emailNotificationFrequency: {
          in: ["DAILY", "WEEKLY"],
        },
      },
      select: {
        id: true,
        email: true,
        emailNotificationFrequency: true,
        lastDigestSentAt: true,
        digestIncludeTodoCreated: true,
        digestIncludeTodoUpdated: true,
        digestIncludeTodoDeleted: true,
        digestIncludeTodoCommented: true,
        digestIncludeTodoReacted: true,
        digestIncludeListShared: true,
      },
    });

    console.log(
      `Found ${usersWithDigestPreferences.length} users with digest preferences`,
    );

    for (const user of usersWithDigestPreferences) {
      try {
        let shouldSend = false;

        if (user.emailNotificationFrequency === "DAILY") {
          shouldSend = shouldSendDailyDigest(user.lastDigestSentAt);
        } else if (user.emailNotificationFrequency === "WEEKLY") {
          shouldSend = shouldSendWeeklyDigest(user.lastDigestSentAt);
        }

        if (!shouldSend) {
          console.log(
            `Skipping ${user.email} - not time for ${user.emailNotificationFrequency.toLowerCase()} digest yet`,
          );
          continue;
        }

        const allNotifications = await getUnsentDigestNotifications(user.id);

        const filteredNotifications = allNotifications.filter((notif) => {
          switch (notif.type) {
            case "TODO_CREATED":
              return user.digestIncludeTodoCreated;
            case "TODO_UPDATED":
              return user.digestIncludeTodoUpdated;
            case "TODO_DELETED":
              return user.digestIncludeTodoDeleted;
            case "TODO_COMMENTED":
              return user.digestIncludeTodoCommented;
            case "TODO_REACTED":
              return user.digestIncludeTodoReacted;
            case "LIST_SHARED":
              return user.digestIncludeListShared;
            default:
              return true;
          }
        });

        if (filteredNotifications.length === 0) {
          console.log(
            `No notifications to send for ${user.email} after applying filters`,
          );
          continue;
        }

        console.log(
          `Sending ${user.emailNotificationFrequency.toLowerCase()} digest to ${user.email} with ${filteredNotifications.length} notifications (filtered from ${allNotifications.length})`,
        );

        const emailSent = await sendDigestEmail(
          user.email,
          filteredNotifications,
          user.emailNotificationFrequency,
        );

        if (emailSent) {
          await markNotificationsAsDigested(
            filteredNotifications.map((n) => n.id),
          );

          await prisma.user.update({
            where: { id: user.id },
            data: { lastDigestSentAt: new Date() },
          });

          if (user.emailNotificationFrequency === "DAILY") {
            dailyDigestsSent++;
          } else {
            weeklyDigestsSent++;
          }

          console.log(`Successfully sent digest to ${user.email}`);
        } else {
          const errorMsg = `Failed to send digest to ${user.email}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      } catch (userError) {
        const errorMsg = `Error processing digest for ${user.email}: ${
          userError instanceof Error ? userError.message : String(userError)
        }`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const summary = {
      success: true,
      message: `Sent ${dailyDigestsSent} daily digest${dailyDigestsSent !== 1 ? "s" : ""}, ${weeklyDigestsSent} weekly digest${weeklyDigestsSent !== 1 ? "s" : ""}`,
      dailyDigestsSent,
      weeklyDigestsSent,
      totalUsers: usersWithDigestPreferences.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Digest sending cron job completed:", summary);

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Digest sending cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send digests",
      },
      { status: 500 },
    );
  }
}
