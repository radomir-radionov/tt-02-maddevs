"use client";

import {
  getCalendarCells,
  MONTH_NAMES,
  parseDateString,
  shiftMonth,
  WEEKDAY_LABELS,
} from "@/lib/bookings/calendar";
import { Button } from "@/components/ui/button";
import { isPastDate, isToday } from "@/lib/bookings/time";

type BookingCalendarProps = {
  selected: string;
  viewYear: number;
  viewMonthIndex: number;
  now: Date;
  onSelect: (date: string) => void;
  onViewChange: (year: number, monthIndex: number) => void;
  onClear: () => void;
  onToday: () => void;
};

export function BookingCalendar({
  selected,
  viewYear,
  viewMonthIndex,
  now,
  onSelect,
  onViewChange,
  onClear,
  onToday,
}: BookingCalendarProps) {
  const cells = getCalendarCells(viewYear, viewMonthIndex);

  return (
    <div className="w-[17.5rem] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {MONTH_NAMES[viewMonthIndex]} {viewYear}
        </p>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Previous month"
            onClick={() => {
              const next = shiftMonth(viewYear, viewMonthIndex, -1);
              onViewChange(next.year, next.monthIndex);
            }}
          >
            ◀
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label="Next month"
            onClick={() => {
              const next = shiftMonth(viewYear, viewMonthIndex, 1);
              onViewChange(next.year, next.monthIndex);
            }}
          >
            ▶
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-7 gap-0.5 text-center text-xs"
        role="grid"
        aria-label={`${MONTH_NAMES[viewMonthIndex]} ${viewYear}`}
      >
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="py-1 font-medium text-zinc-500"
            role="columnheader"
          >
            {label}
          </div>
        ))}
        {cells.map((cell) => {
          const isSelected = cell.date === selected;
          const isPast = isPastDate(cell.date, now);
          const isTodayCell = isToday(cell.date, now);
          const isAdjacentMonth = !cell.inCurrentMonth;

          let cellClass =
            "aspect-square rounded-md py-1.5 text-sm transition-colors ";

          if (isAdjacentMonth) {
            cellClass +=
              "text-zinc-300 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ";
          } else if (isPast) {
            cellClass +=
              "bg-zinc-100 text-zinc-400 line-through decoration-zinc-400/80 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 ";
          } else {
            cellClass +=
              "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 ";
          }

          if (isTodayCell && !isSelected) {
            cellClass += "ring-1 ring-inset ring-blue-400 ";
          }

          if (isSelected) {
            cellClass =
              "aspect-square rounded-md py-1.5 text-sm bg-blue-600 font-medium text-white hover:bg-blue-700 ";
          }

          return (
            <Button
              key={cell.date}
              type="button"
              variant="unstyled"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={cell.date}
              onClick={() => onSelect(cell.date)}
              className={cellClass}
            >
              {cell.day}
            </Button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between border-t border-zinc-100 pt-2 text-sm dark:border-zinc-800">
        <Button type="button" variant="link" onClick={onClear}>
          Clear
        </Button>
        <Button type="button" variant="link" onClick={onToday}>
          Today
        </Button>
      </div>
    </div>
  );
}

export function viewFromDate(
  iso: string,
  fallback: Date,
): { year: number; monthIndex: number } {
  const parsed = parseDateString(iso);
  if (parsed) {
    return { year: parsed.year, monthIndex: parsed.monthIndex };
  }
  return { year: fallback.getFullYear(), monthIndex: fallback.getMonth() };
}
