"""Core title suggestion logic."""

from baml_client import b
from baml_client.types import EpisodeTakeaways, TitleSuggestion


async def extract_takeaways(transcript: str) -> EpisodeTakeaways:
    """Extract key takeaways from a transcript.

    Args:
        transcript: Full episode transcript

    Returns:
        EpisodeTakeaways with topic, takeaways, insight, and audience
    """
    return await b.ExtractEpisodeTakeaways(transcript=transcript)


async def suggest_titles(
    transcript: str,
    current_title: str,
) -> list[TitleSuggestion]:
    """Suggest three episode titles from a transcript and current title.

    Two-stage pipeline:
    1. ExtractEpisodeTakeaways - Summarize key takeaways from the transcript
    2. SuggestEpisodeTitles - Generate three title options

    Args:
        transcript: Full episode transcript
        current_title: The current working title for the episode

    Returns:
        List of TitleSuggestion with title and rationale
    """
    takeaways = await extract_takeaways(transcript=transcript)
    titles = await b.SuggestEpisodeTitles(
        current_title=current_title,
        takeaways=takeaways,
        transcript=transcript,
    )
    return titles
