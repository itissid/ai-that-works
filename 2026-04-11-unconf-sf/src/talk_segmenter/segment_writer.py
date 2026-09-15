"""Write individual talk transcripts to disk."""

import json
import re
from pathlib import Path

from .protocols import TalkSegmentData


def _safe_filename(title: str) -> str:
    """Convert a title to a filesystem-safe string."""
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "_", slug)
    return slug[:60].strip("_")


class SegmentWriter:
    """Writes per-talk .txt files and a summary segments.json."""

    def write(
        self,
        segments: list[tuple[TalkSegmentData, str]],
        output_dir: Path,
    ) -> list[Path]:
        """Write one .txt per talk plus a segments.json index.

        Returns the list of .txt paths written.
        """
        output_dir.mkdir(parents=True, exist_ok=True)

        txt_paths: list[Path] = []
        metadata: list[dict] = []

        for seg, text in segments:
            filename = f"talk_{seg.talk_number:02d}_{_safe_filename(seg.title)}.txt"
            txt_path = output_dir / filename
            txt_path.write_text(text, encoding="utf-8")
            txt_paths.append(txt_path)

            metadata.append(
                {
                    "talk_number": seg.talk_number,
                    "title": seg.title,
                    "speaker_name": seg.speaker_name,
                    "filename": filename,
                    "word_count": len(text.split()),
                    "start_anchor": seg.start_anchor,
                }
            )

        index_path = output_dir / "segments.json"
        index_path.write_text(
            json.dumps(
                {"total_talks": len(segments), "talks": metadata},
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

        return txt_paths
