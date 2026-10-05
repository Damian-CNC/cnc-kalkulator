/**
 * Gwint oporowy metryczny S wg DIN 513 (zarys 3°/30°, kąt łączny 33°).
 * Wymiary nominalne zarysu podstawowego (bez tolerancji):
 *  h3 = 0,86777·P, H1 = 0,75·P, R = 0,12427·P, d2 = D2 = d − 0,75·P, D1 = d − 1,5·P.
 */

export type ButtressSize = { d: number; P: number };

const S = (d: number, P: number): ButtressSize => ({ d, P });
export const BUTTRESS_SIZES: ButtressSize[] = [
  S(10, 2), S(12, 3), S(14, 3), S(16, 4), S(18, 4), S(20, 4), S(22, 5), S(24, 5), S(26, 5),
  S(28, 5), S(30, 6), S(32, 6), S(34, 6), S(36, 6), S(38, 7), S(40, 7), S(42, 7), S(44, 7),
  S(46, 8), S(48, 8), S(50, 8), S(52, 8), S(55, 9), S(60, 9), S(65, 10), S(70, 10), S(75, 10),
  S(80, 10), S(85, 12), S(90, 12), S(95, 12), S(100, 12), S(110, 14), S(120, 14), S(130, 14),
  S(140, 14), S(150, 16), S(160, 16), S(170, 16), S(180, 16), S(190, 18), S(200, 18), S(210, 20),
  S(220, 20), S(230, 20), S(240, 20), S(250, 22), S(260, 22), S(270, 22), S(280, 22), S(290, 24),
  S(300, 24),
];

const r3 = (v: number) => Math.round(v * 1000 + 1e-7) / 1000;

export type ButtressResult = {
  designation: string;
  d: number;
  P: number;
  h3: number;
  H1: number;
  R: number;
  d2: number;
  d3: number;
  D1: number;
};

export const calcButtress = (d: number, P: number): ButtressResult | null => {
  if (!(d > 0) || !(P > 0) || d <= 2 * P) return null;
  const h3 = 0.86777 * P;
  return {
    designation: `S ${d} × ${P}`,
    d,
    P,
    h3: r3(h3),
    H1: r3(0.75 * P),
    R: r3(0.12427 * P),
    d2: r3(d - 0.75 * P),
    d3: r3(d - 2 * h3),
    D1: r3(d - 1.5 * P),
  };
};
