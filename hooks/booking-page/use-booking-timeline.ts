"use client";

import { useCallback } from "react";
import {
  defaultBookingFormValues,
  type PageAction,
} from "@/hooks/booking-page/page-state";
import type { Booking } from "@/lib/bookings/types";
import type { Dispatch } from "react";

type UseBookingTimelineOptions = {
  now: Date;
  dispatch: Dispatch<PageAction>;
  bookings: readonly Booking[];
  timelineLocked: boolean;
  clearMutationError: () => void;
};

export function useBookingTimeline({
  now,
  dispatch,
  bookings,
  timelineLocked,
  clearMutationError,
}: UseBookingTimelineOptions) {
  const handleDateCommit = useCallback(
    (next: string) => {
      dispatch({
        type: "date_commit",
        date: next,
        formValues: defaultBookingFormValues(next, now, bookings),
      });
      clearMutationError();
    },
    [now, bookings, dispatch, clearMutationError],
  );

  const handleSelect = useCallback(
    (id: string) => {
      dispatch({ type: "select_booking", id });
      clearMutationError();
    },
    [dispatch, clearMutationError],
  );

  const handleClearSelection = useCallback(() => {
    if (timelineLocked) {
      return;
    }
    dispatch({ type: "clear_selection" });
  }, [timelineLocked, dispatch]);

  return {
    handleDateCommit,
    handleSelect,
    handleClearSelection,
  };
}
