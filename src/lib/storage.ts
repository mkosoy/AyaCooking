"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "sous:storage";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Reads a raw localStorage entry as render state. Strings are stable snapshots,
 * so callers parse them with useMemo instead of copying into state.
 */
export function useStoredString(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null,
  );

  const store = useCallback(
    (next: string | null) => {
      if (next === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, next);
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key],
  );

  return [value, store];
}
