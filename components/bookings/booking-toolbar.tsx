import { Button } from "@/components/ui/button";

type BookingToolbarProps = {
  selectedId: string | null;
  submitting: boolean;
  createDisabled: boolean;
  /** When false, edit/delete are hidden (e.g. past calendar dates). */
  mutationsAllowed: boolean;
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BookingToolbar({
  selectedId,
  submitting,
  createDisabled,
  mutationsAllowed,
  onNew,
  onEdit,
  onDelete,
}: BookingToolbarProps) {
  const showCreate = !createDisabled;
  const showEditDelete = Boolean(selectedId && mutationsAllowed);

  if (!showCreate && !showEditDelete) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showCreate ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNew}
          disabled={submitting}
        >
          + Book
        </Button>
      ) : null}
      {showEditDelete ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={submitting}
            aria-label="Edit selected booking"
          >
            Edit selected
          </Button>
          <Button
            type="button"
            variant="destructiveOutline"
            size="sm"
            onClick={onDelete}
            disabled={submitting}
            aria-label="Delete selected booking"
          >
            Delete selected
          </Button>
        </>
      ) : null}
    </div>
  );
}
