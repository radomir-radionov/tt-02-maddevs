"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/bookings/calendar";
import {
  isPastDate,
  isValidDateString,
  localDateFromDateString,
  todayDateString,
} from "@/lib/bookings/time";

type DatePickerProps = {
  id: string;
  value: string;
  onCommit: (value: string) => void;
  now: Date;
};

export function DatePicker({ id, value, onCommit, now }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const committedPast = isValidDateString(value) && isPastDate(value, now);
  const selectedDate =
    value && isValidDateString(value)
      ? localDateFromDateString(value)
      : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }
    onCommit(todayDateString(date));
    setOpen(false);
  };

  return (
    <Field
      className="w-[11rem] shrink-0"
      data-past-date={committedPast ? "true" : undefined}
    >
      <FieldLabel htmlFor={id}>Date</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between font-normal tabular-nums",
                committedPast && "text-muted-foreground",
              )}
            />
          }
        >
          <span>{value ? formatDisplayDate(value) : "Pick a date"}</span>
          <CalendarIcon data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            modifiers={{
              past: (date) => isPastDate(todayDateString(date), now),
            }}
            modifiersClassNames={{
              past: "text-muted-foreground",
            }}
          />
          <div className="flex justify-end border-t p-2">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                handleSelect(localDateFromDateString(todayDateString(now)));
              }}
            >
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
