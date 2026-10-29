import type { Booking, BookingInput, BookingPatch } from "@/lib/bookings/types";

export class BookingApiError extends Error {
  readonly status: number;
  readonly error: string;

  constructor(status: number, error: string, message: string) {
    super(message);
    this.name = "BookingApiError";
    this.status = status;
    this.error = error;
  }
}

type ErrorBody = {
  error?: string;
  message?: string;
};

async function parseError(response: Response): Promise<BookingApiError> {
  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    body = {};
  }
  return new BookingApiError(
    response.status,
    body.error ?? "REQUEST_FAILED",
    body.message ?? response.statusText,
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function listBookings(date: string): Promise<Booking[]> {
  const params = new URLSearchParams({ date });
  return request<Booking[]>(`/api/bookings?${params.toString()}`);
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBooking(
  id: string,
  patch: BookingPatch,
): Promise<Booking> {
  return request<Booking>(`/api/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  await request<void>(`/api/bookings/${id}`, { method: "DELETE" });
}

type BookingsStreamEvent =
  | { type: "ready"; date: string }
  | { type: "bookings-changed"; date: string };

function parseStreamPayload(
  eventType: string,
  raw: string,
): BookingsStreamEvent | null {
  try {
    const data = JSON.parse(raw) as { date?: string };
    if (typeof data.date !== "string") {
      return null;
    }
    if (eventType === "ready") {
      return { type: "ready", date: data.date };
    }
    if (eventType === "bookings-changed") {
      return { type: "bookings-changed", date: data.date };
    }
    return null;
  } catch {
    return null;
  }
}

/** Live updates for a date (SSE). Returns unsubscribe. */
export function subscribeBookingsStream(
  date: string,
  onEvent: (event: BookingsStreamEvent) => void,
): () => void {
  const params = new URLSearchParams({ date });
  const source = new EventSource(`/api/bookings/stream?${params.toString()}`);

  source.addEventListener("ready", (event) => {
    const messageEvent = event as MessageEvent<string>;
    const parsed = parseStreamPayload("ready", messageEvent.data);
    if (parsed) {
      onEvent(parsed);
    }
  });

  source.addEventListener("bookings-changed", (event) => {
    const messageEvent = event as MessageEvent<string>;
    const parsed = parseStreamPayload("bookings-changed", messageEvent.data);
    if (parsed) {
      onEvent(parsed);
    }
  });

  return () => {
    source.close();
  };
}
