"use client";

import { useCallback } from "react";
import {
  defaultBookingFormValues,
  type PageAction,
  type PageState,
} from "@/hooks/booking-page/page-state";
import type { Booking } from "@/lib/bookings/types";
import type { Dispatch } from "react";

type UseBookingDeleteDialogOptions = {
  now: Date;
  page: PageState;
  dispatch: Dispatch<PageAction>;
  bookings: readonly Booking[];
  selectedBooking: Booking | null;
  submitting: boolean;
  deleteBooking: (id: string) => Promise<void>;
  clearMutationError: () => void;
};

export function useBookingDeleteDialog({
  now,
  page,
  dispatch,
  bookings,
  selectedBooking,
  submitting,
  deleteBooking,
  clearMutationError,
}: UseBookingDeleteDialogOptions) {
  const openDeleteConfirm = useCallback(() => {
    if (!page.selectedId) {
      return;
    }
    clearMutationError();
    dispatch({ type: "open_delete" });
  }, [page.selectedId, dispatch, clearMutationError]);

  const closeDeleteConfirm = useCallback(() => {
    if (submitting) {
      return;
    }
    dispatch({ type: "close_overlay" });
  }, [submitting, dispatch]);

  const setDeleteDialogOpen = useCallback(
    (open: boolean) => {
      if (open) {
        openDeleteConfirm();
      } else {
        closeDeleteConfirm();
      }
    },
    [openDeleteConfirm, closeDeleteConfirm],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!page.selectedId || !selectedBooking) {
      return;
    }
    const selectedId = page.selectedId;

    try {
      await deleteBooking(selectedId);
      dispatch({
        type: "mutation_success",
        formValues: defaultBookingFormValues(page.committedDate, now, bookings),
      });
      clearMutationError();
    } catch {
      dispatch({ type: "close_overlay" });
    }
  }, [
    page.selectedId,
    page.committedDate,
    selectedBooking,
    deleteBooking,
    dispatch,
    now,
    bookings,
    clearMutationError,
  ]);

  return {
    openDeleteConfirm,
    closeDeleteConfirm,
    setDeleteDialogOpen,
    handleDeleteConfirm,
  };
}
