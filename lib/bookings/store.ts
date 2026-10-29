import { validateBooking } from "./validate";
import { addDaysToDateString, todayDateString } from "./time";
import type { Booking, BookingInput, BookingPatch } from "./types";

type BookingsGlobal = typeof globalThis & {
  __meetingRoomBookings?: Booking[];
};

function bookingsStore(): Booking[] {
  const globalStore = globalThis as BookingsGlobal;
  if (!globalStore.__meetingRoomBookings) {
    globalStore.__meetingRoomBookings = [];
    seedDemoBookings(globalStore.__meetingRoomBookings);
  }
  return globalStore.__meetingRoomBookings;
}

function seedDemoBookings(bookings: Booking[]): void {
  if (bookings.length > 0) {
    return;
  }
  const now = new Date();
  const today = todayDateString(now);
  const yesterday = addDaysToDateString(now, -1);
  const twoDaysAgo = addDaysToDateString(now, -2);

  bookings.push(
    {
      id: crypto.randomUUID(),
      date: today,
      start: "10:00",
      end: "11:00",
      title: "Team sync",
    },
    {
      id: crypto.randomUUID(),
      date: today,
      start: "14:00",
      end: "15:30",
      title: "Interview",
    },
    {
      id: crypto.randomUUID(),
      date: yesterday,
      start: "11:00",
      end: "12:00",
      title: "Design review",
    },
    {
      id: crypto.randomUUID(),
      date: yesterday,
      start: "15:00",
      end: "16:00",
      title: "Client call",
    },
    {
      id: crypto.randomUUID(),
      date: twoDaysAgo,
      start: "09:30",
      end: "10:30",
      title: "Sprint planning",
    },
    {
      id: crypto.randomUUID(),
      date: twoDaysAgo,
      start: "13:00",
      end: "14:30",
      title: "Workshop",
    },
  );
}

export function listByDate(date: string): Booking[] {
  const bookings = bookingsStore();
  return bookings
    .filter((b) => b.date === date)
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function findById(id: string): Booking | undefined {
  return bookingsStore().find((b) => b.id === id);
}

export function createBooking(input: BookingInput): Booking {
  const bookings = bookingsStore();
  const result = validateBooking(input, bookings, { mode: "create" });
  if (!result.ok) {
    throw result;
  }
  const booking: Booking = {
    id: crypto.randomUUID(),
    date: input.date,
    start: input.start,
    end: input.end,
    title: input.title?.trim() || undefined,
  };
  bookings.push(booking);
  return booking;
}

export function updateBooking(id: string, patch: BookingPatch): Booking {
  const bookings = bookingsStore();
  const current = findById(id);
  if (!current) {
    throw {
      ok: false as const,
      code: "NOT_FOUND",
      message: "Booking not found.",
    };
  }
  const next: BookingInput = {
    date: patch.date ?? current.date,
    start: patch.start ?? current.start,
    end: patch.end ?? current.end,
    title: patch.title !== undefined ? patch.title : current.title,
  };
  const result = validateBooking(next, bookings, {
    mode: "update",
    excludeId: id,
  });
  if (!result.ok) {
    throw result;
  }
  const updated: Booking = {
    id,
    date: next.date,
    start: next.start,
    end: next.end,
    title: next.title?.trim() || undefined,
  };
  const index = bookings.findIndex((b) => b.id === id);
  bookings[index] = updated;
  return updated;
}

export function removeBooking(id: string): void {
  const bookings = bookingsStore();
  const current = findById(id);
  if (!current) {
    throw {
      ok: false as const,
      code: "NOT_FOUND",
      message: "Booking not found.",
    };
  }
  const index = bookings.findIndex((b) => b.id === id);
  bookings.splice(index, 1);
}

export type StoreValidationError = { ok: false; code: string; message: string };

export function isStoreValidationError(
  value: unknown,
): value is StoreValidationError {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    (value as StoreValidationError).ok === false &&
    "code" in value &&
    "message" in value
  );
}
