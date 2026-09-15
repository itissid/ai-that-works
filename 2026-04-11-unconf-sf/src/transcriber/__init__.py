"""Transcriber module for AI That Works episodes."""

from pathlib import Path
from tempfile import TemporaryDirectory

from .audio_chunker import AudioChunker
from .audio_extractor import AudioExtractor
from .protocols import TranscriptionProvider
from .transcript_writer import TranscriptWriter

__all__ = [
    "TranscriptionProvider",
    "transcribe_video",
]


def transcribe_video(
    video_path: Path,
    output_dir: Path,
    provider: TranscriptionProvider,
    extractor: AudioExtractor | None = None,
    chunker: AudioChunker | None = None,
    writer: TranscriptWriter | None = None,
) -> dict[str, Path]:
    """Orchestrate the full transcription pipeline.

    1. Extract audio from *video_path*.
    2. Split into Whisper-safe chunks if needed.
    3. Transcribe each chunk and join the results.
    4. Write output files to *output_dir*.

    Returns the dict from TranscriptWriter.write ({"txt": ..., "json": ...}).
    """
    extractor = extractor or AudioExtractor()
    chunker = chunker or AudioChunker()
    writer = writer or TranscriptWriter()

    with TemporaryDirectory(prefix="transcriber_") as tmp:
        tmp_path = Path(tmp)

        audio_path = extractor.extract(video_path, tmp_path / "audio")
        chunks = chunker.chunk(audio_path, tmp_path / "chunks")

        parts: list[str] = []
        for chunk in chunks:
            parts.append(provider.transcribe(chunk))

        transcript = "\n\n".join(parts)

    return writer.write(transcript, output_dir, stem=video_path.stem)
