import {
  WORK_DAY_END_MINUTES,
  WORK_DAY_START_MINUTES,
} from "@/lib/bookings/constants";
import {
  isPastDate,
  isToday,
  parseTime,
  workDayLengthMinutes,
} from "@/lib/bookings/time";
import type { Booking } from "@/lib/bookings/types";
import { Button } from "@/components/ui/button";

type BookingTimelineProps = {
  date: string;
  now: Date;
  bookings: Booking[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
  isLoading: boolean;
  className?: string;
};

const TIMELINE_HEIGHT_PX = 540;
const TIMELINE_PAD_Y_PX = 12;
const TIMELINE_PAD_X_PX = 8;
const HOUR_MARKS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

function minuteToTopPx(minutes: number, dayMinutes: number): number {
  const innerHeight = TIMELINE_HEIGHT_PX - TIMELINE_PAD_Y_PX * 2;
  const ratio = (minutes - WORK_DAY_START_MINUTES) / dayMinutes;
  return TIMELINE_PAD_Y_PX + ratio * innerHeight;
}

export function BookingTimeline({
  date,
  now,
  bookings,
  selectedId,
  onSelect,
  onClearSelection,
  isLoading,
  className,
}: BookingTimelineProps) {
  const dayMinutes = workDayLengthMinutes();
  const isPastDay = isPastDate(date, now);
  const showPastOverlay = isToday(date, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const pastOverlayHeight =
    showPastOverlay && nowMinutes > WORK_DAY_START_MINUTES
      ? minuteToTopPx(Math.min(nowMinutes, WORK_DAY_END_MINUTES), dayMinutes)
      : 0;

  return (
    <section
      aria-label="Bookings timeline"
      className={`overflow-hidden rounded-lg border dark:border-zinc-700 ${
        isPastDay
          ? "border-zinc-300 bg-zinc-100/80 dark:bg-zinc-900/80"
          : "border-zinc-200"
      }${className ? ` ${className}` : ""}`}
    >
      <div className="flex">
        <div
          role="presentation"
          onClick={onClearSelection}
          className="relative shrink-0 cursor-default border-r border-zinc-200 bg-zinc-100 text-xs tabular-nums text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          style={{
            height: TIMELINE_HEIGHT_PX,
            width: `calc(3.5rem + ${TIMELINE_PAD_X_PX}px)`,
            paddingLeft: TIMELINE_PAD_X_PX,
          }}
        >
          {HOUR_MARKS.map((hour) => (
            <span
              key={hour}
              className="absolute right-2 leading-none"
              style={{
                top: minuteToTopPx(hour * 60, dayMinutes),
                transform: "translateY(-50%)",
              }}
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        <div
          role="presentation"
          onClick={onClearSelection}
          className="relative flex-1 cursor-default bg-zinc-50 dark:bg-zinc-900/40"
          style={{ height: TIMELINE_HEIGHT_PX }}
        >
          {HOUR_MARKS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-zinc-200 dark:border-zinc-700"
              style={{ top: minuteToTopPx(hour * 60, dayMinutes) }}
            />
          ))}

          {isPastDay ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-zinc-400/20 dark:bg-zinc-700/35"
              aria-hidden
            />
          ) : null}

          {pastOverlayHeight > 0 ? (
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 z-10 border-b border-zinc-400/40 bg-[repeating-linear-gradient(-45deg,rgb(161_161_170/0.15),rgb(161_161_170/0.15)_6px,transparent_6px,transparent_12px)] dark:border-zinc-500/40 dark:bg-[repeating-linear-gradient(-45deg,rgb(82_82_91/0.35),rgb(82_82_91/0.35)_6px,transparent_6px,transparent_12px)]"
              style={{ height: pastOverlayHeight }}
              aria-hidden
            />
          ) : null}

          {bookings.length === 0 ? (
            <p className="absolute inset-0 z-0 flex items-center justify-center p-4 text-center text-sm text-zinc-500">
              {isLoading
                ? "Loading bookings…"
                : isPastDay
                  ? "No bookings on this date."
                  : 'No bookings on this date. Use "+ Book" to add one.'}
            </p>
          ) : null}
          {isLoading && bookings.length > 0 ? (
            <div
              className="pointer-events-none absolute inset-0 z-30 bg-white/40 dark:bg-zinc-950/30"
              aria-hidden
            />
          ) : null}
          {bookings.map((booking) => {
            const start = parseTime(booking.start);
            const end = parseTime(booking.end);
            if (start === null || end === null) {
              return null;
            }
            const top = minuteToTopPx(start, dayMinutes);
            const height = Math.max(minuteToTopPx(end, dayMinutes) - top, 24);
            const isSelected = booking.id === selectedId;
            return (
              <Button
                key={booking.id}
                type="button"
                variant="unstyled"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(booking.id);
                }}
                aria-pressed={isSelected}
                aria-label={`Booking ${booking.start} to ${booking.end}${booking.title ? `: ${booking.title}` : ""}`}
                className={`absolute left-2 right-2 z-20 items-start justify-start overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm ${
                  isSelected
                    ? "border-blue-600 bg-blue-100 ring-2 ring-blue-400 dark:bg-blue-950"
                    : "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60"
                }`}
                style={{ top, height }}
              >
                <span className="font-medium">
                  {booking.start}–{booking.end}
                </span>
                {booking.title ? (
                  <span className="mt-0.5 block truncate text-zinc-700 dark:text-zinc-300">
                    {booking.title}
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
