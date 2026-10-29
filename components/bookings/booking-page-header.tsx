import { WORK_DAY_END, WORK_DAY_START } from "@/lib/bookings/constants";

export function BookingPageHeader() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Meeting room booking
      </h1>
      <p className="text-sm text-muted-foreground">
        Work day {WORK_DAY_START}–{WORK_DAY_END}. Select a date to view the
        timeline.
      </p>
    </header>
  );
}
