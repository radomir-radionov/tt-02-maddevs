import type { BookingFormValues } from "@/components/bookings/booking-form";
import { defaultBookingTimes } from "@/lib/bookings/slot-options";
import type { Booking } from "@/lib/bookings/types";

export type BookingPageClientProps = {
  initialDate: string;
  initialBookings: readonly Booking[];
  serverNowIso: string;
};

export type FormMode = "create" | "edit";

export type OverlayState =
  | { kind: "none" }
  | { kind: "form"; mode: FormMode }
  | { kind: "delete" };

export type PageState = {
  committedDate: string;
  selectedId: string | null;
  overlay: OverlayState;
  formValues: BookingFormValues;
};

export type PageAction =
  | { type: "sync_client_today"; date: string; formValues: BookingFormValues }
  | { type: "date_commit"; date: string; formValues: BookingFormValues }
  | { type: "select_booking"; id: string }
  | { type: "clear_selection" }
  | { type: "open_create"; formValues: BookingFormValues }
  | { type: "open_edit"; formValues: BookingFormValues }
  | { type: "close_overlay" }
  | { type: "open_delete" }
  | { type: "set_form_values"; formValues: BookingFormValues }
  | { type: "mutation_success"; formValues: BookingFormValues };

export function defaultBookingFormValues(
  date: string,
  now: Date,
  existing: readonly Booking[],
): BookingFormValues {
  const { start, end } = defaultBookingTimes(date, now, existing);
  return { start, end, title: "" };
}

export function createPageInitialState(
  initialDate: string,
  serverNowIso: string,
  initialBookings: readonly Booking[],
): PageState {
  const seedNow = new Date(serverNowIso);
  return {
    committedDate: initialDate,
    selectedId: null,
    overlay: { kind: "none" },
    formValues: defaultBookingFormValues(initialDate, seedNow, initialBookings),
  };
}

export function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "sync_client_today":
      return {
        ...state,
        committedDate: action.date,
        formValues: action.formValues,
      };
    case "date_commit":
      return {
        committedDate: action.date,
        selectedId: null,
        overlay: { kind: "none" },
        formValues: action.formValues,
      };
    case "select_booking":
      return {
        ...state,
        selectedId: action.id,
        overlay: { kind: "none" },
      };
    case "clear_selection":
      return {
        ...state,
        selectedId: null,
        overlay: { kind: "none" },
      };
    case "open_create":
      return {
        ...state,
        selectedId: null,
        overlay: { kind: "form", mode: "create" },
        formValues: action.formValues,
      };
    case "open_edit":
      return {
        ...state,
        overlay: { kind: "form", mode: "edit" },
        formValues: action.formValues,
      };
    case "close_overlay":
      return { ...state, overlay: { kind: "none" } };
    case "open_delete":
      return { ...state, overlay: { kind: "delete" } };
    case "set_form_values":
      return { ...state, formValues: action.formValues };
    case "mutation_success":
      return {
        ...state,
        selectedId: null,
        overlay: { kind: "none" },
        formValues: action.formValues,
      };
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unhandled page action: ${String(_exhaustive)}`);
    }
  }
}

export function overlayFlags(overlay: OverlayState) {
  const formOpen = overlay.kind === "form";
  const deleteOpen = overlay.kind === "delete";
  const formMode: FormMode =
    overlay.kind === "form" ? overlay.mode : "create";
  return {
    formOpen,
    deleteOpen,
    formMode,
    timelineLocked: formOpen || deleteOpen,
  };
}
