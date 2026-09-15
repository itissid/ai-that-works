#!/usr/bin/env python3
"""Generate YouTube descriptions for all unconference talks, then deslop them.

Reads segments.json from each video subdirectory, batches talks to generate
descriptions with a single LLM call per batch, then runs each description
through deslop to remove AI-sounding patterns.

Usage:
    uv run python src/description_generator/generate.py --output-dir output/talks/

Requirements:
    - GOOGLE_API_KEY set in .env (for description generation via Gemini)
    - ANTHROPIC_API_KEY set in .env (for deslop via Claude)
    - deslop installed: uv pip install deslop
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Max words from each transcript to include in the batch prompt.
# ~600 words ≈ 4-5 minutes of talk — enough context without blowing the batch.
_TRANSCRIPT_WORD_LIMIT = 600

# How many talks to send to the LLM in a single call.
_BATCH_SIZE = 5


def _excerpt(text: str, max_words: int = _TRANSCRIPT_WORD_LIMIT) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + " [...]"


def _deslop(text: str) -> str:
    """Run text through the deslop CLI via uvx. Falls back to original text on failure."""
    try:
        result = subprocess.run(
            ["uvx", "deslop", "-"],
            input=text,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        print(
            f"  [warn] deslop returned code {result.returncode}: {result.stderr.strip()[:120]}",
            file=sys.stderr,
        )
    except FileNotFoundError:
        print(
            "  [warn] deslop not found — install with: uv pip install deslop",
            file=sys.stderr,
        )
    except subprocess.TimeoutExpired:
        print("  [warn] deslop timed out — keeping raw description", file=sys.stderr)
    return text


def _generate_batch(b, talks_batch: list[dict]) -> dict[int, str]:
    """Call BAML for a batch of talks; return {talk_number: description}."""
    from baml_client.types import TalkInput

    inputs = [
        TalkInput(
            talk_number=t["talk_number"],
            title=t["title"],
            speaker_name=t.get("speaker_name"),
            speaker_company=t.get("speaker_company"),
            transcript_excerpt=_excerpt(t["text"]),
        )
        for t in talks_batch
    ]

    results = b.GenerateTalkDescriptions(talks=inputs)
    return {r.talk_number: r.description for r in results}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate and deslop YouTube descriptions for unconference talks."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        required=True,
        help="Parent directory containing per-video talk subdirectories (each with segments.json).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=_BATCH_SIZE,
        help=f"Number of talks per LLM call (default: {_BATCH_SIZE}).",
    )
    parser.add_argument(
        "--no-deslop",
        action="store_true",
        help="Skip the deslop step (useful for testing or if ANTHROPIC_API_KEY is not set).",
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

    if not args.no_deslop and not os.environ.get("ANTHROPIC_API_KEY"):
        print(
            "Error: ANTHROPIC_API_KEY not set — required for deslop.\n"
            "       Pass --no-deslop to skip deslopping.",
            file=sys.stderr,
        )
        sys.exit(1)

    from baml_client import b

    segments_files = sorted(output_dir.glob("*/segments.json"))
    if not segments_files:
        print(f"No segments.json files found under {output_dir}", file=sys.stderr)
        sys.exit(1)

    all_descriptions: list[dict] = []

    for segments_path in segments_files:
        video_dir = segments_path.parent
        video_name = video_dir.name

        data = json.loads(segments_path.read_text(encoding="utf-8"))
        talks_meta = data["talks"]

        print(f"\n[{video_name}] {len(talks_meta)} talks")

        # Load transcript text for each talk
        talks_with_text: list[dict] = []
        for talk in talks_meta:
            txt_path = video_dir / talk["filename"]
            if not txt_path.exists():
                print(f"  [{talk['talk_number']:02d}] SKIP — file not found: {talk['filename']}", file=sys.stderr)
                continue
            talks_with_text.append({**talk, "text": txt_path.read_text(encoding="utf-8")})

        # Process in batches
        for batch_start in range(0, len(talks_with_text), args.batch_size):
            batch = talks_with_text[batch_start : batch_start + args.batch_size]
            nums = [t["talk_number"] for t in batch]
            print(f"  Generating descriptions for talks {nums}...")

            desc_map = _generate_batch(b, batch)

            for talk in batch:
                tnum = talk["talk_number"]
                raw_desc = desc_map.get(tnum)
                if not raw_desc:
                    print(f"    [{tnum:02d}] no description returned", file=sys.stderr)
                    continue

                if args.no_deslop:
                    final_desc = raw_desc
                else:
                    print(f"    [{tnum:02d}] deslopping...")
                    final_desc = _deslop(raw_desc)

                all_descriptions.append(
                    {
                        "video": video_name,
                        "talk_number": tnum,
                        "talk_title": talk["title"],
                        "speaker_name": talk.get("speaker_name"),
                        "speaker_company": talk.get("speaker_company"),
                        "description": final_desc,
                    }
                )
                print(f"    [{tnum:02d}] {talk['title']} — done")

    out_path = output_dir / "descriptions.json"
    out_path.write_text(
        json.dumps(all_descriptions, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\n{len(all_descriptions)} descriptions → {out_path}")


if __name__ == "__main__":
    main()
