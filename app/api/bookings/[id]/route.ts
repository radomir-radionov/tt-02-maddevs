import {
  isStoreValidationError,
  removeBooking,
  updateBooking,
} from "@/lib/bookings/store";
import type { BookingPatch } from "@/lib/bookings/types";
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }
  if (!body || typeof body !== "object") {
    return errorResponse(400, "INVALID_BODY", "Invalid patch payload.");
  }
  try {
    const booking = updateBooking(id, body as BookingPatch);
    return NextResponse.json(booking);
  } catch (err) {
    if (isStoreValidationError(err)) {
      return errorResponse(validationStatus(err.code), err.code, err.message);
    }
    return errorResponse(500, "INTERNAL", "Failed to update booking.");
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { id } = await context.params;
  try {
    removeBooking(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (isStoreValidationError(err)) {
      return errorResponse(validationStatus(err.code), err.code, err.message);
    }
    return errorResponse(500, "INTERNAL", "Failed to delete booking.");
  }
}
