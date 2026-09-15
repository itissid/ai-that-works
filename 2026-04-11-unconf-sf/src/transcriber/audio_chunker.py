"""Split large audio files into chunks that fit within the Whisper API limit."""

import subprocess
from pathlib import Path

_DEFAULT_MAX_SIZE_MB = 24  # Whisper API hard limit is 25 MB
_DEFAULT_SEGMENT_SECONDS = 600  # 10-minute segments


class AudioChunker:
    """Splits an audio file into chunks small enough for the Whisper API."""

    def __init__(
        self,
        max_size_mb: int = _DEFAULT_MAX_SIZE_MB,
        segment_seconds: int = _DEFAULT_SEGMENT_SECONDS,
    ) -> None:
        self._max_bytes = max_size_mb * 1024 * 1024
        self._segment_seconds = segment_seconds

    def chunk(self, audio_path: Path, output_dir: Path) -> list[Path]:
        """Return a list of audio file paths ready for transcription.

        If *audio_path* is within the size limit it is returned as-is (no copy).
        Otherwise the file is split into numbered segments under *output_dir*.
        """
        if audio_path.stat().st_size <= self._max_bytes:
            return [audio_path]

        output_dir.mkdir(parents=True, exist_ok=True)
        pattern = output_dir / f"{audio_path.stem}_%03d{audio_path.suffix}"

        result = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", str(audio_path),
                "-f", "segment",
                "-segment_time", str(self._segment_seconds),
                "-c", "copy",
                str(pattern),
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"ffmpeg chunking failed:\n{result.stderr}"
            )

        chunks = sorted(output_dir.glob(f"{audio_path.stem}_*{audio_path.suffix}"))
        if not chunks:
            raise RuntimeError("ffmpeg produced no chunk files.")

        return chunks
