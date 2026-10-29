"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/bookings/booking-dialog";
import {
  BookingForm,
  type BookingFormValues,
} from "@/components/bookings/booking-form";
import { BookingList } from "@/components/bookings/booking-list";
import { BookingTimeline } from "@/components/bookings/booking-timeline";
import { BookingToolbar } from "@/components/bookings/booking-toolbar";
import { DatePicker } from "@/components/bookings/date-picker";
import { StatusBanner } from "@/components/bookings/status-banner";
import { useBookings } from "@/hooks/use-bookings";
import { useClientNow } from "@/hooks/use-client-now";
import { defaultBookingTimes } from "@/lib/bookings/slot-options";
import { WORK_DAY_END, WORK_DAY_START } from "@/lib/bookings/constants";
import { isPastDate, todayDateString } from "@/lib/bookings/time";
import type { Booking } from "@/lib/bookings/types";

type FormMode = "create" | "edit";

function defaultFormValues(
  date: string,
  now: Date,
  existing: readonly Booking[],
): BookingFormValues {
  const { start, end } = defaultBookingTimes(date, now, existing);
  return { start, end, title: "" };
}

export function BookingPage() {
  const now = useClientNow();
  const [committedDate, setCommittedDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<BookingFormValues>({
    start: "09:00",
    end: "09:30",
    title: "",
  });

  useEffect(() => {
    if (!now) {
      return;
    }
    const today = todayDateString(now);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client date bootstrap
    setCommittedDate(today);
    setFormValues(defaultFormValues(today, now, []));
  }, [now]);

  const {
    bookings,
    loadStatus,
    loadError,
    submitting,
    mutationError,
    refetch,
    createBooking,
    updateBooking,
    deleteBooking,
    clearMutationError,
  } = useBookings(committedDate);

  const selectedBooking = bookings.find((b) => b.id === selectedId) ?? null;

  const createBlocked =
    now !== null && committedDate !== "" && isPastDate(committedDate, now);

  function handleDateCommit(next: string) {
    setCommittedDate(next);
    setSelectedId(null);
    setDialogOpen(false);
    setDeleteConfirmOpen(false);
    setFormMode("create");
    if (now) {
      setFormValues(defaultFormValues(next, now, bookings));
    }
    clearMutationError();
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setDeleteConfirmOpen(false);
    clearMutationError();
  }

  function handleClearSelection() {
    if (dialogOpen || deleteConfirmOpen) {
      return;
    }
    setSelectedId(null);
    setDeleteConfirmOpen(false);
  }

  function openCreateDialog() {
    if (!now || createBlocked) {
      return;
    }
    setFormMode("create");
    setSelectedId(null);
    setFormValues(defaultFormValues(committedDate, now, bookings));
    clearMutationError();
    setDialogOpen(true);
  }

  function openEditDialog() {
    if (!selectedBooking || !now) {
      return;
    }
    setFormMode("edit");
    setFormValues({
      start: selectedBooking.start,
      end: selectedBooking.end,
      title: selectedBooking.title ?? "",
    });
    clearMutationError();
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    clearMutationError();
  }

  async function handleSubmit(values: BookingFormValues) {
    setFormValues(values);
    try {
      if (formMode === "create") {
        await createBooking({
          date: committedDate,
          start: values.start,
          end: values.end,
          title: values.title.trim() || undefined,
        });
        setDialogOpen(false);
        clearMutationError();
        if (now) {
          setFormValues(defaultFormValues(committedDate, now, bookings));
        }
      } else if (selectedId) {
        await updateBooking(selectedId, {
          start: values.start,
          end: values.end,
          title: values.title.trim() || undefined,
        });
        setDialogOpen(false);
        clearMutationError();
      }
    } catch {
      // mutationError + refetch in hook; dialog stays open; formValues synced above
    }
  }

  function openDeleteConfirm() {
    if (!selectedId) {
      return;
    }
    clearMutationError();
    setDeleteConfirmOpen(true);
  }

  function closeDeleteConfirm() {
    if (submitting) {
      return;
    }
    setDeleteConfirmOpen(false);
  }

  async function handleDeleteConfirm() {
    if (!selectedId || !now || !selectedBooking) {
      return;
    }
    try {
      await deleteBooking(selectedId);
      setSelectedId(null);
      setDialogOpen(false);
      setDeleteConfirmOpen(false);
      clearMutationError();
      setFormValues(defaultFormValues(committedDate, now, bookings));
    } catch {
      setDeleteConfirmOpen(false);
    }
  }

  if (!now) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <p className="text-sm text-zinc-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Meeting room booking
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Work day {WORK_DAY_START}–{WORK_DAY_END}. Select a date to view the
          timeline.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <DatePicker
          id="booking-date"
          value={committedDate}
          onCommit={handleDateCommit}
          now={now}
        />
        <BookingToolbar
          selectedId={selectedId}
          submitting={submitting}
          createDisabled={createBlocked}
          mutationsAllowed={selectedId !== null}
          onNew={openCreateDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteConfirm}
        />
      </div>

      <StatusBanner
        loadStatus={loadStatus}
        loadError={loadError}
        mutationError={dialogOpen ? null : mutationError}
        onRetry={() => void refetch()}
      />

      {committedDate ? (
        <BookingTimeline
          date={committedDate}
          now={now}
          bookings={bookings}
          selectedId={selectedId}
          onSelect={handleSelect}
          onClearSelection={handleClearSelection}
          isLoading={loadStatus === "loading"}
          className={
            dialogOpen || deleteConfirmOpen ? "pointer-events-none" : undefined
          }
        />
      ) : null}

      {committedDate ? (
        <BookingList
          bookings={bookings}
          selectedId={selectedId}
          isLoading={loadStatus === "loading"}
          onSelect={handleSelect}
        />
      ) : null}

      <BookingDialog
        open={dialogOpen}
        title={formMode === "create" ? "New booking" : "Edit booking"}
        onClose={closeDialog}
      >
        {committedDate ? (
          <BookingForm
            key={`${formMode}-${selectedId ?? "new"}-${committedDate}`}
            date={committedDate}
            mode={formMode}
            existingBookings={bookings}
            editingId={formMode === "edit" ? selectedId : null}
            initialValues={formValues}
            submitting={submitting}
            serverError={mutationError}
            now={now}
            onSubmit={handleSubmit}
            onCancelEdit={closeDialog}
            onFieldChange={clearMutationError}
          />
        ) : null}
      </BookingDialog>

      <BookingDialog
        open={deleteConfirmOpen}
        title="Delete booking?"
        onClose={closeDeleteConfirm}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Are you sure you want to delete this booking?
          </p>
          {selectedBooking ? (
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {selectedBooking.start}–{selectedBooking.end}
              {selectedBooking.title ? `: ${selectedBooking.title}` : ""}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteConfirm()}
              disabled={submitting}
            >
              {submitting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteConfirm}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BookingDialog>
    </main>
  );
}
