import { useCallback, useMemo } from 'react';

type Pattern = number | number[];

const vibrate = (pattern: Pattern) => {
  try {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & { vibrate?: (p: Pattern) => boolean };
    if (typeof nav.vibrate !== 'function') return; // iOS Safari & desktop: no-op
    nav.vibrate(pattern);
  } catch {
    /* noop */
  }
};

/** Lightweight haptic feedback helpers (graceful no-op when unsupported). */
export const useHaptics = () => {
  const triggerLight = useCallback(() => vibrate(10), []);
  const triggerSuccess = useCallback(() => vibrate([15, 50, 15]), []);
  const triggerWarning = useCallback(() => vibrate(30), []);

  return useMemo(
    () => ({ triggerLight, triggerSuccess, triggerWarning }),
    [triggerLight, triggerSuccess, triggerWarning],
  );
};

export default useHaptics;
