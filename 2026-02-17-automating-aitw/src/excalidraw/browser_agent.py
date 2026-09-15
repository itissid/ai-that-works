"""
Excalidraw workspace browser agent.

Navigates to the AI That Works Excalidraw workspace, finds the board matching
the given episode date, screenshots it, and prints the board URL to stdout.

Uses a persistent browser context (~/.playwright-excalidraw/) so you log in
once and subsequent runs reuse the session headlessly.

Usage:
    # First-time setup — opens a visible browser for you to log in:
    uv run python -m src.excalidraw.browser_agent --login

    # Normal use — finds and screenshots the board for a given date:
    uv run python -m src.excalidraw.browser_agent \\
        --date 2026-05-22 \\
        --output /abs/path/to/episode/folder

    # Tiled capture (2 columns x 2 rows = 4 screenshots):
    uv run python -m src.excalidraw.browser_agent \\
        --date 2026-05-22 \\
        --output /abs/path/to/episode/folder \\
        --tiles 2x2

Output (on success):
    BOARD_URL: https://app.excalidraw.com/...
    SCREENSHOT: /path/to/whiteboard-1.png
    SCREENSHOT: /path/to/whiteboard-2.png   # (if --tiles produces multiple tiles)
"""

import argparse
import io
import sys

from PIL import Image
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

WORKSPACE_URL = "https://app.excalidraw.com/w/7wpIFUaymM3/dashboard"
COLLECTION_NAME = "AI That Works"
SESSION_DIR = Path.home() / ".playwright-excalidraw"
VIEWPORT_WIDTH = 1600
VIEWPORT_HEIGHT = 900

# Launch args that suppress automation signals so sites don't flag the browser
STEALTH_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-infobars",
    "--disable-extensions",
]


def _date_variants(date: datetime) -> list[str]:
    """Return multiple string representations of the date to match against board titles."""
    return [
        date.strftime("%Y-%m-%d"),          # 2026-05-22
        date.strftime("%-m/%-d/%Y"),         # 5/22/2026
        date.strftime("%m/%d/%Y"),           # 05/22/2026
        date.strftime("%B %-d, %Y"),         # May 22, 2026
        date.strftime("%B %d, %Y"),          # May 22, 2026 (zero-padded)
        date.strftime("%-m/%-d"),            # 5/22 (short)
        date.strftime("%m/%d"),              # 05/22 (short zero-padded)
    ]


def _parse_tiles(tiles: str) -> tuple[int, int]:
    """Parse 'NxM' into (cols, rows). Raises ValueError on bad input."""
    try:
        cols_str, rows_str = tiles.lower().split("x")
        cols, rows = int(cols_str), int(rows_str)
    except (ValueError, AttributeError):
        raise ValueError(f"--tiles must be in NxM format (e.g. '2x2'), got: {tiles!r}")
    if cols < 1 or rows < 1:
        raise ValueError(f"--tiles values must be >= 1, got: {tiles!r}")
    return cols, rows


def _read_zoom_pct(page) -> float | None:
    """Read the current zoom percentage from the Excalidraw UI. Returns float or None."""
    selectors = [
        "[aria-label*='zoom' i]",
        "[title*='zoom' i]",
        "button[class*='zoom' i]",
        ".layer-ui__wrapper__footer-center button",
        "[class*='footer'] button",
    ]
    for selector in selectors:
        try:
            for elem in page.locator(selector).all():
                text = (elem.text_content(timeout=300) or "").strip()
                if "%" in text:
                    return float(text.replace("%", "").strip())
        except Exception:
            continue
    try:
        result = page.evaluate("""() => {
            const all = document.querySelectorAll('button, span, div');
            for (const el of all) {
                const t = el.textContent.trim();
                if (/^\\d+%$/.test(t)) return t;
            }
            return null;
        }""")
        if result:
            return float(result.replace("%", ""))
    except Exception:
        pass
    return None


