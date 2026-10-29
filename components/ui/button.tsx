import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700",
  outline:
    "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50",
  destructiveOutline:
    "border border-red-300 bg-white text-red-800 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-200 dark:hover:bg-red-950/40",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50",
  link: "text-blue-600 underline-offset-2 hover:underline dark:text-blue-400 disabled:opacity-50",
  unstyled: "",
} as const;

const sizeStyles = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-2 text-sm",
  xs: "px-1.5 py-1 text-xs",
  icon: "px-2 py-1 text-sm",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) {
    const resolvedSize =
      variant === "link" && size === "default"
        ? undefined
        : variant === "unstyled"
          ? undefined
          : sizeStyles[size];

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-offset-2 disabled:cursor-not-allowed",
          variantStyles[variant],
          resolvedSize,
          className,
        )}
        {...props}
      />
    );
  },
);
