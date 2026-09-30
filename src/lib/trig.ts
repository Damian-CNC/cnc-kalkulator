export const DEG = Math.PI / 180;

const sinD = (a: number) => Math.sin(a * DEG);
const cosD = (a: number) => Math.cos(a * DEG);
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const acosD = (v: number) => Math.acos(clamp1(v)) / DEG;
const asinD = (v: number) => Math.asin(clamp1(v)) / DEG;

/** Kąt w formacie stopnie° minuty' sekundy" */
export const toDms = (deg: number): string => {
  const sign = deg < 0 ? '-' : '';
  let a = Math.abs(deg);
  let d = Math.floor(a);
  a = (a - d) * 60;
  let m = Math.floor(a);
  let s = Math.round((a - m) * 60);
  if (s === 60) { s = 0; m += 1; }
  if (m === 60) { m = 0; d += 1; }
  return `${sign}${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`;
};

export type RightTriangle = {
  a: number; b: number; c: number; alpha: number; beta: number; area: number; slopePct: number;
};

/**
 * Trójkąt prostokątny: kąt prosty przy wierzchołku C.
 * a – przyprostokątna naprzeciw α, b – naprzeciw β, c – przeciwprostokątna.
 * Dane: co najmniej 2 wartości, w tym min. 1 bok. Boki mają pierwszeństwo przed kątami.
 */
export const solveRight = (
  i: { a: number | null; b: number | null; c: number | null; alpha: number | null; beta: number | null },
): RightTriangle | null => {
  let { a, b, c, alpha, beta } = i;
  const sides = [a, b, c].filter((v) => v !== null).length;
  const angles = [alpha, beta].filter((v) => v !== null).length;
  if (sides + angles < 2 || sides === 0) return null;
  if ([a, b, c].some((v) => v !== null && v <= 0)) return null;
  if ([alpha, beta].some((v) => v !== null && (v <= 0 || v >= 90))) return null;

  if (sides >= 2) {
    if (a !== null && b !== null) {
      c = Math.hypot(a, b);
    } else if (a !== null && c !== null) {
      if (c <= a) return null;
      b = Math.sqrt(c * c - a * a);
    } else if (b !== null && c !== null) {
      if (c <= b) return null;
      a = Math.sqrt(c * c - b * b);
    }
    alpha = Math.atan2(a!, b!) / DEG;
    beta = 90 - alpha;
  } else {
    if (alpha === null) alpha = 90 - beta!;
    beta = 90 - alpha;
    if (a !== null) { b = a / Math.tan(alpha * DEG); c = a / sinD(alpha); }
    else if (b !== null) { a = b * Math.tan(alpha * DEG); c = b / cosD(alpha); }
    else { a = c! * sinD(alpha); b = c! * cosD(alpha); }
  }
  return { a: a!, b: b!, c: c!, alpha: alpha!, beta: beta!, area: (a! * b!) / 2, slopePct: (a! / b!) * 100 };
};

export type Oblique = { a: number; b: number; c: number; A: number; B: number; C: number; area: number; perimeter: number };

type ObliqueResult = { sol: Oblique | null; ambiguous: boolean };

/**
 * Dowolny trójkąt. Boki a,b,c leżą naprzeciw kątów A,B,C.
 * Obsługuje SSS, SAS, ASA/AAS oraz SSA (przypadek dwuznaczny – parametr obtuse wybiera drugie rozwiązanie).
 */
export const solveOblique = (
  sidesIn: (number | null)[],
  anglesIn: (number | null)[],
  obtuse = false,
): ObliqueResult => {
  const s = [...sidesIn];
  const A = [...anglesIn];
  let ambiguous = false;
  const nS = s.filter((v) => v !== null).length;
  const nA = A.filter((v) => v !== null).length;
  if (nS + nA < 3 || nS === 0) return { sol: null, ambiguous };
  if (s.some((v) => v !== null && v <= 0) || A.some((v) => v !== null && (v <= 0 || v >= 180))) {
    return { sol: null, ambiguous };
  }

  for (let pass = 0; pass < 8; pass++) {
    // suma kątów
    if (A.filter((v) => v === null).length === 1) {
      const idx = A.findIndex((v) => v === null);
      const sum = A.reduce<number>((acc, v) => acc + (v ?? 0), 0);
      if (sum >= 180) return { sol: null, ambiguous };
      A[idx] = 180 - sum;
    }
    // prawo sinusów
    const k = [0, 1, 2].find((n) => s[n] !== null && A[n] !== null);
    if (k !== undefined) {
      const ratio = s[k]! / sinD(A[k]!);
      for (const j of [0, 1, 2]) {
        if (j === k) continue;
        if (s[j] === null && A[j] !== null) s[j] = ratio * sinD(A[j]!);
        else if (A[j] === null && s[j] !== null) {
          const sv = (s[j]! / ratio);
          if (sv > 1 + 1e-9) return { sol: null, ambiguous };
          const acute = asinD(sv);
          const alt = 180 - acute;
          if (Math.abs(acute - 90) > 1e-6 && alt + A[k]! < 180 - 1e-9 && acute + A[k]! < 180) ambiguous = true;
          const pick = obtuse ? alt : acute;
          if (pick + A[k]! >= 180) return { sol: null, ambiguous };
          A[j] = pick;
        }
      }
    }
    // prawo cosinusów – trzy boki
    if (s.every((v) => v !== null) && A.some((v) => v === null)) {
      const [a, b, c] = s as number[];
      if (a + b <= c || a + c <= b || b + c <= a) return { sol: null, ambiguous };
      A[0] = acosD((b * b + c * c - a * a) / (2 * b * c));
      A[1] = acosD((a * a + c * c - b * b) / (2 * a * c));
      A[2] = 180 - A[0]! - A[1]!;
    }
    // prawo cosinusów – dwa boki i kąt między nimi
    for (const n of [0, 1, 2]) {
      if (s[n] === null && A[n] !== null) {
        const [p, q] = [0, 1, 2].filter((x) => x !== n);
        if (s[p] !== null && s[q] !== null) {
          s[n] = Math.sqrt(s[p]! ** 2 + s[q]! ** 2 - 2 * s[p]! * s[q]! * cosD(A[n]!));
        }
      }
    }
  }
  if (s.some((v) => v === null) || A.some((v) => v === null)) return { sol: null, ambiguous };
  const [a, b, c] = s as number[];
  const [Aa, Bb, Cc] = A as number[];
  return {
    sol: { a, b, c, A: Aa, B: Bb, C: Cc, area: 0.5 * b * c * sinD(Aa), perimeter: a + b + c },
    ambiguous,
  };
};
