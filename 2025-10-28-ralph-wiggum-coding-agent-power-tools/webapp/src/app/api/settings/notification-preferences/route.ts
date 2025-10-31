import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/notification-preferences-server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getNotificationPreferences(session.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch notification preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        emailNotificationFrequency: result.emailNotificationFrequency,
        digestCustomization: result.digestCustomization,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

const VALID_FREQUENCIES = ["IMMEDIATE", "DAILY", "WEEKLY", "NEVER"] as const;
type NotificationFrequency = (typeof VALID_FREQUENCIES)[number];

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emailNotificationFrequency, digestCustomization } =
      await request.json();

    if (
      !emailNotificationFrequency ||
      typeof emailNotificationFrequency !== "string"
    ) {
      return NextResponse.json(
        { error: "Email notification frequency is required" },
        { status: 400 },
      );
    }

    if (
      !VALID_FREQUENCIES.includes(
        emailNotificationFrequency as NotificationFrequency,
      )
    ) {
      return NextResponse.json(
        {
          error: `Invalid email notification frequency. Must be one of: ${VALID_FREQUENCIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const result = await updateNotificationPreferences(
      session.userId,
      emailNotificationFrequency as NotificationFrequency,
      digestCustomization,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update notification preferences" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        emailNotificationFrequency: result.emailNotificationFrequency,
        digestCustomization: result.digestCustomization,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
