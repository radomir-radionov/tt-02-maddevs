"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookingApiError,
  createBooking as apiCreate,
  deleteBooking as apiDelete,
  listBookings,
  updateBooking as apiUpdate,
} from "@/lib/api/bookings-client";
import type { Booking, BookingInput, BookingPatch } from "@/lib/bookings/types";

export type LoadStatus = "idle" | "loading" | "error";

export function useBookings(date: string) {
  const cacheRef = useRef(new Map<string, Booking[]>());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const applyBookings = useCallback((targetDate: string, data: Booking[]) => {
    cacheRef.current.set(targetDate, data);
    setBookings(data);
    setLoadStatus("idle");
    setLoadError(null);
  }, []);

  const refetch = useCallback(
    async (options?: { showLoading?: boolean }) => {
      if (!date) {
        return;
      }
      const cached = cacheRef.current.get(date);
      if (cached) {
        setBookings(cached);
      }

      const showLoading = options?.showLoading ?? !cacheRef.current.has(date);
      if (showLoading) {
        setLoadStatus("loading");
      }
      setLoadError(null);

      try {
        const data = await listBookings(date);
        applyBookings(date, data);
      } catch (err) {
        setLoadStatus("error");
        setLoadError(
          err instanceof BookingApiError
            ? err.message
            : "Failed to load bookings.",
        );
      }
    },
    [applyBookings, date],
  );

  useEffect(() => {
    if (!date) {
      return;
    }
    const cached = cacheRef.current.get(date);
    if (cached) {
      setBookings(cached);
      setLoadStatus("idle");
    } else {
      setBookings([]);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load bookings for active date
    void refetch({ showLoading: !cached });
  }, [date, refetch]);

  const runMutation = useCallback(
    async (action: () => Promise<void>) => {
      setSubmitting(true);
      setMutationError(null);
      try {
        await action();
        await refetch({ showLoading: false });
      } catch (err) {
        if (err instanceof BookingApiError) {
          setMutationError(err.message);
          if (err.status === 409 || err.status === 404) {
            await refetch({ showLoading: false });
          }
        } else {
          setMutationError("Something went wrong. Please try again.");
        }
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [refetch],
  );

  const createBooking = useCallback(
    (input: BookingInput) =>
      runMutation(async () => {
        await apiCreate(input);
      }),
    [runMutation],
  );

  const updateBooking = useCallback(
    (id: string, patch: BookingPatch) =>
      runMutation(async () => {
        await apiUpdate(id, patch);
      }),
    [runMutation],
  );

  const deleteBooking = useCallback(
    (id: string) =>
      runMutation(async () => {
        await apiDelete(id);
      }),
    [runMutation],
  );

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  return {
    bookings,
    loadStatus,
    loadError,
    submitting,
    mutationError,
    refetch: () => refetch({ showLoading: false }),
    createBooking,
    updateBooking,
    deleteBooking,
    clearMutationError,
  };
}
