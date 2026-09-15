"""Protocols (interfaces) for the transcriber module."""

from pathlib import Path
from typing import Protocol, runtime_checkable


@runtime_checkable
class TranscriptionProvider(Protocol):
    """Abstraction over any audio transcription backend."""

    def transcribe(self, audio_path: Path) -> str:
        """Transcribe the audio file at *audio_path* and return the full text."""
        ...
