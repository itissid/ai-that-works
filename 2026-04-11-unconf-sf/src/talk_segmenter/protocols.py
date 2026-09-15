"""Protocols for the talk segmenter module."""

from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass
class TalkSegmentData:
    """Plain Python representation of a detected talk segment."""

    talk_number: int
    title: str
    speaker_name: str | None
    start_anchor: str


@runtime_checkable
class SegmentationProvider(Protocol):
    """Abstraction over any talk-segmentation backend."""

    def segment(self, transcript: str) -> list[TalkSegmentData]:
        """Detect talk boundaries in *transcript* and return ordered segments."""
        ...
