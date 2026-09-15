"""Write transcripts to disk in text and JSON formats."""

import json
from datetime import datetime, timezone
from pathlib import Path


class TranscriptWriter:
    """Persists a transcript string as both a plain .txt and a metadata .json."""

    def write(
        self,
        transcript: str,
        output_dir: Path,
        stem: str,
    ) -> dict[str, Path]:
        """Write transcript files and return a mapping of format → path.

        Args:
            transcript: The full transcript text.
            output_dir: Directory to write files into (created if absent).
            stem: Base filename without extension (e.g. "video1973920131").

        Returns:
            {"txt": <path>, "json": <path>}
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        txt_path = output_dir / f"{stem}.txt"
        txt_path.write_text(transcript, encoding="utf-8")

        json_path = output_dir / f"{stem}.json"
        metadata = {
            "stem": stem,
            "transcribed_at": datetime.now(tz=timezone.utc).isoformat(),
            "char_count": len(transcript),
            "word_count": len(transcript.split()),
            "transcript": transcript,
        }
        json_path.write_text(
            json.dumps(metadata, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        return {"txt": txt_path, "json": json_path}
