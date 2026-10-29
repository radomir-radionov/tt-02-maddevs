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

const disabledBtn =
  "disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:border-zinc-700 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500";

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
        <button
          type="button"
          onClick={onNew}
          disabled={submitting}
          className={`rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 ${disabledBtn}`}
        >
          + Book
        </button>
      ) : null}
      {showEditDelete ? (
        <>
          <button
            type="button"
            onClick={onEdit}
            disabled={submitting}
            aria-label="Edit selected booking"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Edit selected
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            aria-label="Delete selected booking"
            className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-200 dark:hover:bg-red-950/40"
          >
            Delete selected
          </button>
        </>
      ) : null}
    </div>
  );
}
