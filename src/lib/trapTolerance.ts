/**
 * Tolerancje gwintów trapezowych Tr wg ISO 2903 (DIN 103).
 *
 * - odchyłki zasadnicze średnicy podziałowej: tabela 1 normy (ISO 2903:2016),
 * - tolerancje D1 (TD1) i d (Td): stopień 4, tabele 3 i 4 normy,
 * - tolerancje średnicy podziałowej Td2 i TD2: liczone wzorem z ISO 965-1
 *   (Td2(6) = 90 · P^0,4 · d^0,1, stopnie 7/8/9 = 1,25 / 1,6 / 2,0 · Td2(6),
 *   TD2 = 1,32 · Td2) i zaokrąglane do szeregu normowego. Wzór sprawdzony na
 *   przykładach: Tr 40×7 (7H, 7e) oraz Tr 50×8 (7H, 7e).
 * - tolerancja średnicy rdzenia śruby: Td3 = 1,25 · Td2 + |es|.
 */

export type NutClass = '7H' | '8H' | '9H';
export type BoltClass = '7e' | '8e' | '8c' | '9c';
export const NUT_CLASSES: NutClass[] = ['7H', '8H', '9H'];
export const BOLT_CLASSES: BoltClass[] = ['7e', '8e', '8c', '9c'];

// Skok [mm] -> [es dla c, es dla e] w µm (wartości ujemne), tabela 1 ISO 2903:2016
const FUNDAMENTAL: Record<number, [number, number]> = {
  1.5: [-140, -67],
  2: [-150, -71],
  3: [-170, -85],
  4: [-190, -95],
  5: [-212, -106],
  6: [-236, -118],
  7: [-250, -125],
  8: [-265, -132],
  9: [-280, -140],
  10: [-300, -150],
  12: [-335, -160],
  14: [-355, -180],
  16: [-375, -190],
  18: [-400, -200],
  20: [-425, -212],
  22: [-450, -224],
  24: [-475, -236],
  28: [-500, -250],
  32: [-530, -265],
  36: [-560, -280],
  40: [-600, -300],
  44: [-630, -315],
};

// TD1 (nakrętka, średnica rdzenia) i Td (śruba, średnica zewnętrzna), stopień 4, µm
const TD1: Record<number, number> = {
  1.5: 190, 2: 236, 3: 315, 4: 375, 5: 450, 6: 500, 7: 560, 8: 630, 9: 670, 10: 710, 12: 800,
  14: 900, 16: 1000, 18: 1120, 20: 1180, 22: 1250, 24: 1320, 28: 1500, 32: 1600, 36: 1800,
  40: 1900, 44: 2000,
};
const TD: Record<number, number> = {
  1.5: 150, 2: 180, 3: 236, 4: 300, 5: 335, 6: 375, 7: 425, 8: 450, 9: 500, 10: 530, 12: 600,
  14: 670, 16: 710, 18: 800, 20: 850, 22: 900, 24: 950, 28: 1060, 32: 1120, 36: 1250,
  40: 1320, 44: 1400,
};

// Zakresy średnicy nominalnej (ponad, do i włącznie)
const D_RANGES: [number, number][] = [
  [5.6, 11.2],
  [11.2, 22.4],
  [22.4, 45],
  [45, 90],
  [90, 180],
  [180, 355],
];

// Szereg normowy tolerancji (µm), jak w ISO 965-1
const SERIES = [
  100, 106, 112, 118, 125, 132, 140, 150, 160, 170, 180, 190, 200, 212, 224, 236, 250, 265, 280,
  300, 315, 335, 355, 375, 400, 425, 450, 475, 500, 530, 560, 600, 630, 670, 710, 750, 800, 850,
  900, 950, 1000, 1060, 1120, 1180, 1250, 1320, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2120,
  2240, 2360, 2500, 2650, 2800, 3000, 3150,
];
const toSeries = (v: number): number =>
  SERIES.reduce((best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best), SERIES[0]);

const GRADE_FACTOR: Record<number, number> = { 7: 1.25, 8: 1.6, 9: 2 };

export const pitchKey = (P: number): number | null => {
  const hit = Object.keys(FUNDAMENTAL)
    .map(Number)
    .find((k) => Math.abs(k - P) < 1e-6);
  return hit ?? null;
};

/** Td2 (µm) dla śruby, stopień 7/8/9. */
export const boltPitchTol = (P: number, d: number, grade: 7 | 8 | 9): number | null => {
  const range = D_RANGES.find(([lo, hi]) => d > lo && d <= hi);
  if (!range) return null;
  const dg = Math.sqrt(range[0] * range[1]);
  const t6 = toSeries(90 * Math.pow(P, 0.4) * Math.pow(dg, 0.1));
  return toSeries(t6 * GRADE_FACTOR[grade]);
};

/** TD2 (µm) dla nakrętki, stopień 7/8/9. */
export const nutPitchTol = (P: number, d: number, grade: 7 | 8 | 9): number | null => {
  const td2 = boltPitchTol(P, d, grade);
  return td2 === null ? null : toSeries(1.32 * td2);
};

export type Limits = { max: number; min: number; tol: number };
const lim = (nominal: number, upper: number, lower: number): Limits => ({
  max: nominal + upper / 1000,
  min: nominal + lower / 1000,
  tol: (upper - lower) / 1000,
});

export type NutLimits = { cls: NutClass; D1: Limits; D2: Limits; D4min: number };
export type BoltLimits = { cls: BoltClass; d: Limits; d2: Limits; d3: Limits };

export const nutLimits = (
  d: number,
  P: number,
  cls: NutClass,
  nom: { D1: number; d2: number; D4: number },
): NutLimits | null => {
  const key = pitchKey(P);
  const grade = Number(cls[0]) as 7 | 8 | 9;
  const tD2 = nutPitchTol(P, d, grade);
  if (key === null || tD2 === null) return null;
  return {
    cls,
    D1: lim(nom.D1, TD1[key], 0),
    D2: lim(nom.d2, tD2, 0),
    D4min: nom.D4,
  };
};

export const boltLimits = (
  d: number,
  P: number,
  cls: BoltClass,
  nom: { d: number; d2: number; d3: number },
): BoltLimits | null => {
  const key = pitchKey(P);
  const grade = Number(cls[0]) as 7 | 8 | 9;
  const tD2 = boltPitchTol(P, d, grade);
  if (key === null || tD2 === null) return null;
  const es = FUNDAMENTAL[key][cls.endsWith('c') ? 0 : 1];
  const td3 = Math.round(1.25 * tD2 + Math.abs(es));
  return {
    cls,
    d: lim(nom.d, 0, -TD[key]),
    d2: lim(nom.d2, es, es - tD2),
    d3: lim(nom.d3, 0, -td3),
  };
};
