"use client";

import { useReducer } from "react";
import {
  createPageInitialState,
  overlayFlags,
  pageReducer,
  type BookingPageClientProps,
} from "@/hooks/booking-page/page-state";

export function useBookingPageState(props: BookingPageClientProps) {
  const [page, dispatch] = useReducer(
    pageReducer,
    props,
    ({ initialDate: date, serverNowIso: iso, initialBookings: seed }) =>
      createPageInitialState(date, iso, seed),
  );

  return {
    page,
    dispatch,
    ...overlayFlags(page.overlay),
    committedDate: page.committedDate,
    selectedId: page.selectedId,
    formValues: page.formValues,
  };
}
