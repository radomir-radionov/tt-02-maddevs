"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WORK_DAY_END_MINUTES,
  WORK_DAY_START_MINUTES,
} from "@/lib/bookings/constants";
import { formatMinutes } from "@/lib/bookings/time";
import { cn } from "@/lib/utils";

const VISIBLE_OPTIONS = 6;
/** ~6 SelectItem rows (py-1 + text-sm) then scroll */
const SELECT_LIST_CLASS = `max-h-[calc(1.75rem*${VISIBLE_OPTIONS}+0.5rem)]`;

type TimeSelectProps = {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function hoursBetween(minMinutes: number, maxMinutes: number): string[] {
  const hours: string[] = [];
  for (
    let hour = Math.floor(minMinutes / 60);
    hour <= Math.floor(maxMinutes / 60);
    hour += 1
  ) {
    hours.push(pad(hour));
  }
  return hours;
}

const WORK_DAY_HOURS = hoursBetween(
  WORK_DAY_START_MINUTES,
  WORK_DAY_END_MINUTES,
);

function minutesForHour(hour: string): string[] {
  const hourNumber = Number(hour);
  const from =
    hourNumber === Math.floor(WORK_DAY_START_MINUTES / 60)
      ? WORK_DAY_START_MINUTES % 60
      : 0;
  const to =
    hourNumber === Math.floor(WORK_DAY_END_MINUTES / 60)
      ? WORK_DAY_END_MINUTES % 60
      : 59;
  const minutes: string[] = [];
  for (let minute = from; minute <= to; minute += 1) {
    minutes.push(pad(minute));
  }
  return minutes;
}

function withCurrent(options: string[], current: string): string[] {
  if (!current || options.includes(current)) {
    return options;
  }
  return [...options, current].sort();
}

type PartSelectProps = {
  id?: string;
  "aria-label"?: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
};

function PartSelect({
  id,
  "aria-label": ariaLabel,
  value,
  options,
  disabled,
  onChange,
}: PartSelectProps) {
  return (
    <Select
      value={value || undefined}
      disabled={disabled || options.length === 0}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next);
        }
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className="w-full min-w-0 flex-1"
      >
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent
        className="max-h-none"
        listClassName={SELECT_LIST_CLASS}
        alignItemWithTrigger={false}
        side="bottom"
      >
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TimeSelect({
  id,
  value,
  disabled = false,
  onChange,
  className,
}: TimeSelectProps) {
  const [hour = "", minute = ""] = value.split(":");

  const hours = withCurrent(WORK_DAY_HOURS, hour);
  const minutes = withCurrent(hour ? minutesForHour(hour) : [], minute);

  function commit(nextHour: string, nextMinute: string) {
    const allowedMinutes = minutesForHour(nextHour);
    const minuteValue = allowedMinutes.includes(nextMinute)
      ? nextMinute
      : (allowedMinutes[0] ?? nextMinute);
    if (!nextHour || !minuteValue) {
      return;
    }
    onChange(formatMinutes(Number(nextHour) * 60 + Number(minuteValue)));
  }

  return (
    <div className={cn("flex w-full gap-1", className)}>
      <PartSelect
        id={id}
        value={hour}
        options={hours}
        disabled={disabled}
        onChange={(nextHour) => {
          commit(nextHour, minute);
        }}
      />
      <PartSelect
        aria-label="Minutes"
        value={minute}
        options={minutes}
        disabled={disabled}
        onChange={(nextMinute) => {
          commit(hour, nextMinute);
        }}
      />
    </div>
  );
}
