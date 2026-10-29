"use client";

import { useId, useState } from "react";
import {
  canCreateOnDate,
  getAvailableEndOptions,
  getAvailableStartOptions,
  type SlotPickerContext,
} from "@/lib/bookings/slot-options";
import { TimeSelect } from "@/components/bookings/time-select";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

  const slotCtx: SlotPickerContext = {
    date,
    now,
    mode,
    existing: existingBookings,
    excludeId: editingId ?? undefined,
  };

  const noStartSlots = getAvailableStartOptions(slotCtx).length === 0;
  const noEndSlots =
    !start || getAvailableEndOptions(start, slotCtx).length === 0;

  const createDisabled = mode === "create" && !canCreateOnDate(date, now);
  const noSlots = mode === "create" && (createDisabled || noStartSlots);
  const fieldsDisabled = submitting || noSlots;

  function validateFields(startValue: string, endValue: string): boolean {
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
  }

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
      noValidate
    >
      <FieldGroup className="gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-4 overflow-visible">
          <Field className="w-[12rem] shrink-0 overflow-visible">
            <FieldLabel htmlFor={startId}>Start</FieldLabel>
            <TimeSelect
              id={startId}
              value={start}
              onChange={handleStartChange}
              disabled={fieldsDisabled || (mode === "create" && noStartSlots)}
            />
          </Field>
          <Field className="w-[12rem] shrink-0 overflow-visible">
            <FieldLabel htmlFor={endId}>End</FieldLabel>
            <TimeSelect
              id={endId}
              value={end}
              onChange={handleEndChange}
              disabled={fieldsDisabled || (mode === "create" && noEndSlots)}
            />
          </Field>
        </div>
        <Field className="max-w-[18rem]">
          <FieldLabel htmlFor={titleId}>Title (optional)</FieldLabel>
          <Input
            id={titleId}
            value={title}
            onChange={(e) => {
              onFieldChange?.();
              setTitle(e.target.value);
            }}
            disabled={fieldsDisabled}
            className="max-w-full"
            placeholder="Meeting title"
          />
        </Field>
        {noSlots ? (
          <Field data-invalid>
            <FieldError className="max-w-[18rem]">
              No time left to book on this date.
            </FieldError>
          </Field>
        ) : errorMessage ? (
          <Field data-invalid>
            <FieldError className="max-w-[18rem]">{errorMessage}</FieldError>
          </Field>
        ) : null}
      </FieldGroup>
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={submitting || noSlots || !start || !end}
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create"
              : "Save changes"}
        </Button>
        {onCancelEdit ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={submitting}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
