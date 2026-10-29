type BookingsChangeListener = (date: string) => void;

type ListenerEntry = {
  date: string;
  listener: BookingsChangeListener;
};

const listeners = new Set<ListenerEntry>();

export function subscribeBookingsChanged(
  date: string,
  listener: BookingsChangeListener,
): () => void {
  const entry: ListenerEntry = { date, listener };
  listeners.add(entry);
  return () => {
    listeners.delete(entry);
  };
}

export function notifyBookingsChanged(date: string): void {
  for (const entry of listeners) {
    if (entry.date === date) {
      entry.listener(date);
    }
  }
}
