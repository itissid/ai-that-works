"""Talk segmenter module for AI That Works unconference transcripts."""

from pathlib import Path

from .protocols import SegmentationProvider, TalkSegmentData
from .segment_writer import SegmentWriter
from .transcript_splitter import TranscriptSplitter

__all__ = [
    "SegmentationProvider",
    "TalkSegmentData",
    "segment_transcript",
]


def segment_transcript(
    transcript_path: Path,
    output_dir: Path,
    provider: SegmentationProvider,
    splitter: TranscriptSplitter | None = None,
    writer: SegmentWriter | None = None,
) -> list[Path]:
    """Orchestrate the full segmentation pipeline.

    1. Read the transcript text from *transcript_path*.
    2. Call *provider* to detect talk boundaries.
    3. Split the text into per-talk blocks.
    4. Write individual .txt files to *output_dir*.

    Returns the list of .txt paths written.
    """
    splitter = splitter or TranscriptSplitter()
    writer = writer or SegmentWriter()

    transcript = transcript_path.read_text(encoding="utf-8")
    segments = provider.segment(transcript)

    if not segments:
        raise ValueError("Segmentation provider returned no segments.")

    split_segments = splitter.split(transcript, segments)
    return writer.write(split_segments, output_dir)
