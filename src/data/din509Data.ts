// DIN 509 - Undercut dimensions (Podcięcia tokarskie)
// Source: DIN 509:2006, Table 1
// Table 1 rows are form-specific. Null marks a dimension not used by that form.

export type Din509Type = 'E' | 'F' | 'G' | 'H';

export interface Din509Row {
  type: Din509Type;
  r: number;
  t1: number;
  f: number;
  g: number | null;
  t2: number | null;
  /** Diameter range applicability description */
  dRange: string;
}

export interface Din509TypeInfo {
  type: Din509Type;
  description: string;
  approachAngle: number | null;
  exitAngle: number;
}

export const DIN509_TYPES: Record<Din509Type, Din509TypeInfo> = {
  E: {
    type: 'E',
    description: 'Do powierzchni walcowych z dalszą obróbką (szlifowanie). Podcięcie wykonane wyłącznie na średnicy wałka. Czoło pozostaje płaskie (90°).',
    approachAngle: null,
    exitAngle: 15,
  },
  F: {
    type: 'F',
    description: 'Do powierzchni walcowych z prostopadłym czołem (jednoczesne szlifowanie wałka i czoła oporowego).',
    approachAngle: 8,
    exitAngle: 15,
  },
  G: {
    type: 'G',
    description: 'Podcięcie walcowo-czołowe o zwartej geometrii z kątem wejścia 55° (np. pod płytki tokarskie WSP).',
    approachAngle: 55,
    exitAngle: 15,
  },
  H: {
    type: 'H',
    description: 'Podcięcie walcowo-czołowe z kątem wejścia 60° i wyjścia 15° – stosowane przy podwyższonych obciążeniach zmiennych.',
    approachAngle: 60,
    exitAngle: 15,
  },
};

export const DIN509_ROWS: Din509Row[] = [
  ...([
    [0.2, 0.1, 1, 'Ø > 1.6–3'], [0.4, 0.2, 2, 'Ø > 3–18'], [0.6, 0.2, 2, 'Ø > 10–18'],
    [0.6, 0.3, 2.5, 'Ø > 18–80'], [0.8, 0.3, 2.5, 'Ø > 18–80'], [1, 0.2, 2.5, 'Ø > 18–50 · obciążenia zmienne'],
    [1, 0.4, 4, 'Ø > 80'], [1.2, 0.2, 2.5, 'Ø > 18–50 · obciążenia zmienne'], [1.2, 0.4, 4, 'Ø > 80'],
    [1.6, 0.3, 4, 'Ø > 50–80 · obciążenia zmienne'], [2.5, 0.4, 5, 'Ø > 80–125 · obciążenia zmienne'], [4, 0.5, 7, 'Ø > 125 · obciążenia zmienne'],
  ] as const).map(([r, t1, f, dRange]) => ({ type: 'E' as const, r, t1, t2: null, f, g: null, dRange })),
  ...([
    [0.2, 0.1, 0.1, 1, 0.9, 'Ø > 1.6–3'], [0.4, 0.2, 0.1, 2, 1.1, 'Ø > 3–18'], [0.6, 0.2, 0.1, 2, 1.4, 'Ø > 10–18'],
    [0.6, 0.3, 0.2, 2.5, 2.1, 'Ø > 18–80'], [0.8, 0.3, 0.2, 2.5, 2.3, 'Ø > 18–80'], [1, 0.2, 0.1, 2.5, 1.8, 'Ø > 18–50 · obciążenia zmienne'],
    [1, 0.4, 0.3, 4, 3.2, 'Ø > 80'], [1.2, 0.2, 0.1, 2.5, 2, 'Ø > 18–50 · obciążenia zmienne'], [1.2, 0.4, 0.3, 4, 3.4, 'Ø > 80'],
    [1.6, 0.3, 0.2, 4, 3.1, 'Ø > 50–80 · obciążenia zmienne'], [2.5, 0.4, 0.3, 5, 4.8, 'Ø > 80–125 · obciążenia zmienne'], [4, 0.5, 0.3, 7, 6.4, 'Ø > 125 · obciążenia zmienne'],
  ] as const).map(([r, t1, t2, f, g, dRange]) => ({ type: 'F' as const, r, t1, t2, f, g, dRange })),
  { type: 'G', r: 0.4, t1: 0.2, t2: 0.2, f: 0.9, g: 1.1, dRange: 'Ø > 3–18' },
  { type: 'H', r: 0.8, t1: 0.3, t2: 0.05, f: 2, g: 1.1, dRange: 'Ø > 18–80' },
  { type: 'H', r: 1.2, t1: 0.3, t2: 0.05, f: 2.4, g: 1.5, dRange: 'Ø > 18–50 · obciążenia zmienne' },
];

export const rowsForType = (type: Din509Type): Din509Row[] => DIN509_ROWS.filter((row) => row.type === type);

export const findDin509 = (type: Din509Type, r: number, t1: number): Din509Row | null => {
  const eps = 1e-6;
  return (
    DIN509_ROWS.find((row) => row.type === type && Math.abs(row.r - r) < eps && Math.abs(row.t1 - t1) < eps) ?? null
  );
};

export const uniqueRadiiForType = (type: Din509Type): number[] =>
  Array.from(new Set(rowsForType(type).map((row) => row.r))).sort((a, b) => a - b);

export const t1OptionsForRadius = (type: Din509Type, r: number): number[] =>
  Array.from(
    new Set(rowsForType(type).filter((row) => Math.abs(row.r - r) < 1e-6).map((row) => row.t1))
  ).sort((a, b) => a - b);
