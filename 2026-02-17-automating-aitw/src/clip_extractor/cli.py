#!/usr/bin/env python3
"""CLI to extract high-impact clips from episode transcripts."""

import argparse
import asyncio
import json
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from project root .env
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path)

from baml_client import b
from baml_client.types import HighImpactClip, InMediasResClip


async def extract_clips(
    transcript: str,
    episode_title: str,
    episode_description: str,
) -> tuple[list[HighImpactClip], list[InMediasResClip]]:
    """Extract high-impact and in-medias-res clips from an episode transcript.

    Two-stage pipeline:
    1. ExtractEmailStructure - Extract key takeaways from the transcript
    2. ExtractHighImpactClips + ExtractInMediasResClips - Run both in parallel

    Args:
        transcript: Full episode transcript
        episode_title: Title of the episode
        episode_description: Episode description/summary

    Returns:
        Tuple of (high_impact_clips, in_medias_res_clips)
    """
    # Stage 1: Extract key takeaways using the email structure function
    structure = await b.ExtractEmailStructure(
        transcript=transcript,
        episode_title=episode_title,
        episode_description=episode_description,
    )

    # Stage 2: Run both clip extractors in parallel
    clips, action_clips = await asyncio.gather(
        b.ExtractHighImpactClips(
            transcript=transcript,
            episode_title=episode_title,
            key_takeaways=structure.quick_recap,
            one_thing_to_remember=structure.one_thing_to_remember,
        ),
        b.ExtractInMediasResClips(
            transcript=transcript,
            episode_title=episode_title,
            key_takeaways=structure.quick_recap,
            one_thing_to_remember=structure.one_thing_to_remember,
        ),
    )

    return clips, action_clips


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract high-impact clips from an episode transcript",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example:
  python -m src.clip_extractor.extract_clip --transcript transcript.txt --title "My Episode" --description "About AI" --output ./output
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
        help="Episode title",
    )
    parser.add_argument(
        "--description",
        "-d",
        required=True,
        help="Episode description",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        required=True,
        help="Output directory for clips.json",
    )
    return parser.parse_args()


async def main():
    args = parse_args()

    transcript = args.transcript.read_text()

    clips, action_clips = await extract_clips(
        transcript=transcript,
        episode_title=args.title,
        episode_description=args.description,
    )

    # Ensure output directory exists
    args.output.mkdir(parents=True, exist_ok=True)

    # Write clips.json to output directory
    output_file = args.output / "clips.json"
    clips_data = [
        {
            "rationale": clip.rationale,
            "start_timestamp": clip.start_timestamp,
            "end_timestamp": clip.end_timestamp,
            "speaker": clip.speaker,
            "transcript_excerpt": clip.transcript_excerpt,
            "hook": clip.hook,
        }
        for clip in clips
    ]
    output_file.write_text(json.dumps(clips_data, indent=2))

    # Write action_clips.json to output directory
    action_output_file = args.output / "action_clips.json"
    action_clips_data = [
        {
            "rationale": clip.rationale,
            "action_type": clip.action_type,
            "start_timestamp": clip.start_timestamp,
            "end_timestamp": clip.end_timestamp,
            "speaker": clip.speaker,
            "transcript_excerpt": clip.transcript_excerpt,
            "hook": clip.hook,
        }
        for clip in action_clips
    ]
    action_output_file.write_text(json.dumps(action_clips_data, indent=2))

    print(f"High-impact clips extracted to {output_file}")
    for i, clip in enumerate(clips, 1):
        print(f"\n--- Clip {i} ---")
        print(f"Hook: {clip.hook}")
        print(f"Timestamps: {clip.start_timestamp} - {clip.end_timestamp}")

    print(f"\nIn-medias-res action clips extracted to {action_output_file}")
    for i, clip in enumerate(action_clips, 1):
        print(f"\n--- Action Clip {i} ({clip.action_type}) ---")
        print(f"Hook: {clip.hook}")
        print(f"Timestamps: {clip.start_timestamp} - {clip.end_timestamp}")


if __name__ == "__main__":
    asyncio.run(main())
