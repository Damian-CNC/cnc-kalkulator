import { useUnits } from '@/contexts/UnitContext';

const MM_PER_IN = 25.4;

/**
 * Formatowanie długości zgodnie z ustawionym systemem jednostek.
 * `src` = jednostka, w której kalkulator liczy ('in' albo 'mm').
 * W systemie metrycznym wyniki są w mm, w calowym w in (bez drugiej jednostki).
 */
const useLength = (src: 'in' | 'mm') => {
  const { isImperial } = useUnits();
  const unit = isImperial ? 'in' : 'mm';
  const toShown = (v: number) => {
    if (src === 'in') return isImperial ? v : v * MM_PER_IN;
    return isImperial ? v / MM_PER_IN : v;
  };
  /** liczba miejsc: w calach `inDigits`, w mm `mmDigits` */
  const val = (v: number, inDigits = 4, mmDigits = 3) =>
    toShown(v).toFixed(isImperial ? inDigits : mmDigits);
  const raw = (v: number, inDigits = 4, mmDigits = 3) => Number(val(v, inDigits, mmDigits));
  const fmt = (v: number, inDigits = 4, mmDigits = 3) => `${val(v, inDigits, mmDigits)} ${unit}`;
  return { isImperial, unit, val, raw, fmt, toShown };
};

export default useLength;
