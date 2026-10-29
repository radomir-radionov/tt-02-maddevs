"use client";

import { useCallback } from "react";
import type { BookingFormValues } from "@/components/bookings/booking-form";
import {
  defaultBookingFormValues,
  type FormMode,
  type PageAction,
  type PageState,
} from "@/hooks/booking-page/page-state";
import type { Booking, BookingInput, BookingPatch } from "@/lib/bookings/types";
import type { Dispatch } from "react";

type UseBookingFormDialogOptions = {
  now: Date;
  page: PageState;
  dispatch: Dispatch<PageAction>;
  formMode: FormMode;
  bookings: readonly Booking[];
  selectedBooking: Booking | null;
  createBlocked: boolean;
  createBooking: (input: BookingInput) => Promise<void>;
  updateBooking: (id: string, patch: BookingPatch) => Promise<void>;
  clearMutationError: () => void;
};

export function useBookingFormDialog({
  now,
  page,
  dispatch,
  formMode,
  bookings,
  selectedBooking,
  createBlocked,
  createBooking,
  updateBooking,
  clearMutationError,
}: UseBookingFormDialogOptions) {
  const openCreateDialog = useCallback(() => {
    if (createBlocked) {
      return;
    }
    dispatch({
      type: "open_create",
      formValues: defaultBookingFormValues(page.committedDate, now, bookings),
    });
    clearMutationError();
  }, [
    createBlocked,
    page.committedDate,
    now,
    bookings,
    dispatch,
    clearMutationError,
  ]);

  const openEditDialog = useCallback(() => {
    if (!selectedBooking) {
      return;
    }
    dispatch({
      type: "open_edit",
      formValues: {
        start: selectedBooking.start,
        end: selectedBooking.end,
        title: selectedBooking.title ?? "",
      },
    });
    clearMutationError();
  }, [selectedBooking, dispatch, clearMutationError]);

  const closeFormDialog = useCallback(() => {
    dispatch({ type: "close_overlay" });
    clearMutationError();
  }, [dispatch, clearMutationError]);

  const setFormDialogOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        closeFormDialog();
      }
    },
    [closeFormDialog],
  );

  const handleSubmit = useCallback(
    async (values: BookingFormValues) => {
      dispatch({ type: "set_form_values", formValues: values });
      try {
        if (formMode === "create") {
          await createBooking({
            date: page.committedDate,
            start: values.start,
            end: values.end,
            title: values.title.trim() || undefined,
          });
          dispatch({
            type: "mutation_success",
            formValues: defaultBookingFormValues(
              page.committedDate,
              now,
              bookings,
            ),
          });
          clearMutationError();
        } else if (page.selectedId) {
          await updateBooking(page.selectedId, {
            start: values.start,
            end: values.end,
            title: values.title.trim() || undefined,
          });
          dispatch({ type: "close_overlay" });
          clearMutationError();
        }
      } catch {
        // mutationError in useBookings; dialog stays open
      }
    },
    [
      dispatch,
      formMode,
      page.committedDate,
      page.selectedId,
      createBooking,
      now,
      bookings,
      updateBooking,
      clearMutationError,
    ],
  );

  return {
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    setFormDialogOpen,
    handleSubmit,
  };
}