def _zoom_to(page, target_pct: float, tolerance: float = 2.0, max_steps: int = 30) -> float:
    """
    Ctrl+scroll until zoom reaches target_pct (within tolerance). Returns final zoom.
    Mouse must already be positioned over the canvas before calling this.
    """
    for step in range(max_steps):
        current = _read_zoom_pct(page)
        if current is None:
            print(f"  Warning: could not read zoom at step {step}, continuing...")
            break
        diff = target_pct - current
        if abs(diff) <= tolerance:
            print(f"  Zoom reached: {current}% (target: {target_pct}%)")
            return current
        # Ctrl+scroll: negative deltaY = scroll up = zoom in
        page.keyboard.down("Control")
        page.mouse.wheel(0, -120 if diff > 0 else 120)
        page.keyboard.up("Control")
        page.wait_for_timeout(300)
    current = _read_zoom_pct(page) or target_pct
    if abs(current - target_pct) > tolerance:
        print(f"  Warning: zoom settled at {current}%, target was {target_pct}%")
    return current


def _title_matches_date(title: str, date: datetime) -> bool:
    """Return True if the board title contains a date variant matching the given date."""
    title_lower = title.lower()
    for variant in _date_variants(date):
        if variant.lower() in title_lower:
            return True
    return False


def login():
    """Open a visible browser for the user to log in and save the session."""
    print("Opening browser for login...")
    print(f"Session will be saved to: {SESSION_DIR}")
    print("Log in to Excalidraw, then press Enter here to save and close.\n")

    SESSION_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,
            channel="chrome",  # Use real Chrome, not Playwright's Chromium — avoids bot detection
            args=STEALTH_ARGS,
            viewport={"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT},
        )
        page = context.pages[0] if context.pages else context.new_page()

        # Remove the navigator.webdriver flag that sites check for automation
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        page.goto("https://app.excalidraw.com")

        input("Press Enter after you have logged in...")
        context.close()

    print("Session saved. You can now run the browser agent normally.")


