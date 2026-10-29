"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
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
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close dialog"
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
