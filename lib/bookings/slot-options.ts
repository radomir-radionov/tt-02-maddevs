import {
  MIN_DURATION_MINUTES,
  WORK_DAY_END,
  WORK_DAY_END_MINUTES,
  WORK_DAY_START,
  WORK_DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "./constants";
import {
  formatMinutes,
  generateSlotTimes,
  isPastDate,
  isStartInPast,
  isToday,
  isValidDateString,
  parseTime,
} from "./time";
import { validateBooking } from "./validate";
import type { Booking } from "./types";

/** Every minute from 09:00 through last valid start (17:30). */
export function getAllStartTimeOptions(): string[] {
  return generateSlotTimes(
    WORK_DAY_START_MINUTES,
    WORK_DAY_END_MINUTES - MIN_DURATION_MINUTES,
    SLOT_STEP_MINUTES,
  );
}

/** Every minute from 09:30 through 18:00. */
export function getAllEndTimeOptions(): string[] {
  return generateSlotTimes(
    WORK_DAY_START_MINUTES + MIN_DURATION_MINUTES,
    WORK_DAY_END_MINUTES,
    SLOT_STEP_MINUTES,
  );
}

export type TimeInputBounds = {
  min: string;
  max: string;
};

const LAST_START_MINUTES = WORK_DAY_END_MINUTES - MIN_DURATION_MINUTES;

/** True when a new booking can still start on this date. */
export function canCreateOnDate(date: string, now: Date): boolean {
  if (!isValidDateString(date) || isPastDate(date, now)) {
    return false;
  }
  if (!isToday(date, now)) {
    return true;
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes <= LAST_START_MINUTES;
}

/** Native time input limits: work day, and no past start on today. */
export function getStartTimeBounds(date: string, now: Date): TimeInputBounds {
  let min = WORK_DAY_START;
  if (isToday(date, now)) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes > WORK_DAY_START_MINUTES) {
      min = formatMinutes(Math.min(nowMinutes, LAST_START_MINUTES));
    }
  }
  return { min, max: WORK_DAY_END };
}

/** End must stay inside the work day and cannot be in the past today. */
export function getEndTimeBounds(date: string, now: Date): TimeInputBounds {
  let minMinutes = WORK_DAY_START_MINUTES;
  if (isToday(date, now)) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    minMinutes = Math.max(minMinutes, nowMinutes);
  }
  return {
    min: formatMinutes(Math.min(minMinutes, WORK_DAY_END_MINUTES)),
    max: WORK_DAY_END,
  };
}

export type SlotPickerContext = {
  date: string;
  now: Date;
  mode: "create" | "edit";
  existing: readonly Booking[];
  excludeId?: string;
};

/** End times that pass domain validation for the chosen start. */
export function getAvailableEndOptions(
  start: string,
  ctx: SlotPickerContext,
): string[] {
  const validateMode = ctx.mode === "edit" ? "update" : "create";
  return getAllEndTimeOptions().filter(
    (end) =>
      validateBooking({ date: ctx.date, start, end }, ctx.existing, {
        mode: validateMode,
        excludeId: ctx.excludeId,
        now: ctx.now,
      }).ok,
  );
}

/** Start times that are allowed and have at least one valid end time. */
export function getAvailableStartOptions(ctx: SlotPickerContext): string[] {
  return getAllStartTimeOptions().filter((start) => {
    if (isToday(ctx.date, ctx.now)) {
      const minutes = parseTime(start);
      if (minutes === null || isStartInPast(ctx.date, minutes, ctx.now)) {
        return false;
      }
    }
    return getAvailableEndOptions(start, ctx).length > 0;
  });
}

/** Keep the current field value visible after list refresh (rule 8). */
export function mergeTimeOption(
  options: readonly string[],
  current: string,
): string[] {
  if (!current || options.includes(current)) {
    return [...options];
  }
  return [...options, current].sort();
}

export function defaultBookingTimes(
  date: string,
  now: Date,
  existing: readonly Booking[] = [],
): { start: string; end: string } {
  const ctx: SlotPickerContext = {
    date,
    now,
    mode: "create",
    existing,
  };
  const start = getAvailableStartOptions(ctx)[0];
  if (!start) {
    return { start: "", end: "" };
  }
  const end = getAvailableEndOptions(start, ctx)[0] ?? "";
  return { start, end };
}
