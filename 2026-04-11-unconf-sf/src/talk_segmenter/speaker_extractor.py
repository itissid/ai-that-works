"""Extract speaker name and company from an individual talk transcript."""

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol, runtime_checkable

# baml_client is generated at the project root
_PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from baml_client import b  # noqa: E402


@dataclass
class SpeakerInfoData:
    speaker_name: str | None
    speaker_company: str | None


@runtime_checkable
class SpeakerInfoProvider(Protocol):
    def extract(self, talk_transcript: str) -> SpeakerInfoData: ...


class BAMLSpeakerExtractor:
    """Calls ExtractSpeakerInfo via BAML to identify speaker name and company."""

    def extract(self, talk_transcript: str) -> SpeakerInfoData:
        result = b.ExtractSpeakerInfo(talk_transcript=talk_transcript)
        return SpeakerInfoData(
            speaker_name=result.speaker_name,
            speaker_company=result.speaker_company,
        )
