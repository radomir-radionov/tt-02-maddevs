import type { BookingInput, BookingPatch, ValidationResult } from "./types";

type PayloadFailure = Extract<ValidationResult, { ok: false }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  value: unknown,
  field: string,
): { ok: true; value: string } | PayloadFailure {
  if (typeof value !== "string") {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: `${field} must be a string.`,
    };
  }
  return { ok: true, value };
}

export function parseBookingInput(
  body: unknown,
): { ok: true; input: BookingInput } | PayloadFailure {
  if (!isRecord(body)) {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: "Invalid booking payload.",
    };
  }

  const date = requireString(body.date, "date");
  if (!date.ok) {
    return date;
  }
  const start = requireString(body.start, "start");
  if (!start.ok) {
    return start;
  }
  const end = requireString(body.end, "end");
  if (!end.ok) {
    return end;
  }

  let title: string | undefined;
  if ("title" in body && body.title !== undefined) {
    const parsedTitle = requireString(body.title, "title");
    if (!parsedTitle.ok) {
      return parsedTitle;
    }
    title = parsedTitle.value;
  }

  return {
    ok: true,
    input: { date: date.value, start: start.value, end: end.value, title },
  };
}

export function parseBookingPatch(
  body: unknown,
): { ok: true; patch: BookingPatch } | PayloadFailure {
  if (!isRecord(body)) {
    return {
      ok: false,
      code: "INVALID_BODY",
      message: "Invalid patch payload.",
    };
  }

  const patch: BookingPatch = {};

  if ("date" in body) {
    const date = requireString(body.date, "date");
    if (!date.ok) {
      return date;
    }
    patch.date = date.value;
  }
  if ("start" in body) {
    const start = requireString(body.start, "start");
    if (!start.ok) {
      return start;
    }
    patch.start = start.value;
  }
  if ("end" in body) {
    const end = requireString(body.end, "end");
    if (!end.ok) {
      return end;
    }
    patch.end = end.value;
  }
  if ("title" in body && body.title !== undefined) {
    const title = requireString(body.title, "title");
    if (!title.ok) {
      return title;
    }
    patch.title = title.value;
  }

  return { ok: true, patch };
}
