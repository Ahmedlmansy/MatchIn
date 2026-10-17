import { useCallback, useSyncExternalStore } from "react";

/**
 * useMediaQuery
 * ---------------------------------------------------------------------------
 * Subscribes to a CSS media query and re-renders when it starts/stops matching.
 *
 * Use this only when a piece of *state* has to differ per breakpoint (e.g. the
 * sidebar is collapsible on desktop but must always render expanded inside the
 * mobile drawer). Pure visual differences belong in Tailwind breakpoint classes,
 * not here.
 */
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  // Memoized so the reference is stable across renders — useSyncExternalStore
  // re-invokes the snapshot on every render and after every commit, and an
  // unstable reference would defeat React's change detection.
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    // SSR snapshot: assume the smallest viewport so the mobile drawer is the
    // default until the client tells us otherwise.
    () => false,
  );
}