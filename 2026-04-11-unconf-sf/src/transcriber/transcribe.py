#!/usr/bin/env python3
"""CLI entry point for the transcriber module.

Usage:
    uv run python -m src.transcriber.transcribe \\
        --video video1973920131.mp4 \\
        --output ./output/
"""

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the episode root (two levels above this file: src/transcriber/ -> root)
# _ENV_PATH = Path(__file__).parent.parent.parent / ".env"
load_dotenv()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe an MP4 video using OpenAI Whisper."
    )
    parser.add_argument(
        "--video",
        type=Path,
        required=True,
        help="Path to the MP4 video file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        required=True,
        help="Directory to write transcript files into.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    video_path: Path = args.video.resolve()
    output_dir: Path = args.output.resolve()

    if not video_path.exists():
        print(f"Error: video file not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    import openai

    from src.transcriber import transcribe_video
    from src.transcriber.audio_chunker import AudioChunker
    from src.transcriber.audio_extractor import AudioExtractor
    from src.transcriber.transcript_writer import TranscriptWriter
    from src.transcriber.whisper_service import WhisperTranscriptionService

    client = openai.OpenAI(api_key=api_key)
    provider = WhisperTranscriptionService(client)
    extractor = AudioExtractor()
    chunker = AudioChunker()
    writer = TranscriptWriter()

    print(f"Transcribing: {video_path}")
    print(f"Output dir:   {output_dir}")

    paths = transcribe_video(
        video_path=video_path,
        output_dir=output_dir,
        provider=provider,
        extractor=extractor,
        chunker=chunker,
        writer=writer,
    )

    print("\nDone!")
    for fmt, path in paths.items():
        print(f"  [{fmt}] {path}")


if __name__ == "__main__":
    main()
