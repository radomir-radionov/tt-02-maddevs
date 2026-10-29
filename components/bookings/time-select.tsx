"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VISIBLE_OPTIONS = 5;
const OPTION_HEIGHT_REM = 2.5;

type TimeSelectProps = {
  id: string;
  value: string;
  options: readonly string[];
  disabled?: boolean;
  isOptionDisabled?: (option: string) => boolean;
  onChange: (value: string) => void;
  className?: string;
};

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none h-3.5 w-3.5 shrink-0 text-zinc-500"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function TimeSelect({
  id,
  value,
  options,
  disabled = false,
  isOptionDisabled,
  onChange,
  className = "",
}: TimeSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [listPosition, setListPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const listboxId = useId();

  const updateListPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    setListPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updateListPosition();
    window.addEventListener("resize", updateListPosition);
    window.addEventListener("scroll", updateListPosition, true);
    return () => {
      window.removeEventListener("resize", updateListPosition);
      window.removeEventListener("scroll", updateListPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) {
        return;
      }
      if (listRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) {
      return;
    }
    const selected = listRef.current.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    selected?.scrollIntoView({ block: "nearest" });
  }, [open, value]);

  const commit = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) {
      return;
    }
    const index = options.indexOf(value);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      for (let i = index + 1; i < options.length; i += 1) {
        const next = options[i];
        if (next && !isOptionDisabled?.(next)) {
          commit(next);
          return;
        }
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      for (let i = index - 1; i >= 0; i -= 1) {
        const next = options[i];
        if (next && !isOptionDisabled?.(next)) {
          commit(next);
          return;
        }
      }
    }
  };

  const listMaxHeight = `${VISIBLE_OPTIONS * OPTION_HEIGHT_REM}rem`;

  return (
    <div ref={rootRef} className="relative w-[6.25rem] max-w-full shrink-0">
      <Button
        ref={triggerRef}
        id={id}
        type="button"
        variant="unstyled"
        disabled={disabled || options.length === 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled && options.length > 0) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "booking-time-select w-full items-center justify-between gap-1.5 text-left font-normal",
          className,
        )}
      >
        <span className="truncate tabular-nums">
          {options.length === 0 ? "—" : value}
        </span>
        <ChevronDownIcon />
      </Button>
      {open && options.length > 0 && listPosition ? (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Time options"
          className="fixed z-[200] overflow-y-auto rounded-md border border-zinc-300 bg-white py-1 shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
          style={{
            top: listPosition.top,
            left: listPosition.left,
            width: listPosition.width,
            maxHeight: listMaxHeight,
          }}
        >
          {options.map((option) => {
            const isSelected = option === value;
            const optionDisabled = isOptionDisabled?.(option) ?? false;
            return (
              <li key={option} role="presentation">
                <Button
                  type="button"
                  role="option"
                  variant="ghost"
                  disabled={optionDisabled}
                  data-selected={isSelected ? "true" : undefined}
                  aria-selected={isSelected}
                  aria-disabled={optionDisabled}
                  onClick={() => {
                    if (!optionDisabled) {
                      commit(option);
                    }
                  }}
                  className={cn(
                    "h-10 w-full justify-start rounded-none px-2.5 font-normal tabular-nums disabled:text-zinc-400 dark:disabled:text-zinc-500",
                    optionDisabled ? "opacity-50" : undefined,
                    isSelected
                      ? "bg-blue-50 font-medium text-blue-900 hover:bg-blue-50 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/50"
                      : "text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  {option}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
