export type Iso2768Class = 'f' | 'm' | 'c' | 'v';

export interface Iso2768Row {
  /** exclusive lower bound (inclusive for the first row) */
  min: number;
  /** inclusive upper bound */
  max: number;
  labelKey: string;
  f: number | null;
  m: number | null;
  c: number | null;
  v: number | null;
}

/** ISO 2768-1 — linear dimensions (deviations in mm) */
export const linearTolerances: Iso2768Row[] = [
  { min: 0.5, max: 3, labelKey: 'r0', f: 0.05, m: 0.1, c: 0.2, v: null },
  { min: 3, max: 6, labelKey: 'r1', f: 0.05, m: 0.1, c: 0.3, v: 0.5 },
  { min: 6, max: 30, labelKey: 'r2', f: 0.1, m: 0.2, c: 0.5, v: 1.0 },
  { min: 30, max: 120, labelKey: 'r3', f: 0.15, m: 0.3, c: 0.8, v: 1.5 },
  { min: 120, max: 400, labelKey: 'r4', f: 0.2, m: 0.5, c: 1.2, v: 2.5 },
  { min: 400, max: 1000, labelKey: 'r5', f: 0.3, m: 0.8, c: 2.0, v: 4.0 },
  { min: 1000, max: 2000, labelKey: 'r6', f: 0.5, m: 1.2, c: 3.0, v: 6.0 },
  { min: 2000, max: 4000, labelKey: 'r7', f: null, m: 2.0, c: 4.0, v: 8.0 },
];

/** ISO 2768-1 — external radii and chamfer heights (deviations in mm) */
export const chamferTolerances: Iso2768Row[] = [
  { min: 0.5, max: 3, labelKey: 'c0', f: 0.2, m: 0.2, c: 0.4, v: 0.4 },
  { min: 3, max: 6, labelKey: 'c1', f: 0.5, m: 0.5, c: 1.0, v: 1.0 },
  { min: 6, max: Infinity, labelKey: 'c2', f: 1.0, m: 1.0, c: 2.0, v: 2.0 },
];

export const findRow = (rows: Iso2768Row[], value: number): Iso2768Row | null =>
  rows.find((r, i) => (i === 0 ? value >= r.min : value > r.min) && value <= r.max) ?? null;
