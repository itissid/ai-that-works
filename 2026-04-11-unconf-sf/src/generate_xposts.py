#!/usr/bin/env python3
"""Generate X (Twitter) posts for approved unconference talks.

Reads each approved talk's transcript, generates a tweet via Gemini,
runs it through deslop, and writes a markdown file per talk to output/xposts/.

Usage:
    uv run python src/generate_xposts.py

Requirements:
    - GOOGLE_API_KEY set in .env (for tweet generation via Gemini)
    - ANTHROPIC_API_KEY set in .env (for deslop via Claude)
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# (video_id, talk_number, release_date, output_slug, speaker_override, company_override)
# speaker_override/company_override fix diarization errors in segments.json
APPROVED_TALKS = [
    ("video1214877204", 4, "2026-05-18", "simon_open_vs_closed",        None,      None),
    ("video2973920131", 3, "2026-05-19", "vaibhav_fighting_slop",       None,      None),
    ("video2973920131", 7, "2026-05-20", "dylan_recruiting",            "Dylan",   None),
    ("video2973920131", 1, "2026-05-21", "antonio_rust_race_condition", None,      None),
    ("video1973920131", 2, "2026-05-22", "vaibhav_testing_framework",   None,      None),
    ("video1214877204", 5, "2026-05-23", "rachel_relocation",           None,      "Gully"),
    ("video2973920131", 2, "2026-05-24", "ankit_kill_code_reviews",     None,      None),
    ("video1973920131", 5, "2026-05-25", "pearson_peer_to_peer",        "Pearson", None),
]

_TALKS_DIR = _PROJECT_ROOT / "output" / "talks"
_OUTPUT_DIR = _PROJECT_ROOT / "output" / "xposts"


def _load_segment(video_id: str, talk_number: int) -> dict:
    segments_path = _TALKS_DIR / video_id / "segments.json"
    data = json.loads(segments_path.read_text(encoding="utf-8"))
    for talk in data["talks"]:
        if talk["talk_number"] == talk_number:
            return talk
    raise ValueError(f"Talk {talk_number} not found in {segments_path}")


def _load_transcript(video_id: str, filename: str) -> str:
    path = _TALKS_DIR / video_id / filename
    if not path.exists():
        raise FileNotFoundError(f"Transcript not found: {path}")
    return path.read_text(encoding="utf-8")


def _write_xpost(slug: str, speaker: str, company: str, title: str, date: str, tweet: str) -> Path:
    _OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = _OUTPUT_DIR / f"{slug}.md"
    content = (
        f"---\n"
        f"speaker: {speaker}\n"
        f"company: {company}\n"
        f"date: {date}\n"
        f"talk: {title}\n"
        f"---\n\n"
        f"{tweet}\n"
    )
    out_path.write_text(content, encoding="utf-8")
    return out_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate X posts for approved unconference talks.")
    parser.add_argument(
        "--no-deslop",
        action="store_true",
        help="Skip the deslop step.",
    )
    parser.add_argument(
        "--no-review",
        action="store_true",
        help="Skip the consistency review pass.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    from src.xpost_generator import generate_xpost, review_xposts

    print(f"Generating {len(APPROVED_TALKS)} X posts → {_OUTPUT_DIR}\n")

    # Phase 1: generate each tweet independently
    results = []
    for video_id, talk_number, release_date, slug, speaker_override, company_override in APPROVED_TALKS:
        segment = _load_segment(video_id, talk_number)

        speaker = speaker_override or segment["speaker_name"]
        company = company_override or segment.get("speaker_company", "")
        title = segment["title"]
        filename = segment["filename"]

        print(f"[{release_date}] {speaker} — {title}")
        print(f"  generating...")

        transcript = _load_transcript(video_id, filename)
        tweet = generate_xpost(
            transcript=transcript,
            speaker=speaker,
            company=company,
            title=title,
            deslop=not args.no_deslop,
        )
        print(f"  {len(tweet)} chars: {tweet[:80]}{'...' if len(tweet) > 80 else ''}")
        print()

        results.append({
            "slug": slug,
            "speaker": speaker,
            "company": company,
            "title": title,
            "date": release_date,
            "tweet": tweet,
        })

    # Phase 2: review all tweets as a set for consistency
    if not args.no_review:
        print("Reviewing all posts for consistency...")
        reviewed = review_xposts([{"slug": r["slug"], "tweet": r["tweet"]} for r in results])
        for r in results:
            original = r["tweet"]
            r["tweet"] = reviewed.get(r["slug"], original)
            if r["tweet"] != original:
                print(f"  [{r['slug']}] revised")
        print()

    # Phase 3: write files
    for r in results:
        out_path = _write_xpost(
            slug=r["slug"],
            speaker=r["speaker"],
            company=r["company"],
            title=r["title"],
            date=r["date"],
            tweet=r["tweet"],
        )
        char_count = len(r["tweet"])
        flag = " ⚠ OVER 280" if char_count > 280 else ""
        print(f"  {char_count} chars → {out_path.name}{flag}")

    print(f"\nDone. {len(results)} files in {_OUTPUT_DIR}")


if __name__ == "__main__":
    main()
