#!/usr/bin/env python3
"""CLI entry point for the talk segmenter module.

Usage:
    uv run python src/talk_segmenter/segment.py \\
        --transcript output/video1214877204.txt \\
        --output output/talks/
"""

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Segment an unconference transcript into individual talks."
    )
    parser.add_argument(
        "--transcript",
        type=Path,
        required=True,
        help="Path to the transcript .txt file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Directory to write individual talk .txt files into.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    transcript_path: Path = args.transcript.resolve()
    output_dir: Path = args.output.resolve()

    if not transcript_path.exists():
        print(f"Error: transcript not found: {transcript_path}", file=sys.stderr)
        sys.exit(1)

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    from src.talk_segmenter import segment_transcript
    from src.talk_segmenter.baml_segmenter import BAMLSegmentationService
    from src.talk_segmenter.segment_writer import SegmentWriter
    from src.talk_segmenter.transcript_splitter import TranscriptSplitter

    provider = BAMLSegmentationService()
    splitter = TranscriptSplitter()
    writer = SegmentWriter()

    print(f"Transcript: {transcript_path}")
    print(f"Output dir: {output_dir}")
    print("Detecting talk boundaries...")

    paths = segment_transcript(
        transcript_path=transcript_path,
        output_dir=output_dir,
        provider=provider,
        splitter=splitter,
        writer=writer,
    )

    print(f"\nFound {len(paths)} talks:")
    for p in paths:
        print(f"  {p.name}")
    print(f"\nMetadata: {output_dir / 'segments.json'}")


if __name__ == "__main__":
    main()
