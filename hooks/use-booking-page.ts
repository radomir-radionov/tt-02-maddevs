"use client";

import { useEffect } from "react";
import { useBookingDeleteDialog } from "@/hooks/booking-page/use-booking-delete-dialog";
import { useBookingFormDialog } from "@/hooks/booking-page/use-booking-form-dialog";
import { useBookingTimeline } from "@/hooks/booking-page/use-booking-timeline";
import {
  defaultBookingFormValues,
  type BookingPageClientProps,
} from "@/hooks/booking-page/page-state";
import { useBookingPageState } from "@/hooks/booking-page/use-page-state";
import { useBookings } from "@/hooks/use-bookings";
import { useClientNow } from "@/hooks/use-client-now";
import { canCreateOnDate } from "@/lib/bookings/slot-options";
import { todayDateString } from "@/lib/bookings/time";

export type { BookingPageClientProps } from "@/hooks/booking-page/page-state";

export function useBookingPage(props: BookingPageClientProps) {
  const { initialDate, initialBookings, serverNowIso } = props;
  const now = useClientNow(serverNowIso);

  const state = useBookingPageState(props);
  const {
    dispatch,
    committedDate,
    page,
    selectedId,
    formMode,
    formValues,
    formOpen,
    deleteOpen,
    timelineLocked,
  } = state;

  useEffect(() => {
    const today = todayDateString(now);
    if (today !== initialDate && committedDate === initialDate) {
      dispatch({
        type: "sync_client_today",
        date: today,
        formValues: defaultBookingFormValues(today, now, [...initialBookings]),
      });
    }
  }, [now, initialDate, initialBookings, committedDate, dispatch]);

  const {
    bookings,
    loadStatus,
    loadError,
    submitting,
    mutationError,
    refetch,
    createBooking,
    updateBooking,
    deleteBooking,
    clearMutationError,
  } = useBookings(committedDate, {
    initial: { date: initialDate, bookings: initialBookings },
  });

  const selectedBooking = bookings.find((b) => b.id === selectedId) ?? null;

  const createBlocked =
    committedDate === "" || !canCreateOnDate(committedDate, now);

  const timeline = useBookingTimeline({
    now,
    dispatch,
    bookings,
    timelineLocked,
    clearMutationError,
  });

  const formDialog = useBookingFormDialog({
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
  });

  const deleteDialog = useBookingDeleteDialog({
    now,
    page,
    dispatch,
    bookings,
    selectedBooking,
    submitting,
    deleteBooking,
    clearMutationError,
  });

  return {
    now,
    committedDate,
    selectedId,
    selectedBooking,
    bookings,
    loadStatus,
    loadError,
    submitting,
    mutationError,
    bannerMutationError: formOpen ? null : mutationError,
    refetch,
    createBlocked,
    formOpen,
    deleteOpen,
    formMode,
    formValues,
    timelineLocked,
    clearMutationError,
    ...timeline,
    ...formDialog,
    ...deleteDialog,
  };
}
