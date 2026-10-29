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
import { Card } from "@/components/ui/card";
import { cva } from "class-variance-authority";
import { cn } from "cn";

type BookingTimelineProps = {
  date: string;
  now: Date;
  bookings: Booking[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
  isLoading: boolean;
  loadFailed: boolean;
  className?: string;
};

const TIMELINE_HEIGHT_PX = 540;
const TIMELINE_PAD_Y_PX = 12;
const TIMELINE_PAD_X_PX = 8;
const HOUR_MARKS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const bookingBlockVariants = cva(
  "absolute left-2 right-2 z-20 h-auto flex-col items-start justify-center overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm",
  {
    variants: {
      state: {
        default:
          "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:hover:bg-blue-950/60",
        selected:
          "border-blue-600 bg-blue-100 ring-2 ring-blue-400 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-950",
        past: "border-blue-200 bg-blue-50/90 text-foreground/80 hover:bg-blue-50/90 dark:border-blue-900 dark:bg-blue-950/50 dark:hover:bg-blue-950/50",
      },
    },
    defaultVariants: {
      state: "default",
    },
  },
);

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
  loadFailed,
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
    <Card
      aria-label="Bookings timeline"
      className={`overflow-hidden py-0 ${
        isPastDay ? "bg-muted/50" : ""
      }${className ? ` ${className}` : ""}`}
    >
      <div className="flex">
        <div
          role="presentation"
          onClick={onClearSelection}
          className="relative shrink-0 cursor-default border-r bg-muted text-xs tabular-nums text-muted-foreground"
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
          className="relative flex-1 cursor-default bg-muted/30"
          style={{ height: TIMELINE_HEIGHT_PX }}
        >
          {HOUR_MARKS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-zinc-200 dark:border-zinc-700"
              style={{ top: minuteToTopPx(hour * 60, dayMinutes) }}
            />
          ))}

          {isPastDay && (
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-zinc-400/20 dark:bg-zinc-700/35"
              aria-hidden
            />
          )}

          {pastOverlayHeight > 0 && (
            <div
              className="pointer-events-none absolute left-0 right-0 top-0 z-10 border-b border-zinc-400/40 bg-[repeating-linear-gradient(-45deg,rgb(161_161_170/0.15),rgb(161_161_170/0.15)_6px,transparent_6px,transparent_12px)] dark:border-zinc-500/40 dark:bg-[repeating-linear-gradient(-45deg,rgb(82_82_91/0.35),rgb(82_82_91/0.35)_6px,transparent_6px,transparent_12px)]"
              style={{ height: pastOverlayHeight }}
              aria-hidden
            />
          )}

          {bookings.length === 0 && !loadFailed && (
            <p className="absolute inset-0 z-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
              {isLoading
                ? "Loading bookings…"
                : isPastDay
                  ? "No bookings on this date."
                  : 'No bookings on this date. Use "+ Book" to add one.'}
            </p>
          )}
          {isLoading && bookings.length > 0 && (
            <div
              className="pointer-events-none absolute inset-0 z-30 bg-white/40 dark:bg-zinc-950/30"
              aria-hidden
            />
          )}
          {bookings.map((booking) => {
            const start = parseTime(booking.start);
            const end = parseTime(booking.end);
            if (start === null || end === null) {
              return null;
            }
            const top = minuteToTopPx(start, dayMinutes);
            const height = Math.max(minuteToTopPx(end, dayMinutes) - top, 24);
            const isSelected = booking.id === selectedId;
            const isPastBooking =
              isPastDay || (showPastOverlay && end <= nowMinutes);
            const blockState = isSelected
              ? "selected"
              : isPastBooking
                ? "past"
                : "default";
            return (
              <Button
                key={booking.id}
                type="button"
                variant="ghost"
                size="xs"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(booking.id);
                }}
                aria-pressed={isSelected}
                aria-label={`Booking ${booking.start} to ${booking.end}${booking.title ? `: ${booking.title}` : ""}`}
                className={cn(bookingBlockVariants({ state: blockState }))}
                style={{ top, height }}
              >
                <span className="shrink-0 font-medium tabular-nums">
                  {booking.start}–{booking.end}
                </span>
                {booking.title && (
                  <span className="mt-0.5 line-clamp-2 truncate text-zinc-700 dark:text-zinc-300">
                    {booking.title}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
