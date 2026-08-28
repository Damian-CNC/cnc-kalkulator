/**
 * Shop-floor friendly numeric input helpers.
 * Mobile keypads often only offer a comma as decimal separator, so we
 * normalize it to a dot before it ever reaches numeric state.
 */

export const DECIMAL_PATTERN = '^[0-9]*[.,]?[0-9]*$';

/** Converts commas to dots and strips characters that can't be part of a number. */
export const sanitizeDecimal = (raw: string): string => {
  if (raw === undefined || raw === null) return '';
  let v = String(raw).replace(/,/g, '.').replace(/\s+/g, '');
  // keep an optional leading minus, digits and a single dot
  const negative = v.startsWith('-');
  v = v.replace(/[^0-9.]/g, '');
  const parts = v.split('.');
  if (parts.length > 2) v = `${parts.shift()}.${parts.join('')}`;
  return negative ? `-${v}` : v;
};

/** Parses a possibly comma-separated string into a finite number or null. */
export const parseDecimal = (raw: string): number | null => {
  const s = sanitizeDecimal(raw);
  if (s === '' || s === '-' || s === '.') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

/** Selects the whole value on focus for fast replacement on touch devices. */
export const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.select();
};
