from baml_client.types import RecurringDate
import datetime
import pytz
from croniter import CroniterBadCronError, CroniterBadDateError, croniter

def main():
    print("Hello from 2025-11-11-dates-and-times!")


if __name__ == "__main__":
    main()



def next_day(date: RecurringDate, default_timezone: str) -> datetime.datetime:
    """
    Return the next datetime that satisfies the cron recurrence described by `date`.

    Args:
        date: RecurringDate containing the cron string and optional timezone.
        default_timezone: Fallback Olson timezone name to use when `date.timezone` is absent.

    Raises:
        ValueError: If no timezone can be determined or the cron string is invalid.
    """
    timezone_name = date.timezone or default_timezone
    if not timezone_name:
        raise ValueError("A timezone must be provided either in the RecurringDate or as default_timezone.")

    try:
        timezone = pytz.timezone(timezone_name)
    except pytz.UnknownTimeZoneError as exc:
        raise ValueError(f"Unknown timezone '{timezone_name}'.") from exc

    now = datetime.datetime.now(timezone)
    cron_expression = date.recurrence

    try:
        iterator = croniter(cron_expression, now)
    except CroniterBadCronError as exc:
        raise ValueError(f"Invalid cron expression '{cron_expression}'.") from exc

    try:
        next_occurrence = iterator.get_next(datetime.datetime)
    except CroniterBadDateError as exc:
        raise ValueError(f"Unable to compute the next occurrence for '{cron_expression}'.") from exc

    if next_occurrence.tzinfo is None:
        next_occurrence = timezone.localize(next_occurrence)

    return next_occurrence