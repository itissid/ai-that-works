"""
Screenshot Excalidraw diagrams using Playwright.

Usage:
    uv run python -m src.excalidraw.screenshot \
        --urls "https://excalidraw.com/#json=..." "https://excalidraw.com/#json=..." \
        --output /abs/path/to/episode/folder

Each URL is screenshotted and saved as whiteboard-1.png, whiteboard-2.png, etc.
Prints the result for each URL: "OK: whiteboard-1.png" or "FAIL: <url>"
"""

import argparse
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


def screenshot_excalidraw(
    url: str,
    output_path: Path,
    width: int = 1600,
    height: int = 900,
    headless: bool = True,
) -> bool:
    """
    Screenshot a single Excalidraw URL and save to output_path.

    Returns True on success, False on failure.
    """
    print(f"  Screenshotting: {url[:80]}{'...' if len(url) > 80 else ''}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        try:
            page = browser.new_page(viewport={"width": width, "height": height})

            # Navigate to the Excalidraw URL
            page.goto(url, wait_until="domcontentloaded")

            # Wait for the canvas element to appear
            try:
                page.wait_for_selector("canvas", timeout=15000)
            except PlaywrightTimeoutError:
                print(f"  WARNING: Canvas did not appear for URL (may be a #room= link or invalid URL)")
                return False

            # Give Excalidraw time to fully render the diagram content
            page.wait_for_timeout(2000)

            # Dismiss any dialogs/modals that might appear (e.g. "Restore?" prompts)
            try:
                # Click outside any modal or press Escape to dismiss
                page.keyboard.press("Escape")
                page.wait_for_timeout(300)
            except Exception:
                pass

            # Zoom to fit — Excalidraw shortcut: Shift+1 fits all elements in view
            # This handles diagrams of any size without clipping
            page.keyboard.press("Shift+1")
            page.wait_for_timeout(700)  # Wait for zoom animation to settle

            # Take the screenshot
            page.screenshot(path=str(output_path))
            print(f"  Saved: {output_path.name}")
            return True

        except Exception as e:
            print(f"  ERROR: {e}")
            return False
        finally:
            browser.close()


def main():
    parser = argparse.ArgumentParser(
        description="Screenshot Excalidraw diagrams and save as PNGs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  uv run python -m src.excalidraw.screenshot \\
      --urls "https://excalidraw.com/#json=abc" \\
      --output /path/to/episode

  uv run python -m src.excalidraw.screenshot \\
      --urls "https://excalidraw.com/#json=abc" "https://excalidraw.com/#json=def" \\
      --output /path/to/episode --width 1920 --height 1080
        """,
    )

    parser.add_argument(
        "--urls",
        nargs="+",
        required=True,
        help="One or more Excalidraw shareable URLs",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Directory to save whiteboard-N.png files",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1600,
        help="Browser viewport width in pixels (default: 1600)",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=900,
        help="Browser viewport height in pixels (default: 900)",
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Show the browser window (default: headless)",
    )

    args = parser.parse_args()
    output_dir = Path(args.output)

    if not output_dir.exists():
        print(f"ERROR: Output directory does not exist: {output_dir}")
        sys.exit(1)

    results = []
    for i, url in enumerate(args.urls, start=1):
        output_path = output_dir / f"whiteboard-{i}.png"
        success = screenshot_excalidraw(
            url=url,
            output_path=output_path,
            width=args.width,
            height=args.height,
            headless=not args.visible,
        )
        if success:
            print(f"OK: whiteboard-{i}.png")
            results.append((True, url, output_path))
        else:
            print(f"FAIL: {url}")
            results.append((False, url, None))

    # Summary
    successes = sum(1 for ok, _, _ in results if ok)
    print(f"\n{successes}/{len(results)} diagrams screenshotted successfully.")

    if successes < len(results):
        sys.exit(1)


if __name__ == "__main__":
    main()
