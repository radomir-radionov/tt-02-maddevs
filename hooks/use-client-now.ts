"use client";

import { useEffect, useState } from "react";

/** Current time; null until after mount (avoids prerender `new Date()` issues). */
export function useClientNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only clock after mount
    setNow(new Date());
  }, []);
  return now;
}
