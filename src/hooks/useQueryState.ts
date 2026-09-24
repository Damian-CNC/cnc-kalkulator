import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const STORAGE_PREFIX = 'cnc_state_q_';

/**
 * Stan trzymany w adresie (?key=value).
 * Z podanym `persistKey` ostatnio wybrana wartość jest zapamiętana
 * i staje się domyślną po powrocie do zakładki.
 */
export function useQueryState<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues: readonly T[],
  persistKey?: string,
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const storageKey = persistKey ? `${STORAGE_PREFIX}${persistKey}` : null;

  const [storedDefault] = useState<T>(() => {
    if (!storageKey) return defaultValue;
    try {
      const stored = localStorage.getItem(storageKey) as T | null;
      return stored && allowedValues.includes(stored) ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const effectiveDefault = storageKey ? storedDefault : defaultValue;

  const requested = searchParams.get(key) as T | null;
  const value = requested && allowedValues.includes(requested) ? requested : effectiveDefault;

  useEffect(() => {
    if (requested && allowedValues.includes(requested)) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set(key, effectiveDefault);
      return next;
    }, { replace: true });
  }, [effectiveDefault, key, requested, setSearchParams, ...allowedValues]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* noop */
    }
  }, [storageKey, value]);

  const setValue = useCallback((nextValue: T) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextValue === effectiveDefault) next.delete(key);
      else next.set(key, nextValue);
      return next;
    }, { replace: true });
  }, [effectiveDefault, key, setSearchParams]);

  return [value, setValue];
}

export default useQueryState;
