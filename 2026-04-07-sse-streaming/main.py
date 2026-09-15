import asyncio
import json
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from collections.abc import AsyncGenerator

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse

from baml_client import b
from baml_client.types import PageSummary


app = FastAPI()


class LinkExtractor(HTMLParser):
    """Extract all <a href="..."> links from HTML."""

    def __init__(self, base_url: str):
        super().__init__()
        parsed = urllib.parse.urlparse(base_url)
        self.origin = f"{parsed.scheme}://{parsed.netloc}"
        self.path_prefix = parsed.path.rstrip("/")
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        if tag != "a":
            return
        for name, value in attrs:
            if name == "href" and value and value.startswith(self.path_prefix + "/"):
                self.links.append(self.origin + value)


def _fetch_url(url: str) -> str:
    return urllib.request.urlopen(url).read().decode()


async def generate_site_map(url: str) -> list[str]:
    """Get the list of pages in the site."""
    html = await asyncio.to_thread(_fetch_url, url)
    parser = LinkExtractor(url)
    parser.feed(html)
    return list(dict.fromkeys(parser.links))


async def fetch_page_text(url: str) -> str:
    """Fetch a page and return a rough text extraction."""
    html = await asyncio.to_thread(_fetch_url, url)

    class TextExtractor(HTMLParser):
        def __init__(self):
            super().__init__()
            self.parts: list[str] = []
        def handle_data(self, data: str):
            self.parts.append(data)

    extractor = TextExtractor()
    extractor.feed(html)
    return " ".join(extractor.parts).strip()[:3000]


BATCH_SIZE = 10


async def _stream_one(url: str, queue: asyncio.Queue):
    """Stream a single page summary, pushing partial and final events to the queue."""
    content = await fetch_page_text(url)
    stream = b.stream.SummarizePage(url=url, content=content)
    async for partial in stream:
        # title is @stream.not_null + @stream.done, so it's None until complete
        if partial.title is None:
            continue
        event = {"type": "partial", "url": url, "title": partial.title, "summary": partial.summary}
        await queue.put(event)
    final = await stream.get_final_response()
    event = {"type": "final", "url": url, "title": final.title, "summary": final.summary}
    await queue.put(event)


async def stream_summaries(url: str) -> AsyncGenerator[str, None]:
    """SSE stream: emit summary events in batches, streaming partials as they arrive."""
    pages = await generate_site_map(url)
    for i in range(0, len(pages), BATCH_SIZE):
        batch = pages[i : i + BATCH_SIZE]
        batch_info = {"type": "batch_start", "batch": i // BATCH_SIZE + 1, "urls": batch}
        yield f"data: {json.dumps(batch_info)}\n\n"

        queue: asyncio.Queue = asyncio.Queue()
        tasks = [asyncio.create_task(_stream_one(page, queue)) for page in batch]

        done_count = 0
        while done_count < len(batch):
            event = await queue.get()
            yield f"data: {json.dumps(event)}\n\n"
            if event["type"] == "final":
                done_count += 1

        await asyncio.gather(*tasks)  # propagate any exceptions
    yield "data: [DONE]\n\n"


@app.get("/", response_class=HTMLResponse)
async def index():
    return Path(__file__).parent.joinpath("index.html").read_text()


@app.get("/summaries")
async def summaries(url: str = "https://boundaryml.com/podcast"):
    return StreamingResponse(
        stream_summaries(url),
        media_type="text/event-stream",
    )


if __name__ == "__main__":
    async def main():
        url = "https://boundaryml.com/podcast"
        site_map = await generate_site_map(url)
        print(f"Found {len(site_map)} pages\n")
        for i in range(0, len(site_map), BATCH_SIZE):
            batch = site_map[i : i + BATCH_SIZE]
            for page in batch:
                content = await fetch_page_text(page)
                stream = b.stream.SummarizePage(url=page, content=content)
                async for partial in stream:
                    if partial.title is not None:
                        print(f"\r  {partial.title}: {partial.summary or '...'}", end="", flush=True)
                final = await stream.get_final_response()
                print(f"\r{page}")
                print(f"  {final.title} - {final.summary}\n")

    asyncio.run(main())
