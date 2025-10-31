"use client";

import { type FormEvent, useEffect, useState } from "react";

type NotificationPreference = "IMMEDIATE" | "DAILY" | "WEEKLY" | "NEVER";

interface DigestCustomization {
  digestIncludeTodoCreated: boolean;
  digestIncludeTodoUpdated: boolean;
  digestIncludeTodoDeleted: boolean;
  digestIncludeTodoCommented: boolean;
  digestIncludeTodoReacted: boolean;
  digestIncludeListShared: boolean;
}

interface NotificationPreferencesResponse {
  emailNotificationFrequency: NotificationPreference;
  digestCustomization?: DigestCustomization;
}

const PREFERENCE_OPTIONS: NotificationPreference[] = [
  "IMMEDIATE",
  "DAILY",
  "WEEKLY",
  "NEVER",
];

const PREFERENCE_DESCRIPTIONS: Record<NotificationPreference, string> = {
  IMMEDIATE: "Send email for each notification",
  DAILY: "Daily digest (once per day)",
  WEEKLY: "Weekly digest (once per week)",
  NEVER: "No email notifications",
};

const DIGEST_OPTION_LABELS: Record<keyof DigestCustomization, string> = {
  digestIncludeTodoCreated: "New todos created",
  digestIncludeTodoUpdated: "Todo updates",
  digestIncludeTodoDeleted: "Todos deleted",
  digestIncludeTodoCommented: "New comments",
  digestIncludeTodoReacted: "New reactions",
  digestIncludeListShared: "Lists shared with you",
};

export default function NotificationPreferences() {
  const [preference, setPreference] =
    useState<NotificationPreference>("IMMEDIATE");
  const [digestCustomization, setDigestCustomization] =
    useState<DigestCustomization>({
      digestIncludeTodoCreated: true,
      digestIncludeTodoUpdated: true,
      digestIncludeTodoDeleted: true,
      digestIncludeTodoCommented: true,
      digestIncludeTodoReacted: true,
      digestIncludeListShared: true,
    });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/settings/notification-preferences");

        if (!response.ok) {
          throw new Error("Failed to fetch notification preferences");
        }

        const data: NotificationPreferencesResponse = await response.json();
        setPreference(data.emailNotificationFrequency);
        if (data.digestCustomization) {
          setDigestCustomization(data.digestCustomization);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotificationFrequency: preference,
          digestCustomization,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDigestCheckboxChange = (
    key: keyof DigestCustomization,
    checked: boolean,
  ) => {
    setDigestCustomization((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const showDigestCustomization =
    preference === "DAILY" || preference === "WEEKLY";

  if (isLoading) {
    return (
      <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="space-y-4">
        <legend className="block text-sm font-medium mb-3">
          Email Notifications
        </legend>

        <div className="space-y-3">
          {PREFERENCE_OPTIONS.map((option) => (
            <div key={option} className="flex items-start">
              <input
                id={`preference-${option}`}
                type="radio"
                name="preference"
                value={option}
                checked={preference === option}
                onChange={(e) =>
                  setPreference(e.target.value as NotificationPreference)
                }
                disabled={isSaving}
                className="mt-1 h-4 w-4 cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="ml-3">
                <label
                  htmlFor={`preference-${option}`}
                  className="block text-sm font-medium cursor-pointer"
                >
                  {PREFERENCE_DESCRIPTIONS[option]}
                </label>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {showDigestCustomization && (
        <fieldset className="space-y-4">
          <legend className="block text-sm font-medium mb-3">
            Include in Digest
          </legend>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Choose which notification types to include in your{" "}
            {preference.toLowerCase()} digest emails
          </p>

          <div className="space-y-3">
            {(
              Object.keys(digestCustomization) as Array<
                keyof DigestCustomization
              >
            ).map((key) => (
              <div key={key} className="flex items-start">
                <input
                  id={`digest-${key}`}
                  type="checkbox"
                  checked={digestCustomization[key]}
                  onChange={(e) =>
                    handleDigestCheckboxChange(key, e.target.checked)
                  }
                  disabled={isSaving}
                  className="mt-1 h-4 w-4 cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 rounded"
                />
                <div className="ml-3">
                  <label
                    htmlFor={`digest-${key}`}
                    className="block text-sm font-medium cursor-pointer"
                  >
                    {DIGEST_OPTION_LABELS[key]}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">
          Notification preferences updated successfully
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
