#!/usr/bin/env python3
"""CLI to suggest episode titles from a transcript."""

import argparse
import asyncio
import json
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from project root .env
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path)

from src.title_suggester import suggest_titles


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Suggest episode titles from a transcript",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example:
  python -m src.title_suggester.suggest_titles --transcript transcript.txt --title "Current Working Title" --output ./output
""",
    )
    parser.add_argument(
        "--transcript",
        "-t",
        type=Path,
        required=True,
        help="Path to transcript file",
    )
    parser.add_argument(
        "--title",
        required=True,
        help="Current working title for the episode",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        required=True,
        help="Output directory for titles.json",
    )
    return parser.parse_args()


async def main():
    args = parse_args()

    transcript = args.transcript.read_text()

    titles = await suggest_titles(
        transcript=transcript,
        current_title=args.title,
    )

    args.output.mkdir(parents=True, exist_ok=True)

    output_file = args.output / "titles.json"
    output_file.write_text(
        json.dumps(
            [{"title": t.title, "rationale": t.rationale} for t in titles],
            indent=2,
        )
    )

    print(f"Title suggestions written to {output_file}")
    print()
    for i, t in enumerate(titles, 1):
        print(f"{i}. {t.title}")
        print(f"   {t.rationale}")
        print()


if __name__ == "__main__":
    asyncio.run(main())
