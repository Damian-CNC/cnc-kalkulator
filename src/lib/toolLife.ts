/** Trwałość narzędzia wg Taylora: V · T^n = C. */

export const TYPICAL_N: { id: string; n: number }[] = [
  { id: 'hss', n: 0.125 },
  { id: 'carbide', n: 0.25 },
  { id: 'ceramic', n: 0.5 },
];

/** Wykładnik n z dwóch prób (V1, T1) i (V2, T2). */
export const taylorN = (v1: number, t1: number, v2: number, t2: number): number | null => {
  if (!(v1 > 0 && t1 > 0 && v2 > 0 && t2 > 0) || v1 === v2 || t1 === t2) return null;
  const n = Math.log(v1 / v2) / Math.log(t2 / t1);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const taylorC = (v: number, t: number, n: number): number => v * Math.pow(t, n);

/** Trwałość T [min] przy prędkości V. */
export const lifeAt = (c: number, n: number, v: number): number => Math.pow(c / v, 1 / n);

/** Prędkość V dla zadanej trwałości T [min]. */
export const speedFor = (c: number, n: number, t: number): number => c / Math.pow(t, n);
