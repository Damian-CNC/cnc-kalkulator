import { useCallback, useEffect, useRef, useState } from 'react';

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

const isSupported = () =>
  typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * Keeps the screen awake during machine setup.
 * Re-acquires the lock automatically when the tab becomes visible again.
 */
export const useWakeLock = () => {
  const [supported] = useState(isSupported);
  const [active, setActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const wantedRef = useRef(false);

  const request = useCallback(async () => {
    if (!isSupported()) return false;
    try {
      const sentinel = await (
        navigator as unknown as {
          wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
        }
      ).wakeLock.request('screen');
      sentinelRef.current = sentinel;
      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        if (!wantedRef.current) setActive(false);
      });
      setActive(true);
      return true;
    } catch {
      setActive(false);
      return false;
    }
  }, []);

  const release = useCallback(async () => {
    wantedRef.current = false;
    try {
      await sentinelRef.current?.release();
    } catch {
      /* noop */
    }
    sentinelRef.current = null;
    setActive(false);
  }, []);

  const toggle = useCallback(async () => {
    if (active || wantedRef.current) {
      await release();
      return false;
    }
    wantedRef.current = true;
    const ok = await request();
    if (!ok) wantedRef.current = false;
    return ok;
  }, [active, release, request]);

  useEffect(() => {
    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        wantedRef.current &&
        !sentinelRef.current
      ) {
        void request();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinelRef.current?.release().catch(() => undefined);
    };
  }, [request]);

  return { supported, active, toggle, request, release };
};

export default useWakeLock;
