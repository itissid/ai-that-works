"""Map a text anchor to a timestamp using Whisper verbose_json timed segments."""


class TimestampMapper:
    """Finds the start time (in seconds) of a text anchor within a Whisper timed transcript.

    Accepts the ``segments`` list from a Whisper ``verbose_json`` response.
    Each entry must have ``"text"`` (str) and ``"start"`` (float) keys.
    """

    def __init__(self, timed_segments: list[dict]) -> None:
        self._text = ""
        self._offsets: list[tuple[int, float]] = []  # (char_offset, start_seconds)
        for seg in timed_segments:
            self._offsets.append((len(self._text), float(seg["start"])))
            self._text += seg["text"]

    def find_time(self, anchor: str) -> float | None:
        """Return the start time in seconds for *anchor*, or ``None`` if not found.

        Uses the same three-tier fuzzy search as TranscriptSplitter:
        exact → case-insensitive → first-15-word prefix.
        """
        pos = self._find_pos(anchor)
        if pos is None:
            return None

        # Walk the offset table to find the segment that contains pos
        result_time = self._offsets[0][1]
        for char_offset, start_seconds in self._offsets:
            if char_offset <= pos:
                result_time = start_seconds
            else:
                break
        return result_time

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _find_pos(self, anchor: str) -> int | None:
        # 1. Exact match
        pos = self._text.find(anchor)
        if pos != -1:
            return pos

        # 2. Case-insensitive match
        pos = self._text.lower().find(anchor.lower())
        if pos != -1:
            return pos

        # 3. Fuzzy: first 15 words
        short = " ".join(anchor.split()[:15])
        pos = self._text.lower().find(short.lower())
        return pos if pos != -1 else None
