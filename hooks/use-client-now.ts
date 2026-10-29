"use client";

import { useEffect, useState } from "react";

const TICK_MS = 60_000;

/** Browser clock for booking rules in the UI (updates every minute after mount). */
export function useClientNow(seedIso: string): Date {
  const [now, setNow] = useState(() => new Date(seedIso));

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
