export type CalendarCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
};

export function formatDateParts(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateString(
  value: string,
): { year: number; monthIndex: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(year, month - 1, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month - 1 ||
    check.getDate() !== day
  ) {
    return null;
  }
  return { year, monthIndex: month - 1, day };
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + delta, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function getCalendarCells(
  year: number,
  monthIndex: number,
): CalendarCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const cursor = new Date(year, monthIndex, 1 - mondayOffset);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const d = cursor.getDate();
    cells.push({
      date: formatDateParts(y, m + 1, d),
      day: d,
      inCurrentMonth: m === monthIndex,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}

export function formatDisplayDate(iso: string): string {
  const parsed = parseDateString(iso);
  if (!parsed) {
    return iso;
  }
  const { year, monthIndex, day } = parsed;
  return `${String(day).padStart(2, "0")}.${String(monthIndex + 1).padStart(2, "0")}.${year}`;
}

export const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
