"""Split a transcript into individual talk texts using start anchors."""

from .protocols import TalkSegmentData


class AnchorNotFoundError(ValueError):
    """Raised when a start_anchor cannot be located in the transcript."""


class TranscriptSplitter:
    """Splits a raw transcript string into per-talk text blocks."""

    def split(
        self, transcript: str, segments: list[TalkSegmentData]
    ) -> list[tuple[TalkSegmentData, str]]:
        """Return [(segment_metadata, talk_text), ...] in order.

        Each talk's text runs from its start_anchor to the start of the next
        talk's anchor (or end-of-transcript for the last talk).

        Raises AnchorNotFoundError if any anchor cannot be located.
        """
        positions: list[tuple[int, TalkSegmentData]] = []

        for seg in segments:
            pos = self._find_anchor(transcript, seg.start_anchor)
            positions.append((pos, seg))

        # Sort by position in case LLM returned them out of order
        positions.sort(key=lambda x: x[0])

        result: list[tuple[TalkSegmentData, str]] = []
        for i, (start_pos, seg) in enumerate(positions):
            end_pos = positions[i + 1][0] if i + 1 < len(positions) else len(transcript)
            talk_text = transcript[start_pos:end_pos].strip()
            result.append((seg, talk_text))

        return result

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _find_anchor(self, transcript: str, anchor: str) -> int:
        """Return the character offset of *anchor* in *transcript*.

        Tries exact match first, then case-insensitive, then a trimmed
        first-15-word fuzzy match to handle minor whitespace differences.
        """
        # 1. Exact match
        pos = transcript.find(anchor)
        if pos != -1:
            return pos

        # 2. Case-insensitive match
        pos = transcript.lower().find(anchor.lower())
        if pos != -1:
            return pos

        # 3. Fuzzy: match on first 15 words of the anchor
        anchor_words = anchor.split()[:15]
        short_anchor = " ".join(anchor_words)
        pos = transcript.lower().find(short_anchor.lower())
        if pos != -1:
            return pos

        raise AnchorNotFoundError(
            f"Could not locate start anchor in transcript.\n"
            f"Anchor: {anchor!r}\n"
            f"Make sure the LLM returned a verbatim quote from the transcript."
        )
