import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useQueryState<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues: readonly T[],
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(key) as T | null;
  const value = requested && allowedValues.includes(requested) ? requested : defaultValue;

  useEffect(() => {
    if (requested && allowedValues.includes(requested)) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set(key, defaultValue);
      return next;
    }, { replace: true });
  }, [defaultValue, key, requested, setSearchParams, ...allowedValues]);

  const setValue = useCallback((nextValue: T) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextValue === defaultValue) next.delete(key);
      else next.set(key, nextValue);
      return next;
    }, { replace: true });
  }, [defaultValue, key, setSearchParams]);

  return [value, setValue];
}

export default useQueryState;