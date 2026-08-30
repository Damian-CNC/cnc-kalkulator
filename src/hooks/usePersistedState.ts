import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'cnc_state_';

export const persistedKey = (name: string) => `${PREFIX}${name}`;

export const clearPersistedState = (name: string) => {
  try {
    localStorage.removeItem(persistedKey(name));
  } catch {
    /* noop */
  }
};

/**
 * State persisted in localStorage per calculator (key: cnc_state_<name>).
 * Survives tab switches, minimizing and accidental reloads.
 */
export function usePersistedState<T>(name: string, initial: T) {
  const key = persistedKey(name);
  const initialRef = useRef(initial);

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as T;
      if (parsed && typeof parsed === 'object' && typeof initial === 'object' && initial !== null) {
        return { ...(initial as object), ...(parsed as object) } as T;
      }
      return parsed;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [key, state]);

  const reset = useCallback(() => {
    clearPersistedState(name);
    setState(initialRef.current);
  }, [name]);

  return [state, setState, reset] as const;
}

export default usePersistedState;
