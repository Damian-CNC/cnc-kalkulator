/** I, J, K dla G2/G3: łuk z promienia albo ze środka. Obliczenia w płaszczyźnie (u, v). */

export type Plane = 'G17' | 'G18' | 'G19';

/** Osie i słowa przesunięcia środka dla każdej płaszczyzny (u, v tworzą układ prawoskrętny). */
export const PLANES: Record<Plane, { u: string; v: string; iu: string; iv: string }> = {
  G17: { u: 'X', v: 'Y', iu: 'I', iv: 'J' },
  G18: { u: 'Z', v: 'X', iu: 'K', iv: 'I' },
  G19: { u: 'Y', v: 'Z', iu: 'J', iv: 'K' },
};

export type ArcResult = {
  r: number;
  cu: number;
  cv: number;
  iu: number; // przesunięcie środka względem punktu startu
  iv: number;
  rSigned: number; // R do zapisu z promieniem (ujemny dla łuku > 180°)
  sweepDeg: number;
  length: number;
  endMismatch: number; // różnica promienia w punkcie końcowym (przy podanym środku)
};

export type ArcError = 'sameStart' | 'tooSmall' | 'zeroRadius' | 'badCenter';

const norm = (a: number) => {
  const t = a % (2 * Math.PI);
  return t < 0 ? t + 2 * Math.PI : t;
};

const finish = (
  su: number, sv: number, eu: number, ev: number,
  cu: number, cv: number, ccw: boolean, fullCircle: boolean,
): ArcResult => {
  const r = Math.hypot(su - cu, sv - cv);
  const a1 = Math.atan2(sv - cv, su - cu);
  const a2 = Math.atan2(ev - cv, eu - cu);
  let sweep = ccw ? norm(a2 - a1) : norm(a1 - a2);
  if (fullCircle || sweep < 1e-9) sweep = 2 * Math.PI;
  return {
    r,
    cu,
    cv,
    iu: cu - su,
    iv: cv - sv,
    rSigned: sweep > Math.PI + 1e-9 ? -r : r,
    sweepDeg: (sweep * 180) / Math.PI,
    length: r * sweep,
    endMismatch: Math.abs(Math.hypot(eu - cu, ev - cv) - r),
  };
};

/** Łuk z promienia: ccw = G3, major = łuk większy niż 180°. */
export const arcFromRadius = (
  su: number, sv: number, eu: number, ev: number, r: number, ccw: boolean, major: boolean,
): ArcResult | ArcError => {
  if (!(r > 0)) return 'zeroRadius';
  const du = eu - su;
  const dv = ev - sv;
  const d = Math.hypot(du, dv);
  if (d < 1e-9) return 'sameStart';
  if (r < d / 2 - 1e-9) return 'tooSmall';
  const h = Math.sqrt(Math.max(0, r * r - (d / 2) * (d / 2)));
  const mu = (su + eu) / 2;
  const mv = (sv + ev) / 2;
  // lewa normalna do kierunku start→koniec
  const nu = -dv / d;
  const nv = du / d;
  const s = (ccw ? 1 : -1) * (major ? -1 : 1);
  return finish(su, sv, eu, ev, mu + s * h * nu, mv + s * h * nv, ccw, false);
};

/** Łuk ze środka podanego jako przesunięcie (I, J) od punktu startu. */
export const arcFromCenter = (
  su: number, sv: number, eu: number, ev: number, iu: number, iv: number, ccw: boolean,
): ArcResult | ArcError => {
  const cu = su + iu;
  const cv = sv + iv;
  if (Math.hypot(iu, iv) < 1e-9) return 'badCenter';
  const full = Math.hypot(eu - su, ev - sv) < 1e-9;
  return finish(su, sv, eu, ev, cu, cv, ccw, full);
};
