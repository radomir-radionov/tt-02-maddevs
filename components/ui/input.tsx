import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

export function fieldControlClasses(disabled?: boolean): string {
  return cn(
    "rounded-md border text-sm",
    disabled
      ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
      : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100",
  );
}

export type InputProps = ComponentProps<"input">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, disabled, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "booking-field-text",
          fieldControlClasses(disabled),
          className,
        )}
        {...props}
      />
    );
  },
);
