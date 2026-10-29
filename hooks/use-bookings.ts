"use client";

import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BookingApiError,
  createBooking as apiCreate,
  deleteBooking as apiDelete,
  listBookings,
  subscribeBookingsStream,
  updateBooking as apiUpdate,
} from "@/lib/api/bookings-client";
import { bookingsQueryKeys } from "@/lib/bookings/query-keys";
import type { Booking, BookingInput, BookingPatch } from "@/lib/bookings/types";

export type LoadStatus = "idle" | "loading" | "error";

export type BookingsInitialData = {
  date: string;
  bookings: readonly Booking[];
};

function loadErrorMessage(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }
  return "Failed to load bookings.";
}

function mutationErrorMessage(error: unknown): string {
  if (error instanceof BookingApiError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function useBookings(
  date: string,
  options?: { initial?: BookingsInitialData },
) {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const initial = options?.initial;
  const hasInitialForDate =
    initial !== undefined && initial.date === date && date !== "";

  const query = useQuery({
    queryKey: bookingsQueryKeys.byDate(date),
    queryFn: () => listBookings(date),
    enabled: date !== "",
    initialData: hasInitialForDate ? [...initial.bookings] : undefined,
  });

  const mutationKey = bookingsQueryKeys.mutations();

  const handleMutationError = async (error: unknown) => {
    setMutationError(mutationErrorMessage(error));
    if (
      error instanceof BookingApiError &&
      (error.status === 409 || error.status === 404)
    ) {
      await queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.byDate(date),
      });
    }
  };

  const createMutation = useMutation({
    mutationKey,
    mutationFn: (input: BookingInput) => apiCreate(input),
    onMutate: () => {
      setMutationError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.byDate(date),
      });
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationKey,
    mutationFn: ({ id, patch }: { id: string; patch: BookingPatch }) =>
      apiUpdate(id, patch),
    onMutate: () => {
      setMutationError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.byDate(date),
      });
    },
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationKey,
    mutationFn: (id: string) => apiDelete(id),
    onMutate: () => {
      setMutationError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.byDate(date),
      });
    },
    onError: handleMutationError,
  });

  const mutatingCount = useIsMutating({ mutationKey });
  const submitting = mutatingCount > 0;

  useEffect(() => {
    if (!date) {
      return;
    }

    return subscribeBookingsStream(date, (event) => {
      if (event.type !== "bookings-changed" || event.date !== date) {
        return;
      }
      if (mutatingCount > 0) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: bookingsQueryKeys.byDate(date),
      });
    });
  }, [date, mutatingCount, queryClient]);

  const loadStatus: LoadStatus = query.isError
    ? "error"
    : query.isLoading
      ? "loading"
      : "idle";

  const loadError = query.isError ? loadErrorMessage(query.error) : null;

  async function createBooking(input: BookingInput) {
    await createMutation.mutateAsync(input);
  }

  async function updateBooking(id: string, patch: BookingPatch) {
    await updateMutation.mutateAsync({ id, patch });
  }

  async function deleteBooking(id: string) {
    await deleteMutation.mutateAsync(id);
  }

  function clearMutationError() {
    setMutationError(null);
  }

  return {
    bookings: query.data ?? [],
    loadStatus,
    loadError,
    submitting,
    mutationError,
    refetch: () => void query.refetch(),
    createBooking,
    updateBooking,
    deleteBooking,
    clearMutationError,
  };
}
