"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingTimeline } from "@/components/bookings/booking-timeline";
import { BookingToolbar } from "@/components/bookings/booking-toolbar";
import { DatePicker } from "@/components/bookings/date-picker";
import { StatusBanner } from "@/components/bookings/status-banner";
import {
  useBookingPage,
  type BookingPageClientProps,
} from "@/hooks/use-booking-page";

export function BookingPageClient(props: BookingPageClientProps) {
  const page = useBookingPage(props);
  const now = page.now;

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <DatePicker
          id="booking-date"
          value={page.committedDate}
          onCommit={page.handleDateCommit}
          now={now}
        />
        <BookingToolbar
          selectedId={page.selectedId}
          submitting={page.submitting}
          createDisabled={page.createBlocked}
          mutationsAllowed={page.selectedId !== null}
          onNew={page.openCreateDialog}
          onEdit={page.openEditDialog}
          onDelete={page.openDeleteConfirm}
        />
      </div>

      <StatusBanner
        loadStatus={page.loadStatus}
        loadError={page.loadError}
        mutationError={page.bannerMutationError}
        onRetry={() => void page.refetch()}
      />

      {page.committedDate ? (
        <BookingTimeline
          date={page.committedDate}
          now={now}
          bookings={page.bookings}
          selectedId={page.selectedId}
          onSelect={page.handleSelect}
          onClearSelection={page.handleClearSelection}
          isLoading={page.loadStatus === "loading"}
          loadFailed={page.loadStatus === "error"}
          className={page.timelineLocked ? "pointer-events-none" : undefined}
        />
      ) : null}

      <Dialog open={page.formOpen} onOpenChange={page.setFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {page.formMode === "create" ? "New booking" : "Edit booking"}
            </DialogTitle>
          </DialogHeader>
          {page.committedDate ? (
            <BookingForm
              key={`${page.formMode}-${page.selectedId ?? "new"}-${page.committedDate}`}
              date={page.committedDate}
              mode={page.formMode}
              existingBookings={page.bookings}
              editingId={page.formMode === "edit" ? page.selectedId : null}
              initialValues={page.formValues}
              submitting={page.submitting}
              serverError={page.mutationError}
              now={now}
              onSubmit={page.handleSubmit}
              onCancelEdit={page.closeFormDialog}
              onFieldChange={page.clearMutationError}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={page.deleteOpen} onOpenChange={page.setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete booking?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this booking?
            </p>
            {page.selectedBooking ? (
              <p className="text-sm font-medium">
                {page.selectedBooking.start}–{page.selectedBooking.end}
                {page.selectedBooking.title
                  ? `: ${page.selectedBooking.title}`
                  : ""}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => void page.handleDeleteConfirm()}
                disabled={page.submitting}
              >
                {page.submitting ? "Deleting…" : "Delete"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={page.closeDeleteConfirm}
                disabled={page.submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
