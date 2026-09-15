import subprocess
import sys

_TRANSCRIPT_WORD_LIMIT = 600


def _excerpt(text: str, max_words: int = _TRANSCRIPT_WORD_LIMIT) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + " [...]"


def _strip_baml_logs(stdout: str) -> str:
    """Extract the actual output from deslop stdout, discarding BAML debug log lines."""
    marker = "---Parsed Response (string)---"
    idx = stdout.rfind(marker)
    if idx == -1:
        return stdout.strip()
    after = stdout[idx + len(marker):]
    lines = after.split("\n")
    # Lines after marker: blank, then the JSON-escaped response (one line), then actual text
    found_json_line = False
    actual_start = 0
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        if not found_json_line:
            found_json_line = True
            actual_start = i + 1
            continue
        break
    return "\n".join(lines[actual_start:]).strip()


def _deslop(text: str) -> str:
    """Run text through deslop CLI via uvx. Falls back to original on failure."""
    try:
        result = subprocess.run(
            ["uvx", "deslop", "-"],
            input=text,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode == 0 and result.stdout.strip():
            return _strip_baml_logs(result.stdout)
        print(
            f"  [warn] deslop returned code {result.returncode}: {result.stderr.strip()[:120]}",
            file=sys.stderr,
        )
    except FileNotFoundError:
        print("  [warn] deslop not found — install with: uv pip install deslop", file=sys.stderr)
    except subprocess.TimeoutExpired:
        print("  [warn] deslop timed out — keeping raw tweet", file=sys.stderr)
    return text


def review_xposts(posts: list[dict]) -> dict[str, str]:
    """Review all tweets as a set and fix repetition/generic sign-offs.

    posts: list of {"slug": str, "tweet": str}
    returns: {slug: tweet} with any problematic ones rewritten
    """
    from baml_client import b
    from baml_client.types import XPostForReview

    inputs = [XPostForReview(slug=p["slug"], tweet=p["tweet"]) for p in posts]
    results = b.ReviewXPosts(posts=inputs)
    return {r.slug: r.tweet for r in results}


def generate_xpost(transcript: str, speaker: str, company: str, title: str, deslop: bool = True) -> str:
    """Generate a tweet for a talk. Pass deslop=False to skip the deslop pass."""
    from baml_client import b

    result = b.GenerateXPost(
        transcript=_excerpt(transcript),
        speaker=speaker,
        company=company,
        title=title,
    )
    return _deslop(result.tweet) if deslop else result.tweet
