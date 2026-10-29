"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type BookingDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function BookingDialog({
  open,
  title,
  onClose,
  children,
}: BookingDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const requestClose = () => {
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="booking-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(event.target as Node)
        ) {
          requestClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="box-border w-fit max-w-[min(calc(100vw-2rem),22rem)] shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between gap-6 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={requestClose}
            aria-label="Close dialog"
          >
            Close
          </Button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
