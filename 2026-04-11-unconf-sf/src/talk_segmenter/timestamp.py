#!/usr/bin/env python3
"""Add start timestamps to a talks directory's segments.json.

Calls Whisper with verbose_json on the original video's audio, maps each
talk's start_anchor to a timestamp, and writes start_time_seconds /
start_time_formatted back into segments.json.

Usage:
    uv run python src/talk_segmenter/timestamp.py \\
        --video output/video1214877204.mp4 \\
        --talks-dir output/talks/video1214877204/
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))


def _seconds_to_hms(seconds: float) -> str:
    total = int(seconds)
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h:02d}:{m:02d}:{s:02d}"


def _get_duration(audio_path: Path) -> float:
    """Return duration in seconds using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(audio_path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add start timestamps to segments.json using Whisper verbose_json."
    )
    parser.add_argument(
        "--video",
        type=Path,
        required=True,
        help="Path to the original MP4 (or any audio/video file Whisper accepts).",
    )
    parser.add_argument(
        "--talks-dir",
        type=Path,
        required=True,
        help="Directory containing segments.json (produced by segment.py).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    video_path: Path = args.video.resolve()
    talks_dir: Path = args.talks_dir.resolve()

    if not video_path.exists():
        print(f"Error: video not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    segments_path = talks_dir / "segments.json"
    if not segments_path.exists():
        print(f"Error: segments.json not found in {talks_dir}", file=sys.stderr)
        sys.exit(1)

    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not set (check your .env file).", file=sys.stderr)
        sys.exit(1)

    import openai

    from src.transcriber.audio_chunker import AudioChunker
    from src.transcriber.audio_extractor import AudioExtractor
    from src.talk_segmenter.timestamp_mapper import TimestampMapper

    client = openai.OpenAI()
    extractor = AudioExtractor()
    chunker = AudioChunker()

    print(f"Video:     {video_path}")
    print(f"Talks dir: {talks_dir}")
    print("Extracting audio...")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        audio_path = extractor.extract(video_path, tmp_path)
        chunks = chunker.chunk(audio_path, tmp_path / "chunks")

        print(f"Transcribing {len(chunks)} chunk(s) with verbose_json...")
        timed_segments: list[dict] = []
        offset_seconds = 0.0

        for i, chunk_path in enumerate(chunks):
            print(f"  chunk {i + 1}/{len(chunks)}: {chunk_path.name}")
            with chunk_path.open("rb") as audio_file:
                response = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json",
                )
            for seg in response.segments:
                timed_segments.append({
                    "start": seg.start + offset_seconds,
                    "text": seg.text,
                })
            offset_seconds += _get_duration(chunk_path)

    mapper = TimestampMapper(timed_segments)

    data = json.loads(segments_path.read_text(encoding="utf-8"))
    talks = data["talks"]

    print(f"\nMapping {len(talks)} talks to timestamps:")
    for talk in talks:
        anchor = talk.get("start_anchor")
        if not anchor:
            print(f"  [{talk['talk_number']:02d}] {talk['title']} — no start_anchor, skipping")
            continue

        t = mapper.find_time(anchor)
        if t is None:
            print(f"  [{talk['talk_number']:02d}] {talk['title']} — anchor not found in timed transcript")
            talk.setdefault("start_time_seconds", None)
            talk.setdefault("start_time_formatted", None)
        else:
            talk["start_time_seconds"] = round(t, 2)
            talk["start_time_formatted"] = _seconds_to_hms(t)
            print(f"  [{talk['talk_number']:02d}] {talk['title']} → {talk['start_time_formatted']}")

    segments_path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\nUpdated: {segments_path}")


if __name__ == "__main__":
    main()
