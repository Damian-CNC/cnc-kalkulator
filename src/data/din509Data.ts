// DIN 509 - Undercut dimensions (Podcięcia tokarskie)
// Source: DIN 509:2006, Table 1
// Each row: r (radius), t1 (depth from larger Ø), f (width), g (offset), t2 (depth on face)

export type Din509Type = 'E' | 'F' | 'G' | 'H';

export interface Din509Row {
  r: number;
  t1: number;
  f: number;
  g: number;
  t2: number;
  /** Diameter range applicability description */
  dRange: string;
}

export interface Din509TypeInfo {
  type: Din509Type;
  description: string;
  /** Approach angle on shaft side (degrees) */
  approachAngle: number | null;
  /** Exit angle on face side (degrees) */
  exitAngle: number;
}

export const DIN509_TYPES: Record<Din509Type, Din509TypeInfo> = {
  E: {
    type: 'E',
    description: 'Typ E — do powierzchni walcowych obrabianych dalej (bez podcięcia czołowego).',
    approachAngle: null,
    exitAngle: 15,
  },
  F: {
    type: 'F',
    description: 'Typ F — do powierzchni walcowych z prostopadłym czołem (podcięcie czołowe).',
    approachAngle: 8,
    exitAngle: 15,
  },
  G: {
    type: 'G',
    description: 'Typ G — bez promienia, kąt wejścia 55° (np. pod gwint).',
    approachAngle: 55,
    exitAngle: 15,
  },
  H: {
    type: 'H',
    description: 'Typ H — bez promienia, kąt wejścia 60° (do specjalnych zastosowań).',
    approachAngle: 60,
    exitAngle: 15,
  },
};

// Common DIN 509 table — same dimensional rows are used for E, F, G, H
export const DIN509_ROWS: Din509Row[] = [
  { r: 0.2, t1: 0.1, f: 1,   g: 0.9, t2: 0.1, dRange: 'Ø 1.6 — 3' },
  { r: 0.4, t1: 0.2, f: 2,   g: 1.1, t2: 0.1, dRange: 'Ø 3 — 18' },
  { r: 0.6, t1: 0.2, f: 2,   g: 1.4, t2: 0.1, dRange: 'Ø 10 — 18' },
  { r: 0.6, t1: 0.3, f: 2.5, g: 2.1, t2: 0.2, dRange: 'Ø 18 — 80' },
  { r: 0.8, t1: 0.3, f: 2.5, g: 2.4, t2: 0.2, dRange: 'Ø 18 — 80' },
  { r: 0.8, t1: 0.2, f: 2,   g: 1.1, t2: 0.05, dRange: 'Ø 18 — 50 (wysokie obc.)' },
  { r: 1.0, t1: 0.2, f: 2.5, g: 1.8, t2: 0.1, dRange: 'Ø 18 — 50' },
  { r: 1.0, t1: 0.4, f: 4,   g: 3.2, t2: 0.3, dRange: '> Ø 80' },
  { r: 1.2, t1: 0.2, f: 2.5, g: 2.0, t2: 0.1, dRange: 'Ø 18 — 50' },
  { r: 1.2, t1: 0.4, f: 4,   g: 3.4, t2: 0.3, dRange: '> Ø 80' },
  { r: 1.6, t1: 0.3, f: 4,   g: 3.1, t2: 0.2, dRange: 'Ø 50 — 80' },
  { r: 2.5, t1: 0.4, f: 5,   g: 4.8, t2: 0.3, dRange: 'Ø 80 — 125' },
  { r: 4.0, t1: 0.5, f: 7,   g: 6.4, t2: 0.3, dRange: '> Ø 125' },
];

export const findDin509 = (r: number, t1: number): Din509Row | null => {
  const eps = 1e-6;
  return (
    DIN509_ROWS.find((row) => Math.abs(row.r - r) < eps && Math.abs(row.t1 - t1) < eps) ?? null
  );
};

export const uniqueRadii = Array.from(new Set(DIN509_ROWS.map((r) => r.r))).sort((a, b) => a - b);

export const t1OptionsForRadius = (r: number): number[] =>
  Array.from(
    new Set(DIN509_ROWS.filter((row) => Math.abs(row.r - r) < 1e-6).map((row) => row.t1))
  ).sort((a, b) => a - b);
