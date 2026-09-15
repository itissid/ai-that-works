#!/usr/bin/env python3
"""CLI to rewrite a document so it sounds less like AI slop."""

import argparse
import asyncio
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

from baml_client import b
from src.deslop import deslop_document


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rewrite a document to remove AI-slop patterns",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  uv run python tools/deslop/main.py path/to/document.md
  cat draft.md | uv run python tools/deslop/main.py -
  uv run python tools/deslop/main.py draft.md -o cleaned.md
  uv run python tools/deslop/main.py draft.md --detect
""",
    )
    parser.add_argument(
        "input_path",
        help="Path to the input document, or '-' to read from stdin",
    )
    parser.add_argument(
        "-o",
        "--output-file",
        type=Path,
        help="Write the rewritten document to this file instead of stdout",
    )
    parser.add_argument(
        "--detect",
        action="store_true",
        help="Identify slop patterns and print them as JSON to stdout (no rewrite)",
    )
    return parser.parse_args()


def read_input(input_path: str) -> str:
    if input_path == "-":
        return sys.stdin.read()

    return Path(input_path).read_text(encoding="utf-8")


def write_output(output: str, output_file: Path | None) -> None:
    if output_file is None:
        sys.stdout.write(output)
        if not output.endswith("\n"):
            sys.stdout.write("\n")
        return

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(output, encoding="utf-8")
    print(f"Rewritten document written to {output_file}")


async def main() -> None:
    args = parse_args()
    document = read_input(args.input_path)

    if args.detect:
        patterns = await b.IdentifyDocumentSlop(document=document)
        print(json.dumps([p.model_dump() for p in patterns], indent=2))
        return

    rewritten_document = await deslop_document(document)
    write_output(rewritten_document, args.output_file)


if __name__ == "__main__":
    asyncio.run(main())
