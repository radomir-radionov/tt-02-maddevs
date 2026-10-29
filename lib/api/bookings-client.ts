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

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
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
