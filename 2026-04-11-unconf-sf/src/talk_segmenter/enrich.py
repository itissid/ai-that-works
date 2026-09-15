#!/usr/bin/env python3
"""Enrich a talks directory with speaker name and company info.

Reads the segments.json produced by segment.py, calls the LLM on each
individual .txt file, and writes the results back to segments.json.

Usage:
    uv run python src/talk_segmenter/enrich.py \\
        --talks-dir output/talks/video1214877204/
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Enrich talk segments with speaker name and company."
    )
    parser.add_argument(
        "--talks-dir",
        type=Path,
        required=True,
        help="Directory containing segments.json and individual talk .txt files.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    talks_dir: Path = args.talks_dir.resolve()

    segments_path = talks_dir / "segments.json"
    if not segments_path.exists():
        print(f"Error: segments.json not found in {talks_dir}", file=sys.stderr)
        sys.exit(1)

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    from src.talk_segmenter.speaker_extractor import BAMLSpeakerExtractor

    extractor = BAMLSpeakerExtractor()

    data = json.loads(segments_path.read_text(encoding="utf-8"))
    talks = data["talks"]

    print(f"Enriching {len(talks)} talks in {talks_dir}")

    for talk in talks:
        txt_path = talks_dir / talk["filename"]
        if not txt_path.exists():
            print(f"  [SKIP] {talk['filename']} not found", file=sys.stderr)
            continue

        transcript = txt_path.read_text(encoding="utf-8")
        info = extractor.extract(transcript)

        # Only overwrite if we got something — preserve any existing values
        if info.speaker_name is not None:
            talk["speaker_name"] = info.speaker_name
        if info.speaker_company is not None:
            talk["speaker_company"] = info.speaker_company

        # Ensure the keys exist even when null
        talk.setdefault("speaker_name", None)
        talk.setdefault("speaker_company", None)

        name_str = info.speaker_name or "unknown"
        company_str = info.speaker_company or "unknown"
        print(f"  [{talk['talk_number']:02d}] {talk['title']}")
        print(f"       speaker={name_str}  company={company_str}")

    segments_path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nUpdated: {segments_path}")


if __name__ == "__main__":
    main()
