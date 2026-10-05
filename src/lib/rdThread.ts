/**
 * Gwint okrągły Rd wg DIN 405 (kąt zarysu 30°, skok podawany w zwojach na cal).
 * Wzory dopasowane do tabel DIN 405 (dane producenta sprawdzianów):
 *  śruba:     d1 = d − P,  d2 = d − 0,5·P
 *  nakrętka:  D = d + 0,1·P,  D2 = d − 0,5·P,  D1 = d − 0,9·P
 * Tolerancje zależą od skoku i są stałe dla danego skoku.
 */

export const MM_PER_IN = 25.4;

export type RdSize = { d: number; tpi: number; series2: boolean };

const SERIES2 = new Set([34, 38, 42, 46, 50, 58, 62, 68, 72, 78, 82, 88, 92, 98, 105, 115, 125,
  135, 145, 155, 165, 175, 185, 195]);

const sizes: RdSize[] = [];
const add = (list: number[], tpi: number) =>
  list.forEach((d) => sizes.push({ d, tpi, series2: SERIES2.has(d) }));
add([8, 9, 10, 11, 12], 10);
add([14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38], 8);
add([40, 42, 44, 46, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92,
  95, 98, 100], 6);
add([105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190,
  195, 200], 4);
export const RD_SIZES = sizes;

// Tolerancje [mm] dla danego skoku (zwoje/cal)
const TOL: Record<number, {
  major: number; pitch: number; minor: number; // śruba: 6h / 7h / 7h
  nutPitch: number; nutMinor: number; // nakrętka
}> = {
  10: { major: 0.335, pitch: 0.2, minor: 0.25, nutPitch: 0.265, nutMinor: 0.45 },
  8: { major: 0.375, pitch: 0.236, minor: 0.3, nutPitch: 0.315, nutMinor: 0.53 },
  6: { major: 0.475, pitch: 0.3, minor: 0.375, nutPitch: 0.4, nutMinor: 0.63 },
  4: { major: 0.63, pitch: 0.4, minor: 0.5, nutPitch: 0.53, nutMinor: 0.83 },
};

// zaokrąglenie do 0,001 z połówkami w dół, jak w tabelach
const r3 = (v: number) => Math.round(v * 1000 - 1e-6) / 1000;

export type Range = { max: number; min: number; tol: number };
const rng = (max: number, tol: number): Range => ({ max: r3(max), min: r3(max - tol), tol });
const rngUp = (min: number, tol: number): Range => ({ min: r3(min), max: r3(min + tol), tol });

export type RdResult = {
  d: number;
  tpi: number;
  P: number;
  series2: boolean;
  designation: string;
  depth: number;
  bolt: { major: Range; pitch: Range; minor: Range };
  nut: { majorMin: number; pitch: Range; minor: Range };
};

export const calcRd = (size: RdSize): RdResult | null => {
  const tol = TOL[size.tpi];
  if (!tol) return null;
  const { d, tpi } = size;
  const P = MM_PER_IN / tpi;
  return {
    d,
    tpi,
    P,
    series2: size.series2,
    designation: `Rd ${d} × 1/${tpi}″`,
    depth: r3(P / 2),
    bolt: {
      major: rng(d, tol.major),
      pitch: rng(d - 0.5 * P, tol.pitch),
      minor: rng(d - P, tol.minor),
    },
    nut: {
      majorMin: Math.round((d + 0.1 * P) * 1000) / 1000,
      pitch: rngUp(d - 0.5 * P, tol.nutPitch),
      minor: rngUp(d - 0.9 * P, tol.nutMinor),
    },
  };
};
