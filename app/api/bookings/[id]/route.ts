import { parseBookingPatch } from "@/lib/bookings/payload";
import {
  isStoreValidationError,
  removeBooking,
  updateBooking,
} from "@/lib/bookings/store";
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
  const parsed = parseBookingPatch(body);
  if (!parsed.ok) {
    return errorResponse(400, parsed.code, parsed.message);
  }
  try {
    const booking = updateBooking(id, parsed.patch);
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
