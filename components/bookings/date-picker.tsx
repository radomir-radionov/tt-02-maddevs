"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookingCalendar,
  viewFromDate,
} from "@/components/bookings/booking-calendar";
import { formatDisplayDate } from "@/lib/bookings/calendar";
import {
  isPastDate,
  isValidDateString,
  todayDateString,
} from "@/lib/bookings/time";

type DatePickerProps = {
  id: string;
  value: string;
  onCommit: (value: string) => void;
  now: Date;
};

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4 shrink-0 text-zinc-500"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

export function DatePicker({ id, value, onCommit, now }: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const initialView = viewFromDate(value, now);
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(initialView.monthIndex);

  const committedPast = isValidDateString(value) && isPastDate(value, now);

  useEffect(() => {
    const next = viewFromDate(value, now);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync calendar month to selected date
    setViewYear(next.year);
    setViewMonthIndex(next.monthIndex);
  }, [value, now]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSelect = (date: string) => {
    onCommit(date);
    setOpen(false);
  };

  const fieldClass = committedPast
    ? "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <div
      ref={rootRef}
      className="relative w-[11rem] shrink-0"
      data-past-date={committedPast ? "true" : undefined}
    >
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium leading-none"
      >
        Date
      </label>

      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm ${fieldClass}`}
      >
        <span>{value ? formatDisplayDate(value) : "Pick a date"}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1">
          <BookingCalendar
            selected={value}
            viewYear={viewYear}
            viewMonthIndex={viewMonthIndex}
            now={now}
            onSelect={handleSelect}
            onViewChange={(year, monthIndex) => {
              setViewYear(year);
              setViewMonthIndex(monthIndex);
            }}
            onClear={() => {
              setOpen(false);
            }}
            onToday={() => {
              handleSelect(todayDateString(now));
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
