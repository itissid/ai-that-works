import type { EmailNotificationFrequency } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface DigestCustomization {
  digestIncludeTodoCreated: boolean;
  digestIncludeTodoUpdated: boolean;
  digestIncludeTodoDeleted: boolean;
  digestIncludeTodoCommented: boolean;
  digestIncludeTodoReacted: boolean;
  digestIncludeListShared: boolean;
}

export interface NotificationPreferencesResult {
  success: boolean;
  emailNotificationFrequency?: EmailNotificationFrequency;
  digestCustomization?: DigestCustomization;
  error?: string;
}

export interface UpdateNotificationPreferencesResult {
  success: boolean;
  emailNotificationFrequency?: EmailNotificationFrequency;
  digestCustomization?: DigestCustomization;
  error?: string;
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferencesResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotificationFrequency: true,
        digestIncludeTodoCreated: true,
        digestIncludeTodoUpdated: true,
        digestIncludeTodoDeleted: true,
        digestIncludeTodoCommented: true,
        digestIncludeTodoReacted: true,
        digestIncludeListShared: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      emailNotificationFrequency: user.emailNotificationFrequency,
      digestCustomization: {
        digestIncludeTodoCreated: user.digestIncludeTodoCreated,
        digestIncludeTodoUpdated: user.digestIncludeTodoUpdated,
        digestIncludeTodoDeleted: user.digestIncludeTodoDeleted,
        digestIncludeTodoCommented: user.digestIncludeTodoCommented,
        digestIncludeTodoReacted: user.digestIncludeTodoReacted,
        digestIncludeListShared: user.digestIncludeListShared,
      },
    };
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return {
      success: false,
      error: "Failed to fetch notification preferences",
    };
  }
}

export async function updateNotificationPreferences(
  userId: string,
  frequency: EmailNotificationFrequency,
  digestCustomization?: DigestCustomization,
): Promise<UpdateNotificationPreferencesResult> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotificationFrequency: frequency,
        ...(digestCustomization && {
          digestIncludeTodoCreated:
            digestCustomization.digestIncludeTodoCreated,
          digestIncludeTodoUpdated:
            digestCustomization.digestIncludeTodoUpdated,
          digestIncludeTodoDeleted:
            digestCustomization.digestIncludeTodoDeleted,
          digestIncludeTodoCommented:
            digestCustomization.digestIncludeTodoCommented,
          digestIncludeTodoReacted:
            digestCustomization.digestIncludeTodoReacted,
          digestIncludeListShared: digestCustomization.digestIncludeListShared,
        }),
      },
      select: {
        emailNotificationFrequency: true,
        digestIncludeTodoCreated: true,
        digestIncludeTodoUpdated: true,
        digestIncludeTodoDeleted: true,
        digestIncludeTodoCommented: true,
        digestIncludeTodoReacted: true,
        digestIncludeListShared: true,
      },
    });

    return {
      success: true,
      emailNotificationFrequency: user.emailNotificationFrequency,
      digestCustomization: {
        digestIncludeTodoCreated: user.digestIncludeTodoCreated,
        digestIncludeTodoUpdated: user.digestIncludeTodoUpdated,
        digestIncludeTodoDeleted: user.digestIncludeTodoDeleted,
        digestIncludeTodoCommented: user.digestIncludeTodoCommented,
        digestIncludeTodoReacted: user.digestIncludeTodoReacted,
        digestIncludeListShared: user.digestIncludeListShared,
      },
    };
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return {
      success: false,
      error: "Failed to update notification preferences",
    };
  }
}
