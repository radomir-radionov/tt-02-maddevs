export type Booking = {
  id: string;
  date: string;
  start: string;
  end: string;
  title?: string;
};

export type BookingInput = {
  date: string;
  start: string;
  end: string;
  title?: string;
};

export type BookingPatch = Partial<BookingInput>;

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export type ValidateMode = "create" | "update";

export type ValidateOptions = {
  excludeId?: string;
  mode: ValidateMode;
  now?: Date;
};
