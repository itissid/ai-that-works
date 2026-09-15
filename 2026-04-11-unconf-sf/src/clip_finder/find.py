#!/usr/bin/env python3
"""Find highlight clips across all unconference talk transcripts.

Walks a talks output directory (produced by segment.py), calls the LLM on
each individual talk .txt file, and writes all clips to a single clips.json.

Usage:
    uv run python src/clip_finder/find.py --output-dir output/talks/
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

_WORDS_PER_MINUTE = 130


def _find_anchor_pos(text: str, anchor: str) -> int | None:
    """Three-tier fuzzy search — same logic as TranscriptSplitter._find_anchor."""
    pos = text.find(anchor)
    if pos != -1:
        return pos
    pos = text.lower().find(anchor.lower())
    if pos != -1:
        return pos
    short = " ".join(anchor.split()[:15])
    pos = text.lower().find(short.lower())
    return pos if pos != -1 else None


def _seconds_to_hms(seconds: float) -> str:
    total = int(seconds)
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


def _compute_clip_times(
    talk_text: str,
    talk_word_count: int,
    talk_start_seconds: float | None,
    clip_start_anchor: str,
    clip_end_anchor: str,
) -> dict:
    """Return start/end time dicts for a clip, or null values if not computable."""
    if talk_start_seconds is None:
        return {
            "start_time_seconds": None,
            "start_time_formatted": None,
            "end_time_seconds": None,
            "end_time_formatted": None,
        }

    talk_duration_est = (talk_word_count / _WORDS_PER_MINUTE) * 60
    text_len = len(talk_text) or 1

    start_pos = _find_anchor_pos(talk_text, clip_start_anchor)
    end_pos = _find_anchor_pos(talk_text, clip_end_anchor)

    if start_pos is not None:
        start_offset = (start_pos / text_len) * talk_duration_est
        start_seconds = round(talk_start_seconds + start_offset, 2)
        start_fmt = _seconds_to_hms(start_seconds)
    else:
        start_seconds = None
        start_fmt = None

    if end_pos is not None:
        # end_pos points to start of the end anchor; add anchor length for true end
        end_char = end_pos + len(clip_end_anchor)
        end_offset = (end_char / text_len) * talk_duration_est
        end_seconds = round(talk_start_seconds + end_offset, 2)
        end_fmt = _seconds_to_hms(end_seconds)
    else:
        end_seconds = None
        end_fmt = None

    return {
        "start_time_seconds": start_seconds,
        "start_time_formatted": start_fmt,
        "end_time_seconds": end_seconds,
        "end_time_formatted": end_fmt,
    }


_DEFAULT_MAX_CLIPS = 10


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Find highlight clips from unconference talk transcripts."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        required=True,
        help="Parent directory containing per-video talk subdirectories (each with segments.json).",
    )
    parser.add_argument(
        "--max-clips",
        type=int,
        default=_DEFAULT_MAX_CLIPS,
        help=f"Maximum clips in final output after ranking (default: {_DEFAULT_MAX_CLIPS}).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir: Path = args.output_dir.resolve()

    if not output_dir.exists():
        print(f"Error: output dir not found: {output_dir}", file=sys.stderr)
        sys.exit(1)

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    from baml_client import b

    # Find all segments.json files under output_dir (one per video subdirectory)
    segments_files = sorted(output_dir.glob("*/segments.json"))
    if not segments_files:
        print(f"No segments.json files found under {output_dir}", file=sys.stderr)
        sys.exit(1)

    all_clips: list[dict] = []

    for segments_path in segments_files:
        video_dir = segments_path.parent
        video_name = video_dir.name

        data = json.loads(segments_path.read_text(encoding="utf-8"))
        talks = data["talks"]

        print(f"\n[{video_name}] {len(talks)} talks")

        for talk in talks:
            txt_path = video_dir / talk["filename"]
            if not txt_path.exists():
                print(f"  [{talk['talk_number']:02d}] SKIP — file not found: {talk['filename']}", file=sys.stderr)
                continue

            talk_text = txt_path.read_text(encoding="utf-8")
            print(f"  [{talk['talk_number']:02d}] {talk['title']}")

            clips = b.FindBestClips(
                talk_transcript=talk_text,
                talk_title=talk["title"],
                speaker_name=talk.get("speaker_name"),
            )

            if not clips:
                print(f"       → no clips found")
                continue

            print(f"       → {len(clips)} clip(s)")

            talk_start = talk.get("start_time_seconds")
            if talk_start is None:
                print(
                    f"       [warn] start_time_seconds missing — run timestamp.py first for precise times",
                    file=sys.stderr,
                )

            for clip in clips:
                times = _compute_clip_times(
                    talk_text=talk_text,
                    talk_word_count=talk.get("word_count", len(talk_text.split())),
                    talk_start_seconds=talk_start,
                    clip_start_anchor=clip.clip_start_anchor,
                    clip_end_anchor=clip.clip_end_anchor,
                )
                all_clips.append(
                    {
                        "video": video_name,
                        "talk_number": talk["talk_number"],
                        "talk_title": talk["title"],
                        "speaker_name": talk.get("speaker_name"),
                        "speaker_company": talk.get("speaker_company"),
                        "hook": clip.hook,
                        "rationale": clip.rationale,
                        "clip_start_anchor": clip.clip_start_anchor,
                        "clip_end_anchor": clip.clip_end_anchor,
                        "estimated_word_count": clip.estimated_word_count,
                        **times,
                    }
                )

    if len(all_clips) > args.max_clips:
        print(f"\n{len(all_clips)} candidates — ranking to top {args.max_clips}...")
        from baml_client.types import ClipSummary

        summaries = [
            ClipSummary(
                index=i,
                hook=c["hook"],
                rationale=c["rationale"],
                talk_title=c["talk_title"],
            )
            for i, c in enumerate(all_clips)
        ]
        selected_indices = b.SelectTopClips(
            candidates=summaries,
            max_clips=args.max_clips,
        )
        # Deduplicate while preserving order; guard against out-of-range indices
        seen: set[int] = set()
        kept: list[dict] = []
        for idx in selected_indices:
            if idx in seen or idx < 0 or idx >= len(all_clips):
                continue
            seen.add(idx)
            kept.append(all_clips[idx])
        all_clips = kept
        print(f"→ {len(all_clips)} clips selected")

    clips_path = output_dir / "clips.json"
    clips_path.write_text(
        json.dumps(all_clips, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"\n{len(all_clips)} clips total → {clips_path}")


if __name__ == "__main__":
    main()
