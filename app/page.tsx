import { Suspense } from "react";
import { BookingPageClient } from "@/components/bookings/booking-page";
import { BookingPageHeader } from "@/components/bookings/booking-page-header";
import { Spinner } from "@/components/ui/spinner";
import { getBookingNow } from "@/lib/bookings/clock";
import { listByDate } from "@/lib/bookings/store";
import { todayDateString } from "@/lib/bookings/time";
import { connection } from "next/server";

async function BookingPageData() {
  await connection();
  const serverNow = getBookingNow();
  const initialDate = todayDateString(serverNow);
  const initialBookings = listByDate(initialDate);

  return (
    <BookingPageClient
      initialDate={initialDate}
      initialBookings={initialBookings}
      serverNowIso={serverNow.toISOString()}
    />
  );
}

function BookingPageFallback() {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Loading bookings…
    </p>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <BookingPageHeader />
      <Suspense fallback={<BookingPageFallback />}>
        <BookingPageData />
      </Suspense>
    </main>
  );
}
