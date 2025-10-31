"use client";

import { useEffect } from "react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["j", "↓"], description: "Next todo" },
      { keys: ["k", "↑"], description: "Previous todo" },
      { keys: ["/"], description: "Focus search" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["n", "c"], description: "New todo" },
      { keys: ["Enter"], description: "Edit selected todo" },
      { keys: ["d"], description: "Mark as done" },
      { keys: ["x", "Delete"], description: "Delete selected todo" },
      { keys: ["Escape"], description: "Close/Cancel" },
    ],
  },
  {
    title: "Help",
    shortcuts: [{ keys: ["?"], description: "Show keyboard shortcuts" }],
  },
];

export default function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {SHORTCUTS.map((category) => (
            <div key={category.title}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-2">
                      {shortcut.keys.map((key) => (
                        <span key={key} className="flex items-center gap-2">
                          {key !== shortcut.keys[0] && (
                            <span className="text-gray-400 dark:text-gray-600 text-xs">
                              or
                            </span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
