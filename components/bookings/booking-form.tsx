"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  getAvailableEndOptions,
  getAvailableStartOptions,
  mergeTimeOption,
  type SlotPickerContext,
} from "@/lib/bookings/slot-options";
import { TimeSelect } from "@/components/bookings/time-select";
import { isPastDate } from "@/lib/bookings/time";
import { validateBooking } from "@/lib/bookings/validate";
import type { Booking, BookingInput } from "@/lib/bookings/types";

export type BookingFormValues = {
  start: string;
  end: string;
  title: string;
};

type BookingFormProps = {
  date: string;
  mode: "create" | "edit";
  existingBookings: Booking[];
  editingId: string | null;
  initialValues: BookingFormValues;
  submitting: boolean;
  serverError: string | null;
  now: Date;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  onCancelEdit?: () => void;
  onFieldChange?: () => void;
};

export function BookingForm({
  date,
  mode,
  existingBookings,
  editingId,
  initialValues,
  submitting,
  serverError,
  now,
  onSubmit,
  onCancelEdit,
  onFieldChange,
}: BookingFormProps) {
  const startId = useId();
  const endId = useId();
  const titleId = useId();

  const [start, setStart] = useState(initialValues.start);
  const [end, setEnd] = useState(initialValues.end);
  const [title, setTitle] = useState(initialValues.title);
  const [clientHint, setClientHint] = useState<string | null>(null);

  const slotCtx = useMemo<SlotPickerContext>(
    () => ({
      date,
      now,
      mode,
      existing: existingBookings,
      excludeId: editingId ?? undefined,
    }),
    [date, editingId, existingBookings, mode, now],
  );

  const startOptions = useMemo(
    () => mergeTimeOption(getAvailableStartOptions(slotCtx), start),
    [slotCtx, start],
  );
  const endOptions = useMemo(
    () => mergeTimeOption(getAvailableEndOptions(start, slotCtx), end),
    [end, slotCtx, start],
  );

  const createDisabled = mode === "create" && isPastDate(date, now);
  const fieldsDisabled = submitting || createDisabled;

  const disabledFieldClass = fieldsDisabled
    ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
    : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900";

  const fieldClass = `rounded-md border text-sm ${disabledFieldClass}`;

  const validateFields = useCallback(
    (startValue: string, endValue: string): boolean => {
      const payload: BookingInput = {
        date,
        start: startValue,
        end: endValue,
        title: title.trim() || undefined,
      };
      const result = validateBooking(payload, existingBookings, {
        mode: mode === "edit" ? "update" : "create",
        excludeId: editingId ?? undefined,
        now,
      });
      if (!result.ok) {
        setClientHint(result.message);
        return false;
      }
      setClientHint(null);
      return true;
    },
    [date, editingId, existingBookings, mode, now, title],
  );

  useEffect(() => {
    if (serverError) {
      setClientHint(null);
    }
  }, [serverError]);

  const handleStartChange = (value: string) => {
    onFieldChange?.();
    setStart(value);
    validateFields(value, end);
  };

  const handleEndChange = (value: string) => {
    onFieldChange?.();
    setEnd(value);
    validateFields(start, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields(start, end)) {
      return;
    }
    await onSubmit({
      start,
      end,
      title,
    });
  };

  const errorMessage = serverError ?? clientHint;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-fit max-w-full flex-col gap-4"
      aria-label={mode === "create" ? "Create booking" : "Edit booking"}
    >
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="flex w-[6.25rem] shrink-0 flex-col gap-1">
          <label htmlFor={startId} className="text-sm font-medium">
            Start
          </label>
          <TimeSelect
            id={startId}
            value={start}
            options={startOptions}
            onChange={handleStartChange}
            disabled={fieldsDisabled || startOptions.length === 0}
            className={fieldClass}
          />
        </div>
        <div className="flex w-[6.25rem] shrink-0 flex-col gap-1">
          <label htmlFor={endId} className="text-sm font-medium">
            End
          </label>
          <TimeSelect
            id={endId}
            value={end}
            options={endOptions}
            onChange={handleEndChange}
            disabled={fieldsDisabled || endOptions.length === 0}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="flex max-w-[18rem] flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          Title (optional)
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => {
            onFieldChange?.();
            setTitle(e.target.value);
          }}
          disabled={fieldsDisabled}
          className={`booking-field-text w-full ${fieldClass}`}
          placeholder="Meeting title"
        />
      </div>
      {errorMessage ? (
        <p
          role="alert"
          aria-live="polite"
          className="max-w-[18rem] text-sm text-red-700 dark:text-red-300"
        >
          {errorMessage}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting || createDisabled}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create"
              : "Save changes"}
        </button>
        {onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={submitting}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
