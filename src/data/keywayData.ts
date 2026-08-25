export interface KeywayRow {
  dMin: number;
  dMax: number;
  b: number;
  h: number;
  t1: number;
  t1Tol: number;
  t2: number;
  t2Tol: number;
}

/** DIN 6885 — wpusty pryzmowe (forma A/B) */
export const keywayData: KeywayRow[] = [
  { dMin: 6, dMax: 8, b: 2, h: 2, t1: 1.2, t1Tol: 0.1, t2: 1.0, t2Tol: 0.1 },
  { dMin: 8, dMax: 10, b: 3, h: 3, t1: 1.8, t1Tol: 0.1, t2: 1.4, t2Tol: 0.1 },
  { dMin: 10, dMax: 12, b: 4, h: 4, t1: 2.5, t1Tol: 0.1, t2: 1.8, t2Tol: 0.1 },
  { dMin: 12, dMax: 17, b: 5, h: 5, t1: 3.0, t1Tol: 0.1, t2: 2.3, t2Tol: 0.1 },
  { dMin: 17, dMax: 22, b: 6, h: 6, t1: 3.5, t1Tol: 0.1, t2: 2.8, t2Tol: 0.1 },
  { dMin: 22, dMax: 30, b: 8, h: 7, t1: 4.0, t1Tol: 0.2, t2: 3.3, t2Tol: 0.2 },
  { dMin: 30, dMax: 38, b: 10, h: 8, t1: 5.0, t1Tol: 0.2, t2: 3.3, t2Tol: 0.2 },
  { dMin: 38, dMax: 44, b: 12, h: 8, t1: 5.0, t1Tol: 0.2, t2: 3.3, t2Tol: 0.2 },
  { dMin: 44, dMax: 50, b: 14, h: 9, t1: 5.5, t1Tol: 0.2, t2: 3.8, t2Tol: 0.2 },
  { dMin: 50, dMax: 58, b: 16, h: 10, t1: 6.0, t1Tol: 0.2, t2: 4.3, t2Tol: 0.2 },
  { dMin: 58, dMax: 65, b: 18, h: 11, t1: 7.0, t1Tol: 0.2, t2: 4.4, t2Tol: 0.2 },
  { dMin: 65, dMax: 75, b: 20, h: 12, t1: 7.5, t1Tol: 0.2, t2: 4.9, t2Tol: 0.2 },
];

export const findKeyway = (d: number): KeywayRow | undefined =>
  keywayData.find((r) => d > r.dMin && d <= r.dMax);

/** Odchyłki szerokości rowka b [mm] wg IT9 dla wybranego pasowania */
export interface WidthFit {
  id: 'P9' | 'N9' | 'JS9';
  label: string;
  desc: string;
}

export const widthFits: WidthFit[] = [
  { id: 'P9', label: 'P9', desc: 'ciasne (wciskane)' },
  { id: 'N9', label: 'N9', desc: 'normalne' },
  { id: 'JS9', label: 'JS9', desc: 'swobodne' },
];

/** IT9 dla zakresów wymiarów nominalnych [mm] */
const it9 = (b: number): number => {
  if (b <= 3) return 0.025;
  if (b <= 6) return 0.03;
  if (b <= 10) return 0.036;
  if (b <= 18) return 0.043;
  if (b <= 30) return 0.052;
  return 0.062;
};

/** Odchyłka podstawowa dla P (górna) */
const pDeviation = (b: number): number => {
  if (b <= 3) return -0.006;
  if (b <= 6) return -0.012;
  if (b <= 10) return -0.015;
  if (b <= 18) return -0.018;
  if (b <= 30) return -0.022;
  return -0.026;
};

export const widthLimits = (b: number, fit: WidthFit['id']) => {
  const it = it9(b);
  if (fit === 'JS9') return { upper: it / 2, lower: -it / 2 };
  if (fit === 'N9') return { upper: 0, lower: -it };
  const es = pDeviation(b);
  return { upper: es, lower: es - it };
};
