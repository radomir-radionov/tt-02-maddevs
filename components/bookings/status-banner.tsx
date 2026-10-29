import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
      <Alert key="load-error" variant="destructive">
        <AlertDescription className="flex flex-wrap items-center gap-2">
          <span>{loadError}</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={onRetry}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>,
    );
  }

  if (mutationError) {
    items.push(
      <Alert key="mutation-error" variant="warning">
        <AlertDescription>{mutationError}</AlertDescription>
      </Alert>,
    );
  }

  if (items.length === 0) {
    return null;
  }

  return <div className="flex flex-col gap-2">{items}</div>;
}
