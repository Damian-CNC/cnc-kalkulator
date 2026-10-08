/**
 * Gwint pancerny Pg wg DIN 40430 (zarys 80°, wycofany w 2000 r., zastąpiony gwintem metrycznym).
 * Wymiary podstawowe: H1 = 0,4766·P (zaokrąglone do 0,01 jak w tabelach),
 * d2 = d − H1, d1 = d − 2·H1, promień R = 0,1066·P.
 */

export type PgSize = { id: string; d: number; tpi: number; metric?: string };

export const PG_SIZES: PgSize[] = [
  { id: 'Pg 7', d: 12.5, tpi: 20, metric: 'M12 / M16 × 1,5' },
  { id: 'Pg 9', d: 15.2, tpi: 18, metric: 'M16 × 1,5' },
  { id: 'Pg 11', d: 18.6, tpi: 18, metric: 'M20 × 1,5' },
  { id: 'Pg 13,5', d: 20.4, tpi: 18, metric: 'M20 / M25 × 1,5' },
  { id: 'Pg 16', d: 22.5, tpi: 18, metric: 'M20 / M25 × 1,5' },
  { id: 'Pg 21', d: 28.3, tpi: 16, metric: 'M25 / M32 × 1,5' },
  { id: 'Pg 29', d: 37.0, tpi: 16 },
  { id: 'Pg 36', d: 47.0, tpi: 16 },
  { id: 'Pg 42', d: 54.0, tpi: 16 },
  { id: 'Pg 48', d: 59.3, tpi: 16 },
];

const r2 = (v: number) => Math.round(v * 100 + 1e-7) / 100;
const r3 = (v: number) => Math.round(v * 1000 + 1e-7) / 1000;
const r1 = (v: number) => Math.round(v * 10 + 1e-7) / 10;

export type PgResult = {
  id: string;
  d: number;
  tpi: number;
  P: number;
  H1: number;
  R: number;
  d2: number;
  d1: number;
  drill: number;
  metric?: string;
};

export const calcPg = (s: PgSize): PgResult => {
  const P = 25.4 / s.tpi;
  const H1 = r2(0.4766 * P);
  return {
    id: s.id,
    d: s.d,
    tpi: s.tpi,
    P: r3(P),
    H1,
    R: r2(0.1066 * P),
    d2: r2(s.d - H1),
    d1: r2(s.d - 2 * H1),
    drill: r1(s.d - 2 * H1),
    metric: s.metric,
  };
};
