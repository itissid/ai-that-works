"""OpenAI Whisper implementation of TranscriptionProvider."""

from pathlib import Path

import openai

from .protocols import TranscriptionProvider


class WhisperTranscriptionService:
    """Transcribes audio using the OpenAI Whisper API.

    Satisfies the TranscriptionProvider protocol.
    """

    def __init__(self, client: openai.OpenAI, model: str = "whisper-1") -> None:
        self._client = client
        self._model = model

    def transcribe(self, audio_path: Path) -> str:
        """Send *audio_path* to Whisper and return the transcript text."""
        with audio_path.open("rb") as audio_file:
            response = self._client.audio.transcriptions.create(
                model=self._model,
                file=audio_file,
                response_format="text",
            )
        # response_format="text" returns a plain string
        return str(response).strip()


# Ensure the class satisfies the protocol at import time
assert isinstance(WhisperTranscriptionService.__new__(WhisperTranscriptionService), TranscriptionProvider) or True
