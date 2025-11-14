# 🦄 ai that works: Dates, Times, and LLMs

> Practical recipe for turning squishy scheduling language into data you can ship: label the intent, carry the user's clock, let deterministic code do the math.

[Video](https://www.youtube.com/watch?v=l7txtbgCFGU)

[![Dates, Times, and LLMs](https://img.youtube.com/vi/l7txtbgCFGU/0.jpg)](https://www.youtube.com/watch?v=l7txtbgCFGU)

## Episode Summary

- Broke scheduling language into three structures (`AbsoluteDate`, `RelativeDate`, `RecurringDate`) so we know when to ask follow-up questions, when to compute offsets, and when to hand things to the cron parser.
- Added an explicit `source` date to every prompt; the model no longer guesses what “next Friday” means.
- Kept the model on labeling duty only; cron math, timezone lookups, and validation run in pure Python.
- Brian (Applied AI Lab) walked through their production guardrails: normalize timestamps before memory writes, reuse the user’s timezone everywhere, and only re-bucket recent memories when users move timezones.

## What We Shipped

- BAML schema + regression tests covering absolute dates, relative durations, and recurring schedules.
- Prompt template that always includes a reference clock and captures any timezone hints from the user.
- `next_day` helper that resolves cron expressions with a fallback timezone and fails fast on invalid input.
- UX notes for agents: when a time component is missing, show a UI control or ask a follow-up instead of guessing.

## Patterns Worth Reusing

- **Always carry the clock.** If you don’t pass “today” (and the user’s zone), relative strings drift.
- **Schema drives behavior.** Intent-specific types keep the LLM output explainable and let deterministic code branch cleanly.
- **Timezones are user-facing.** Default to the client’s zone unless the user typed one; store what they meant, not what the server runs on.
- **Normalize once, reuse everywhere.** Whether it’s memories or cron jobs, there’s no reason for each subsystem to redo timezone math.

## Prompt + Tests in BAML

- The `ExtractDates` function captures every mention without performing arithmetic, keeping the LLM’s job limited to tagging intent and metadata.

```1:28:2025-11-11-dates-and-times/baml_src/date-time.baml
class AbsoluteDate {
    year int
    month int
    day int
    time string?
}

class RelativeDate {
    type "relative"
    relative_date string @description(#"
        use duration strings like P1D, etc 
    "#)
}

class RecurringDate {
    type "recurring"
    recurrence string @description(#"
        use cron strings like "0 10 * * *" for every day at 10am
    "#)
    timezone string? @description(#"
        only if explicitly provided
    "#)
}

type Date = AbsoluteDate | RelativeDate | RecurringDate
```

## Python Helper for Recurrence

- A lightweight `next_day` helper turns the cron output into an actual `datetime`, falling back to the caller’s time zone and rejecting ambiguous cron strings early.

```15:51:2025-11-11-dates-and-times/main.py
def next_day(date: RecurringDate, default_timezone: str) -> datetime.datetime:
    timezone_name = date.timezone or default_timezone
    if not timezone_name:
        raise ValueError("A timezone must be provided either in the RecurringDate or as default_timezone.")

    timezone = pytz.timezone(timezone_name)
    now = datetime.datetime.now(timezone)
    cron_expression = date.recurrence
    iterator = croniter(cron_expression, now)
    next_occurrence = iterator.get_next(datetime.datetime)
    if next_occurrence.tzinfo is None:
        next_occurrence = timezone.localize(next_occurrence)
    return next_occurrence
```

## Running It

```bash
uv sync
uv run baml-cli test baml_src/date-time.baml
uv run python main.py
```

- `baml-cli test` replays the scenarios from the stream - absolute timestamps, user-localized durations, and cron-based recurrences.
- `main.py` is a minimal playground for translating recurring strings into concrete datetimes you can hand to calendars or schedulers.

## Links

- Watch the episode: [YouTube](https://www.youtube.com/watch?v=l7txtbgCFGU)
- Register for the next session ("Building an Animation Pipeline"): [Luma](https://luma.com/cc-animation-pipeline)
- Explore the code: [GitHub](https://github.com/ai-that-works/ai-that-works/tree/main/2025-11-11-dates-and-times)
