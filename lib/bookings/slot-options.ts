import {
  MIN_DURATION_MINUTES,
  WORK_DAY_END_MINUTES,
  WORK_DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "./constants";
import { generateSlotTimes, isStartInPast, isToday, parseTime } from "./time";
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
    if (ctx.mode === "create" && isToday(ctx.date, ctx.now)) {
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
  const start = getAvailableStartOptions(ctx)[0] ?? "09:00";
  const end = getAvailableEndOptions(start, ctx)[0] ?? "09:30";
  return { start, end };
}
