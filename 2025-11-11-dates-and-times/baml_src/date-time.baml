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

function ExtractDates(text: string, source: string?) -> Date[] {
    client "openai/gpt-4o-mini"
    prompt #"
        Extract all dates from the following text (without computation)
        {{ ctx.output_format }}

        Refererence date: {{ source }}

        {{ _.role('user') }}
        {{ text }}
    "#
}

test RelativeDates {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            Lets hang out next Friday.
        "#
    }
}

test RelativeDates2 {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            Lets hang out 2 days from now.
        "#
    }
}

test AbsoluteDates {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            The meeting is on November 15th.
        "#
    }
}

test DatesWithTimezones {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            The meeting is on November 15th at 6pm.
        "#
    }
}

test RecurringDates {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            The podcast is at 10am PT every Tuesday.
        "#
    }
}

test RecurringDatesNoTimezone {
    functions [ExtractDates]
    args {
        source "Monday November 10th, 2025"
        text #"
            The podcast is at 10am every Tuesday.
        "#
    }
}