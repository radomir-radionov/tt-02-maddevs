import { subscribeBookingsChanged } from "@/lib/bookings/events";
import { isValidDateString } from "@/lib/bookings/time";
import { NextResponse } from "next/server";

const HEARTBEAT_MS = 25_000;

function errorResponse(
  status: number,
  error: string,
  message: string,
): NextResponse {
  return NextResponse.json({ error, message }, { status });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return errorResponse(400, "MISSING_DATE", "Query parameter date is required.");
  }
  if (!isValidDateString(date)) {
    return errorResponse(400, "INVALID_DATE", "Invalid date format.");
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (payload: string) => {
        if (closed) {
          return;
        }
        controller.enqueue(encoder.encode(payload));
      };

      const sendEvent = (event: string, data: unknown) => {
        send(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent("ready", { date });

      const unsubscribe = subscribeBookingsChanged(date, () => {
        sendEvent("bookings-changed", { date });
      });

      const heartbeat = setInterval(() => {
        send(": heartbeat\n\n");
      }, HEARTBEAT_MS);

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
