/**
 * Gwinty calowe Unified (UNC / UNF / UNEF) wg ASME B1.1.
 * Wzory: tolerancja średnicy podziałowej klasy 2A (LE = D), naddatek 0,3 · T2A,
 * współczynniki klas 1A/3A/1B/2B/3B, tolerancje średnicy zewn. i rdzenia.
 * Wyniki sprawdzone z tabelą 2 normy dla 1/4-20, 1/2-13, 1-8, 1/4-28 i 1/4-32.
 */

export type UnSeries = 'UNC' | 'UNF' | 'UNEF';
export type ExtClass = '1A' | '2A' | '3A';
export type IntClass = '1B' | '2B' | '3B';
export const EXT_CLASSES: ExtClass[] = ['1A', '2A', '3A'];
export const INT_CLASSES: IntClass[] = ['1B', '2B', '3B'];
export const MM = 25.4;

export type UnSize = {
  id: string; // np. "1/4" albo "#6"
  D: number; // średnica nominalna [in]
  tpi: Partial<Record<UnSeries, number>>;
};

const S = (id: string, D: number, unc?: number, unf?: number, unef?: number): UnSize => ({
  id,
  D,
  tpi: { ...(unc ? { UNC: unc } : {}), ...(unf ? { UNF: unf } : {}), ...(unef ? { UNEF: unef } : {}) },
});

// ASME B1.1 tabela 1
export const UN_SIZES: UnSize[] = [
  S('#0', 0.06, undefined, 80),
  S('#1', 0.073, 64, 72),
  S('#2', 0.086, 56, 64),
  S('#3', 0.099, 48, 56),
  S('#4', 0.112, 40, 48),
  S('#5', 0.125, 40, 44),
  S('#6', 0.138, 32, 40),
  S('#8', 0.164, 32, 36),
  S('#10', 0.19, 24, 32),
  S('#12', 0.216, 24, 28, 32),
  S('1/4', 0.25, 20, 28, 32),
  S('5/16', 0.3125, 18, 24, 32),
  S('3/8', 0.375, 16, 24, 32),
  S('7/16', 0.4375, 14, 20, 28),
  S('1/2', 0.5, 13, 20, 28),
  S('9/16', 0.5625, 12, 18, 24),
  S('5/8', 0.625, 11, 18, 24),
  S('11/16', 0.6875, undefined, undefined, 24),
  S('3/4', 0.75, 10, 16, 20),
  S('13/16', 0.8125, undefined, undefined, 20),
  S('7/8', 0.875, 9, 14, 20),
  S('15/16', 0.9375, undefined, undefined, 20),
  S('1', 1, 8, 12, 20),
  S('1 1/16', 1.0625, undefined, undefined, 18),
  S('1 1/8', 1.125, 7, 12, 18),
  S('1 3/16', 1.1875, undefined, undefined, 18),
  S('1 1/4', 1.25, 7, 12, 18),
  S('1 5/16', 1.3125, undefined, undefined, 18),
  S('1 3/8', 1.375, 6, 12, 18),
  S('1 7/16', 1.4375, undefined, undefined, 18),
  S('1 1/2', 1.5, 6, 12, 18),
  S('1 9/16', 1.5625, undefined, undefined, 18),
  S('1 5/8', 1.625, undefined, undefined, 18),
  S('1 11/16', 1.6875, undefined, undefined, 18),
  S('1 3/4', 1.75, 5),
  S('2', 2, 4.5),
];

// Średnica rdzenia nakrętki dla rozmiarów poniżej 1/4" — wartości z tabeli 2 normy [min, max]
const SMALL_MINOR: Record<string, [number, number]> = {
  '#0-80': [0.0465, 0.0514],
  '#1-64': [0.0561, 0.0622],
  '#1-72': [0.058, 0.0634],
  '#2-56': [0.0667, 0.0737],
  '#2-64': [0.0691, 0.0752],
  '#3-48': [0.0764, 0.0845],
  '#3-56': [0.0797, 0.0865],
  '#4-40': [0.0849, 0.0939],
  '#4-48': [0.0894, 0.0968],
  '#5-40': [0.0979, 0.1062],
  '#5-44': [0.1004, 0.1079],
  '#6-32': [0.104, 0.114],
  '#6-40': [0.111, 0.119],
  '#8-32': [0.13, 0.139],
  '#8-36': [0.134, 0.142],
  '#10-24': [0.145, 0.155],
  '#10-32': [0.156, 0.164],
  '#12-24': [0.171, 0.181],
  '#12-28': [0.177, 0.186],
  '#12-32': [0.182, 0.19],
};

