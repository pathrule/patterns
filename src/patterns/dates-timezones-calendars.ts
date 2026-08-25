import type { Pattern } from "../types.js";

export const datesTimezonesCalendars: Pattern = {
  "slug": "dates-timezones-calendars",
  "version": "1.0.0",
  "name": "Dates, Time Zones, and Calendars",
  "tagline": "Model instants, local dates, wall-clock schedules, zones, and calendar rules as distinct types.",
  "description": "Most date bugs come from representing different concepts with the same timestamp: a birthday is not an instant, a meeting time needs a zone, a recurring local schedule crosses daylight-saving changes, and a billing date follows calendar rules rather than fixed durations. This pattern constrains temporal type choice and serialization, records scheduling and display ownership, and provides edge-case tests for zone transitions, month boundaries, locale, and ambiguous local times. It complements internationalization by focusing on temporal meaning and arithmetic; localization still owns language and presentation, while this pattern decides what moment or calendar value is being formatted.",
  "category": "Frontend",
  "icon": "calendar-clock",
  "color": "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-400",
  "installs": 0,
  "updatedAt": "2026-08-25",
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2026-08-25",
      "note": "First release."
    }
  ],
  "metaTitle": "Date and timezone pattern for AI coding agents",
  "metaDescription": "Date, instant, timezone, daylight-saving, recurring schedule, calendar arithmetic, serialization, and locale-safe testing for applications. In production.",
  "problem": "AI agents often store date-only values as midnight UTC, add fixed hours to advance calendar days, discard the source timezone of a schedule, or parse ambiguous strings differently across clients.",
  "audience": "Product teams handling appointments, deadlines, travel, billing dates, notifications, or global collaboration",
  "prevents": [
    "Moving a birthday to the prior day after timezone conversion",
    "Scheduling a recurring event one hour late after a clock change",
    "Parsing a date string differently in server and browser runtimes",
    "Calculating month boundaries with fixed-duration arithmetic"
  ],
  "appliesTo": {
    "paths": [
      "/src/domain",
      "/src/scheduling",
      "/tests/time"
    ],
    "stacks": [
      "datetime",
      "timezone",
      "calendar",
      "internationalization",
      "scheduling"
    ]
  },
  "pieces": [
    {
      "kind": "rule",
      "nodePath": "/src/domain",
      "title": "Choose the temporal type from the business meaning",
      "summary": "Represent instants, date-only values, local date-times, durations, and zoned schedules separately instead of coercing all of them into timestamps.",
      "body": "A universal timestamp preserves one moment but destroys other meanings. Date-only and wall-clock values can shift when forced through UTC, while an instant without its scheduling zone cannot reproduce the intended local recurrence.\n\n- Use an instant for an event that happened at one point on the global timeline, such as creation, payment authorization, or log time.\n- Use a date-only value for birthdays, holidays, and due dates whose meaning is a calendar day independent of timezone.\n- Use a local date-time plus an IANA timezone identifier for future appointments and recurring schedules whose wall-clock time must remain stable in that place.\n- Use a duration for elapsed time and explicit calendar operations for months or years; do not assume every day, month, or year has a fixed number of seconds.\n\nSee /src/scheduling for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "rule",
      "nodePath": "/src/domain",
      "title": "Serialize temporal values without ambiguity",
      "summary": "Use explicit machine formats, preserve offsets or zones where required, and reject inputs that omit meaning the domain needs.",
      "body": "Human-readable date strings are locale-dependent and runtime parsers accept different subsets. A payload that relies on an implicit local zone or ambiguous day and month order can map to different values on different machines.\n\n- Serialize instants in a standard timestamp format with an explicit offset, and normalize storage according to the domain contract rather than the current machine timezone.\n- Serialize date-only values as date-only text and never append a midnight offset merely to reuse an instant column or parser.\n- Carry the named zone separately for future wall-clock schedules; an offset alone cannot describe later daylight-saving rules.\n- Parse through an explicit library or schema and reject ambiguous, out-of-range, nonexistent, or unsupported values with a field-specific error.\n\nSee /tests/time for the adjacent decision or procedure that completes this constraint.",
      "scopeType": "folder",
      "priority": "high",
      "enforcement": "strict"
    },
    {
      "kind": "memory",
      "nodePath": "/src/scheduling",
      "title": "Recurring schedules are generated in their named zone",
      "summary": "Advance the local calendar rule first, then resolve each occurrence to an instant using an explicit ambiguity policy.",
      "body": "Adding a fixed duration to the previous occurrence changes local clock time across daylight-saving transitions. The recurrence rule must live in local calendar space, with the zone applied to each generated occurrence.\n\n- Store the recurrence definition, local time, named zone, start boundary, and any product-specific end or exception rules.\n- Generate the next local calendar occurrence before converting it to an instant for delivery, storage, or comparison.\n- Define what happens when a local time does not exist or occurs twice: skip, shift, choose earlier, choose later, or require user confirmation.\n- Keep generated occurrence identity stable so a scheduler can retry without creating two jobs for the same logical recurrence.\n\nSee /tests/time for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/domain",
      "title": "Display timezone belongs to the user or record context",
      "summary": "Format an instant only after selecting the intended viewer, organization, event, or source zone and locale.",
      "body": "Converting every timestamp to the server zone or browser default creates inconsistent reports and notifications. The correct display zone is a product decision, not a runtime convenience.\n\n- Resolve timezone from an explicit user or organization preference when presenting viewer-relative activity.\n- Use the event or location zone when the local wall time is part of the record, such as a flight, appointment, or store opening.\n- Include zone or offset in displays where two viewers may compare times or where daylight-saving ambiguity matters.\n- Keep formatting at the presentation boundary and preserve the underlying instant or calendar value for sorting, filtering, and API transport.\n\nSee /src/scheduling for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "memory",
      "nodePath": "/src/domain",
      "title": "Calendar arithmetic follows product rules",
      "summary": "Define end-of-month, leap-day, business-day, and inclusive-boundary behavior instead of inheriting a library's convenient default.",
      "body": "Adding one month to a date near the end of a month has several defensible outcomes, and billing or compliance logic often needs one specific answer. The same ambiguity appears in leap years and inclusive date ranges.\n\n- Document whether month addition clamps to the last valid day, skips an invalid occurrence, or preserves an end-of-month convention.\n- Define leap-day anniversaries and yearly renewals explicitly for non-leap years rather than accepting silent rollover.\n- Represent date ranges with clear inclusive or exclusive boundaries and use the same convention in database queries and user-facing copy.\n- Keep business calendars, holidays, and working-hour rules as versioned domain data when they affect money or obligations.\n\nSee /tests/time for the rule or workflow that puts this decision into practice."
    },
    {
      "kind": "skill",
      "nodePath": "/",
      "title": "test-temporal-edge-cases",
      "summary": "Exercise temporal logic across zones, daylight-saving transitions, month ends, leap years, locales, and runtime boundaries.",
      "body": "---\nname: test-temporal-edge-cases\ndescription: Test date, timezone, recurrence, or calendar behavior before changing a schedule or serialized contract.\n---\n\n# Test Temporal Edge Cases\n\nRun this procedure when the affected surface changes, before the result is promoted to production. Record evidence for every step instead of accepting a plausible-looking result.\n\n1. Freeze the clock and run the same case with process and browser defaults set to several distant timezones, including a zone without daylight-saving changes.\n2. Test the transition into and out of daylight-saving time, including nonexistent and repeated local wall-clock values under the declared policy.\n3. Exercise month end, year end, leap day, minimum and maximum supported dates, and inclusive range boundaries.\n4. Round-trip API and database serialization for instants, date-only values, local date-times, named zones, and offsets without relying on host parsing.\n5. Render representative locales and zones, then verify sorting and comparisons use the underlying value rather than formatted text.\n\n## Exit criteria\n\nThe change is complete only when the expected behavior, failure behavior, and rollback path have all been exercised with representative data. Preserve the evidence with the change so the next operator can repeat the same checks.",
      "skillTags": [
        "datetime",
        "timezone",
        "calendar",
        "testing",
        "scheduling"
      ]
    }
  ]
};
