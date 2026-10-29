import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  WORK_DAY_END_MINUTES,
  WORK_DAY_START_MINUTES,
} from "./constants";
import { intervalsOverlap } from "./overlap";
import {
  isPastDate,
  isStartInPast,
  isValidDateString,
  parseTime,
} from "./time";
import type {
  Booking,
  BookingInput,
  ValidateOptions,
  ValidationResult,
} from "./types";

export function validateBooking(
  input: BookingInput,
  existing: readonly Booking[],
  options: ValidateOptions,
): ValidationResult {
  const now = options.now ?? new Date();

  if (!isValidDateString(input.date)) {
    return { ok: false, code: "INVALID_DATE", message: "Invalid date format." };
  }

  if (options.mode === "create" && isPastDate(input.date, now)) {
    return {
      ok: false,
      code: "PAST_DATE",
      message: "Cannot create bookings on past dates.",
    };
  }

  const startMinutes = parseTime(input.start);
  const endMinutes = parseTime(input.end);

  if (startMinutes === null || endMinutes === null) {
    return {
      ok: false,
      code: "INVALID_TIME",
      message: "Start and end must be valid HH:mm times.",
    };
  }

  if (
    startMinutes < WORK_DAY_START_MINUTES ||
    endMinutes > WORK_DAY_END_MINUTES
  ) {
    return {
      ok: false,
      code: "OUTSIDE_HOURS",
      message: "Booking must be within the work day (09:00–18:00).",
    };
  }

  if (startMinutes >= endMinutes) {
    return {
      ok: false,
      code: "INVALID_RANGE",
      message: "Start time must be before end time.",
    };
  }

  const duration = endMinutes - startMinutes;
  if (duration < MIN_DURATION_MINUTES) {
    return {
      ok: false,
      code: "MIN_DURATION",
      message: "Minimum booking duration is 30 minutes.",
    };
  }
  if (duration > MAX_DURATION_MINUTES) {
    return {
      ok: false,
      code: "MAX_DURATION",
      message: "Maximum booking duration is 2 hours.",
    };
  }

  if (isStartInPast(input.date, startMinutes, now)) {
    if (options.mode === "update" && options.excludeId) {
      const current = existing.find((b) => b.id === options.excludeId);
      const currentStart = current ? parseTime(current.start) : null;
      if (currentStart === startMinutes) {
        // Allow saving an in-progress booking without changing its start time.
      } else {
        return {
          ok: false,
          code: "PAST_TIME",
          message: "Cannot book time in the past.",
        };
      }
    } else {
      return {
        ok: false,
        code: "PAST_TIME",
        message: "Cannot book time in the past.",
      };
    }
  }

  for (const other of existing) {
    if (other.date !== input.date) {
      continue;
    }
    if (options.excludeId && other.id === options.excludeId) {
      continue;
    }
    const otherStart = parseTime(other.start);
    const otherEnd = parseTime(other.end);
    if (otherStart === null || otherEnd === null) {
      continue;
    }
    if (intervalsOverlap(startMinutes, endMinutes, otherStart, otherEnd)) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "This time slot overlaps another booking.",
      };
    }
  }

  return { ok: true };
}
