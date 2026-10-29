import {
  WORK_DAY_END_MINUTES,
  WORK_DAY_START_MINUTES,
  SLOT_STEP_MINUTES,
} from "./constants";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTime(value: string): number | null {
  const match = TIME_RE.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export function todayDateString(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local midnight for a `YYYY-MM-DD` string (not UTC). */
export function localDateFromDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local calendar date offset from `now` (negative = past). */
export function addDaysToDateString(now: Date, days: number): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(date.getDate() + days);
  return todayDateString(date);
}

export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isPastDate(date: string, now: Date): boolean {
  return compareDates(date, todayDateString(now)) < 0;
}

export function isToday(date: string, now: Date): boolean {
  return date === todayDateString(now);
}

/** True when a clock time is before the current minute on today's date. */
export function isMinutesInPast(
  date: string,
  minutes: number,
  now: Date,
): boolean {
  if (!isToday(date, now)) {
    return false;
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return minutes < nowMinutes;
}

/** True when booking start is before now on today's date. */
export function isStartInPast(
  date: string,
  startMinutes: number,
  now: Date,
): boolean {
  return isMinutesInPast(date, startMinutes, now);
}

/** True when booking end is before now on today's date. */
export function isEndInPast(
  date: string,
  endMinutes: number,
  now: Date,
): boolean {
  return isMinutesInPast(date, endMinutes, now);
}

export function generateSlotTimes(
  fromMinutes = WORK_DAY_START_MINUTES,
  toMinutes = WORK_DAY_END_MINUTES,
  step = SLOT_STEP_MINUTES,
): string[] {
  const slots: string[] = [];
  for (let m = fromMinutes; m <= toMinutes; m += step) {
    slots.push(formatMinutes(m));
  }
  return slots;
}

export function workDayLengthMinutes(): number {
  return WORK_DAY_END_MINUTES - WORK_DAY_START_MINUTES;
}