def find_and_screenshot(
    date: datetime,
    output_dir: Path,
    tiles: str = "1x1",
) -> tuple[str, list[Path]]:
    """
    Navigate the workspace, find the board matching the date, screenshot it.

    Returns (board_url, list_of_screenshot_paths).
    With tiles='1x1' (default), returns a single-element list.
    Raises RuntimeError with a user-facing message on failure.
    """
    cols, rows = _parse_tiles(tiles)
    total_tiles = cols * rows

    if not SESSION_DIR.exists():
        raise RuntimeError(
            "No saved session found. Run with --login first:\n"
            "  uv run python -m src.excalidraw.browser_agent --login"
        )

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(SESSION_DIR),
            headless=False,  # Keep visible — headless Chrome is more detectable; can revisit later
            channel="chrome",  # Use real Chrome binary — avoids bot detection
            args=STEALTH_ARGS,
            viewport={"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT},
        )

        try:
            page = context.pages[0] if context.pages else context.new_page()
            # Suppress the webdriver flag on every page
            page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

            # Navigate to workspace dashboard
            print(f"Navigating to workspace: {WORKSPACE_URL}")
            page.goto(WORKSPACE_URL, wait_until="domcontentloaded")
            page.wait_for_timeout(2000)

            # Check if we got redirected to a login page
            current_url = page.url
            if "sign-in" in current_url or "login" in current_url or "auth" in current_url:
                raise RuntimeError(
                    "Session expired or not logged in. Run with --login to reauthenticate:\n"
                    "  uv run python -m src.excalidraw.browser_agent --login"
                )

            # Find and click the "AI That Works" collection
            print(f"Looking for '{COLLECTION_NAME}' collection...")
            collection_clicked = False
            try:
                # Collections are typically sidebar items or cards
                collection_selectors = [
                    f"text={COLLECTION_NAME}",
                    f"[title='{COLLECTION_NAME}']",
                    f"[aria-label='{COLLECTION_NAME}']",
                ]
                for selector in collection_selectors:
                    elem = page.locator(selector).first
                    if elem.is_visible(timeout=3000):
                        elem.click()
                        collection_clicked = True
                        print(f"Clicked collection: {COLLECTION_NAME}")
                        break
            except Exception as e:
                print(f"Could not find collection by selector: {e}")

            if not collection_clicked:
                raise RuntimeError(
                    f"Could not find '{COLLECTION_NAME}' collection in the workspace. "
                    "Make sure you're logged into the right account."
                )

            page.wait_for_timeout(1500)

            # Scan board titles for one matching the episode date
            print(f"Searching for board matching date: {date.strftime('%Y-%m-%d')}")
            date_variants = _date_variants(date)
            print(f"  Date variants: {date_variants[:3]}...")

            board_url = None
            board_clicked = False

            # Try to find board cards/tiles with matching titles
            try:
                # Common Excalidraw board card selectors
                board_selectors = [
                    "[data-testid='board-card']",
                    "[class*='board-card']",
                    "[class*='BoardCard']",
                    "[class*='scene-card']",
                    "li[class*='item']",
                    "div[class*='item']",
                ]

                for board_selector in board_selectors:
                    boards = page.locator(board_selector).all()
                    if not boards:
                        continue

                    for board in boards:
                        try:
                            title = board.text_content(timeout=500) or ""
                            if _title_matches_date(title, date):
                                print(f"  Found matching board: '{title.strip()[:60]}'")
                                board.click()
                                board_clicked = True
                                break
                        except Exception:
                            continue

                    if board_clicked:
                        break

            except Exception as e:
                print(f"Error scanning board cards: {e}")

            # Fallback: look for any text element matching the date
            if not board_clicked:
                print("Trying fallback: searching all text elements for date...")
                for variant in date_variants:
                    try:
                        elem = page.locator(f"text={variant}").first
                        if elem.is_visible(timeout=1000):
                            print(f"  Found element with text '{variant}'")
                            # Try to find and click the parent board container
                            parent = elem.locator("..").locator("..")
                            parent.click()
                            board_clicked = True
                            break
                    except Exception:
                        continue

            if not board_clicked:
                raise RuntimeError(
                    f"No board found matching date {date.strftime('%Y-%m-%d')} "
                    f"in the '{COLLECTION_NAME}' collection.\n"
                    f"Date variants searched: {', '.join(date_variants)}"
                )

            # Wait for the board to load
            page.wait_for_timeout(3000)
            board_url = page.url
            print(f"  Board URL: {board_url}")

            # Wait for the Excalidraw canvas to render
            try:
                page.wait_for_selector("canvas", timeout=15000)
            except PlaywrightTimeoutError:
                raise RuntimeError("Canvas did not appear — board may not have loaded correctly.")

            page.wait_for_timeout(2000)

            # Dismiss any modals (e.g. collaboration prompts)
            try:
                page.keyboard.press("Escape")
                page.wait_for_timeout(300)
            except Exception:
                pass

            # Zoom to fit — Shift+1 fits all diagram elements in the viewport
            print("Zooming to fit...")
            page.keyboard.press("Shift+1")
            page.wait_for_timeout(800)

            screenshot_paths: list[Path] = []

            if cols == 1 and rows == 1:
                output_path = output_dir / "whiteboard-1.png"
                page.screenshot(path=str(output_path))
                print(f"  Saved screenshot: {output_path}")
                screenshot_paths.append(output_path)

            else:
                current_zoom = _read_zoom_pct(page)
                if current_zoom is None:
                    raise RuntimeError(
                        "Could not read zoom level from Excalidraw UI. "
                        "Cannot compute tiled zoom target."
                    )
                print(f"  Current zoom after Shift+1: {current_zoom}%")

                target_zoom = current_zoom * cols
                print(f"  Target zoom for {cols}x{rows} tiles: {target_zoom}%")

                # Move mouse to canvas center so wheel events land on the canvas,
                # not the sidebar or toolbar
                canvas_cx = VIEWPORT_WIDTH // 2
                canvas_cy = VIEWPORT_HEIGHT // 2
                page.mouse.move(canvas_cx, canvas_cy)
                page.wait_for_timeout(200)

                _zoom_to(page, target_zoom)
                page.wait_for_timeout(500)

                # Re-fit to reset scroll position, then zoom back to target.
                # After Ctrl+scroll zoom, the view center may have drifted.
                # Shift+1 re-centers the content, then we zoom in again cleanly.
                page.keyboard.press("Shift+1")
                page.wait_for_timeout(600)
                page.mouse.move(canvas_cx, canvas_cy)
                _zoom_to(page, target_zoom)
                page.wait_for_timeout(500)

                # Pan to the top-left corner: after Shift+1 then zoom-in by cols,
                # the view is centered on the content. For an NxM grid, back up
                # (cols-1)/2 viewport widths left and (rows-1)/2 viewport heights up.
                pan_left = int((cols - 1) / 2 * VIEWPORT_WIDTH)
                pan_up   = int((rows - 1) / 2 * VIEWPORT_HEIGHT)
                if pan_left > 0:
                    page.mouse.wheel(-pan_left, 0)
                    page.wait_for_timeout(400)
                if pan_up > 0:
                    page.mouse.wheel(0, -pan_up)
                    page.wait_for_timeout(400)

                tile_index = 1
                for row in range(rows):
                    for col in range(cols):
                        output_path = output_dir / f"whiteboard-{tile_index}.png"
                        page.screenshot(path=str(output_path))
                        print(f"  Saved tile {tile_index}/{total_tiles}: {output_path}")
                        screenshot_paths.append(output_path)
                        tile_index += 1

                        is_last_col = col == cols - 1
                        is_last_row = row == rows - 1

                        if not is_last_col:
                            page.mouse.wheel(VIEWPORT_WIDTH, 0)
                            page.wait_for_timeout(300)
                        elif not is_last_row:
                            # Back to col 0: we're at col (cols-1), so pan left (cols-1) steps
                            if cols > 1:
                                page.mouse.wheel(-((cols - 1) * VIEWPORT_WIDTH), 0)
                                page.wait_for_timeout(300)
                            page.mouse.wheel(0, VIEWPORT_HEIGHT)
                            page.wait_for_timeout(300)

            return board_url, screenshot_paths

        finally:
            context.close()


