import type { Booking } from "@/lib/bookings/types";
import { Button } from "@/components/ui/button";

type BookingListProps = {
  bookings: readonly Booking[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
};

export function BookingList({
  bookings,
  selectedId,
  isLoading,
  onSelect,
}: BookingListProps) {
  if (isLoading && bookings.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Loading bookings…
      </p>
    );
  }

  if (bookings.length === 0) {
    return null;
  }

  return (
    <section aria-label="Bookings list" className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        List
      </h2>
      <ul className="flex flex-col gap-1">
        {bookings.map((booking) => {
          const isSelected = booking.id === selectedId;
          return (
            <li key={booking.id}>
              <Button
                type="button"
                variant="unstyled"
                onClick={() => onSelect(booking.id)}
                aria-pressed={isSelected}
                className={`w-full justify-start rounded-md border px-3 py-2 text-left text-sm ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-400 dark:bg-blue-950/60"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-medium tabular-nums">
                  {booking.start}–{booking.end}
                </span>
                {booking.title ? (
                  <span className="ml-2 truncate text-zinc-600 dark:text-zinc-400">
                    {booking.title}
                  </span>
                ) : null}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
