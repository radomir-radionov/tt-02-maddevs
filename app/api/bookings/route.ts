import {
  createBooking,
  isStoreValidationError,
  listByDate,
} from "@/lib/bookings/store";
import { isValidDateString } from "@/lib/bookings/time";
import type { BookingInput } from "@/lib/bookings/types";
import { NextResponse } from "next/server";

function errorResponse(
  status: number,
  error: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error, message }, { status });
}

function validationStatus(code: string): number {
  if (code === "CONFLICT") {
    return 409;
  }
  if (code === "NOT_FOUND") {
    return 404;
  }
  return 400;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return errorResponse(400, "MISSING_DATE", "Query parameter date is required.");
  }
  if (!isValidDateString(date)) {
    return errorResponse(400, "INVALID_DATE", "Invalid date format.");
  }
  return NextResponse.json(listByDate(date));
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }
  if (!body || typeof body !== "object") {
    return errorResponse(400, "INVALID_BODY", "Invalid booking payload.");
  }
  const input = body as BookingInput;
  try {
    const booking = createBooking(input);
    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (isStoreValidationError(err)) {
      return errorResponse(validationStatus(err.code), err.code, err.message);
    }
    return errorResponse(500, "INTERNAL", "Failed to create booking.");
  }
}
