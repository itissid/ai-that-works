import { useEffect, useRef } from "react";

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcutConfig {
  [key: string]: KeyboardShortcutHandler;
}

interface UseKeyboardShortcutsOptions {
  /**
   * Whether the shortcuts are enabled. Default: true
   */
  enabled?: boolean;
  /**
   * Whether to call preventDefault on the event when a shortcut is triggered. Default: true
   */
  preventDefault?: boolean;
  /**
   * Optional ref to an element to scope the shortcuts to. If not provided, shortcuts work globally.
   */
  target?: React.RefObject<HTMLElement>;
}

/**
 * Custom hook for handling keyboard shortcuts
 *
 * Supports:
 * - Simple keys: 'n', '/', 'Escape', 'Enter', 'ArrowUp', etc.
 * - Modifier combinations: 'ctrl+k', 'meta+shift+p', 'alt+ArrowDown', etc.
 * - Automatic exclusion of shortcuts when typing in form fields
 * - Optional scoping to specific elements via ref
 *
 * @param shortcuts - Object mapping key combinations to handler functions
 * @param options - Configuration options for the hook
 *
 * @example
 * ```typescript
 * useKeyboardShortcuts({
 *   'n': () => createNewTodo(),
 *   '/': () => focusSearch(),
 *   'ctrl+k': () => openCommandPalette(),
 *   'meta+k': () => openCommandPalette(), // Cmd+K on Mac
 *   'Escape': () => closeModal(),
 *   'j': () => selectNext(),
 *   'k': () => selectPrevious(),
 * });
 * ```
 *
 * @example With options
 * ```typescript
 * const modalRef = useRef<HTMLDivElement>(null);
 *
 * useKeyboardShortcuts(
 *   {
 *     'Escape': () => closeModal(),
 *     'Enter': () => submitForm(),
 *   },
 *   {
 *     enabled: isModalOpen,
 *     target: modalRef,
 *   }
 * );
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutConfig,
  options: UseKeyboardShortcutsOptions = {},
) {
  const { enabled = true, preventDefault = true, target } = options;
  const shortcutsRef = useRef(shortcuts);

  // Keep the shortcuts ref up to date to avoid stale closures
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in form fields
      const targetElement = event.target as HTMLElement;
      const isFormField =
        targetElement.tagName === "INPUT" ||
        targetElement.tagName === "TEXTAREA" ||
        targetElement.tagName === "SELECT" ||
        targetElement.isContentEditable;

      if (isFormField) return;

      // Build the key combination string with modifiers
      const parts: string[] = [];

      if (event.ctrlKey) parts.push("ctrl");
      if (event.altKey) parts.push("alt");
      if (event.shiftKey) parts.push("shift");
      if (event.metaKey) parts.push("meta");

      parts.push(event.key);

      const keyCombo = parts.join("+");

      // Try to find a handler for the full combination first
      let handler = shortcutsRef.current[keyCombo];

      // If not found with modifiers, try just the key
      if (!handler && parts.length > 1) {
        handler = shortcutsRef.current[event.key];
      }

      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    const targetElement = target?.current || window;
    targetElement.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener(
        "keydown",
        handleKeyDown as EventListener,
      );
    };
  }, [enabled, preventDefault, target]);
}