def main():
    parser = argparse.ArgumentParser(
        description="Find and screenshot an Excalidraw board matching an episode date",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # First-time login (opens visible browser):
  uv run python -m src.excalidraw.browser_agent --login

  # Screenshot the board for a given episode date:
  uv run python -m src.excalidraw.browser_agent \\
      --date 2026-05-22 \\
      --output /path/to/episode/folder
        """,
    )

    parser.add_argument(
        "--login",
        action="store_true",
        help="Open a visible browser to log in and save the session",
    )
    parser.add_argument(
        "--date",
        help="Episode date in YYYY-MM-DD format",
    )
    parser.add_argument(
        "--output",
        help="Directory to save whiteboard screenshots",
    )
    parser.add_argument(
        "--tiles",
        default="1x1",
        metavar="NxM",
        help="Capture board as NxM grid (e.g. --tiles 2x2). Default: 1x1.",
    )

    args = parser.parse_args()

    if args.login:
        login()
        return

    if not args.date or not args.output:
        parser.error("--date and --output are required (or use --login for first-time setup)")

    try:
        _parse_tiles(args.tiles)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        date = datetime.strptime(args.date, "%Y-%m-%d")
    except ValueError:
        print(f"ERROR: Invalid date format '{args.date}'. Use YYYY-MM-DD.", file=sys.stderr)
        sys.exit(1)

    output_dir = Path(args.output)
    if not output_dir.exists():
        print(f"ERROR: Output directory does not exist: {output_dir}", file=sys.stderr)
        sys.exit(1)

    try:
        board_url, screenshot_paths = find_and_screenshot(date, output_dir, tiles=args.tiles)
        # Print structured output for the skill to parse
        print(f"BOARD_URL: {board_url}")
        for screenshot_path in screenshot_paths:
            print(f"SCREENSHOT: {screenshot_path}")
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
