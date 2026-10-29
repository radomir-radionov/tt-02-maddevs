import type { ReactNode } from "react";

type StatusBannerProps = {
  loadStatus: "idle" | "loading" | "error";
  loadError: string | null;
  mutationError: string | null;
  onRetry: () => void;
};

export function StatusBanner({
  loadStatus,
  loadError,
  mutationError,
  onRetry,
}: StatusBannerProps) {
  const items: ReactNode[] = [];

  if (loadStatus === "error" && loadError) {
    items.push(
      <div
        key="load-error"
        role="alert"
        className="flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
      >
        <span>{loadError}</span>
        <button
          type="button"
          onClick={onRetry}
          className="rounded underline focus-visible:outline-offset-2"
        >
          Retry
        </button>
      </div>,
    );
  }

  if (mutationError) {
    items.push(
      <p
        key="mutation-error"
        role="alert"
        aria-live="polite"
        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
      >
        {mutationError}
      </p>,
    );
  }

  if (items.length === 0) {
    return null;
  }

  return <div className="flex flex-col gap-2">{items}</div>;
}
