"""BAML-backed implementation of SegmentationProvider."""

import sys
from pathlib import Path

# baml_client is generated at the project root; ensure it's importable
_PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from baml_client import b  # noqa: E402
from baml_client.types import TalkSegment  # noqa: E402

from .protocols import TalkSegmentData


class BAMLSegmentationService:
    """Calls the BAML ExtractTalkSegments function to detect talk breaks."""

    def segment(self, transcript: str) -> list[TalkSegmentData]:
        result = b.ExtractTalkSegments(transcript=transcript)
        return [
            TalkSegmentData(
                talk_number=seg.talk_number,
                title=seg.title,
                speaker_name=seg.speaker_name,
                start_anchor=seg.start_anchor,
            )
            for seg in sorted(result.talks, key=lambda s: s.talk_number)
        ]
