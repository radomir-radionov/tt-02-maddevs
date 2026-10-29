"use client";

import { useEffect, useRef, useState } from "react";
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

  function applyBookings(targetDate: string, data: Booking[]) {
    cacheRef.current.set(targetDate, data);
    setBookings(data);
    setLoadStatus("idle");
    setLoadError(null);
  }

  async function refetch(options?: { showLoading?: boolean }) {
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
  }

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

    let cancelled = false;
    const showLoading = !cacheRef.current.has(date);
    if (showLoading) {
      setLoadStatus("loading");
    }
    setLoadError(null);

    void (async () => {
      try {
        const data = await listBookings(date);
        if (cancelled) {
          return;
        }
        applyBookings(date, data);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setLoadStatus("error");
        setLoadError(
          err instanceof BookingApiError
            ? err.message
            : "Failed to load bookings.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [date]);

  async function runMutation(action: () => Promise<void>) {
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
  }

  async function createBooking(input: BookingInput) {
    return runMutation(async () => {
      await apiCreate(input);
    });
  }

  async function updateBooking(id: string, patch: BookingPatch) {
    return runMutation(async () => {
      await apiUpdate(id, patch);
    });
  }

  async function deleteBooking(id: string) {
    return runMutation(async () => {
      await apiDelete(id);
    });
  }

  function clearMutationError() {
    setMutationError(null);
  }

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
