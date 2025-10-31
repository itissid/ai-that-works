"use client";

import { type FormEvent, useState } from "react";
import { shareList } from "@/app/actions/lists";

interface ShareListFormProps {
  listId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShareListForm({
  listId,
  onSuccess,
  onCancel,
}: ShareListFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await shareList(listId, email.trim());

      if (!result.success) {
        setError(result.error || "Failed to share list");
        return;
      }

      setEmail("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter email address"
          autoComplete="email"
          aria-label="Email address to share list with"
        />
      </div>

      {error && (
        <div
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Share list"
        >
          {isSubmitting ? "Sharing..." : "Share"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel sharing"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