export const sizesForSeries = (series: UnSeries): UnSize[] =>
  UN_SIZES.filter((s) => s.tpi[series] !== undefined);

const r4 = (v: number) => Math.round(v * 10000 + 1e-7) / 10000;
const r6 = (v: number) => Math.round(v * 1e6 + 1e-4) / 1e6;
const r3 = (v: number) => Math.round(v * 1000 + 1e-7) / 1000;

export type Range = { max: number; min: number; tol: number };
/** Reguła zaokrąglania jak w tabelach ASME: max do 4 miejsc, min = max − tolerancja, znów do 4. */
const range = (max: number, tol: number): Range => {
  const m = r4(max);
  return { max: m, min: r4(m - tol), tol: r4(tol) };
};

export type UnResult = {
  D: number;
  n: number;
  P: number;
  designation: string;
  pdBasic: number;
  minorBasic: number; // D1 min nakrętki
  threadHeight: number; // 5/8 H, wysokość zarysu podstawowego
  depthExt: number; // głębokość nacinania śruby (dno UNR)
  depthInt: number; // głębokość nacinania nakrętki
  ext: {
    cls: ExtClass;
    allowance: number;
    major: Range;
    pitch: Range;
    minorRef: number;
  };
  int: {
    cls: IntClass;
    pitch: Range;
    minor: { min: number; max: number | null; tol: number | null };
    majorMin: number;
  };
};

export const calcUn = (
  size: UnSize,
  series: UnSeries,
  extCls: ExtClass,
  intCls: IntClass,
): UnResult | null => {
  const n = size.tpi[series];
  if (!n) return null;
  const D = size.D;
  const P = 1 / n;

  const pdBasic = D - 0.64951905 * P;
  const minorBasic = D - 1.08253175 * P;
  // Długość zazębienia: UNC/UNF = D, UNEF = 9P
  const LE = series === 'UNEF' ? 9 * P : D;
  const t2a = r6(0.0015 * Math.cbrt(D) + 0.0015 * Math.sqrt(LE) + 0.015 * Math.cbrt(P * P));

  // --- śruba ---
  const es = extCls === '3A' ? 0 : 0.3 * t2a;
  const tPitchExt = t2a * { '1A': 1.5, '2A': 1, '3A': 0.75 }[extCls];
  const tMajor = (extCls === '1A' ? 0.09 : 0.06) * Math.pow(P, 2 / 3);
  const majorMax = D - es;
  const pitchMax = r4(pdBasic) - es;
  const minorRef = r4(majorMax) - r4(1.19078 * P); // dno z promieniem min. 0,1083 P (UNR)

  // --- nakrętka ---
  const tPitchInt = t2a * { '1B': 1.95, '2B': 1.3, '3B': 0.975 }[intCls];
  const small = SMALL_MINOR[`${size.id}-${n}`];
  let minorMin = r3(minorBasic);
  let minorMax: number | null = null;
  let minorTol: number | null = null;
  if (small) {
    [minorMin, minorMax] = small;
    minorTol = r4(minorMax - minorMin);
  } else if (intCls !== '3B') {
    minorTol = 0.25 * P - 0.4 * P * P;
    minorMax = r3(minorBasic + minorTol);
  } else if (n >= 9) {
    // klasa 3B, 9 gwintów/cal i drobniejsze
    minorTol = 0.05 * Math.pow(P, 2 / 3) + (0.03 * P) / D - 0.002;
    minorMax = r4(minorBasic + minorTol);
  }

  return {
    D,
    n,
    P,
    designation: `${size.id.startsWith('#') ? size.id : `${size.id}″`}-${n} ${series}`,
    pdBasic: r4(pdBasic),
    minorBasic: r3(minorBasic),
    threadHeight: r4(0.54126588 * P),
    depthExt: r4(0.5954 * P),
    depthInt: r4(0.54126588 * P),
    ext: {
      cls: extCls,
      allowance: r4(es),
      major: range(majorMax, tMajor),
      pitch: range(pitchMax, tPitchExt),
      minorRef: r4(minorRef),
    },
    int: {
      cls: intCls,
      pitch: { min: r4(pdBasic), max: r4(r4(pdBasic) + tPitchInt), tol: r4(tPitchInt) },
      minor: {
        min: minorMin,
        max: minorMax,
        tol: minorTol === null ? null : r4(minorTol),
      },
      majorMin: D,
    },
  };
};
