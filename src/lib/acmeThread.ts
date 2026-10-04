/**
 * Gwinty trapezowe calowe Acme (ogólnego przeznaczenia, 29°) wg ASME B1.5-1997.
 * Klasy 2G, 3G, 4G. Wzory z rozdz. 2 normy; tolerancja średnicy podziałowej
 * TD2 = Kp·√P + Kd·√D, naddatek średnicy podziałowej wg tabeli 9.
 * Dotyczy gwintu jednozwojnego i długości zazębienia do 2D.
 */

export type AcmeClass = '2G' | '3G' | '4G';
export const ACME_CLASSES: AcmeClass[] = ['2G', '3G', '4G'];
export const MM = 25.4;

export type AcmeSize = { id: string; D: number; n: number };

const A = (id: string, D: number, n: number): AcmeSize => ({ id, D, n });
// Seria znormalizowana (tabela 2)
export const ACME_SIZES: AcmeSize[] = [
  A('1/4', 0.25, 16), A('5/16', 0.3125, 14), A('3/8', 0.375, 12), A('7/16', 0.4375, 12),
  A('1/2', 0.5, 10), A('5/8', 0.625, 8), A('3/4', 0.75, 6), A('7/8', 0.875, 6),
  A('1', 1, 5), A('1 1/8', 1.125, 5), A('1 1/4', 1.25, 5), A('1 3/8', 1.375, 4),
  A('1 1/2', 1.5, 4), A('1 3/4', 1.75, 4), A('2', 2, 4), A('2 1/4', 2.25, 3),
  A('2 1/2', 2.5, 3), A('2 3/4', 2.75, 3), A('3', 3, 2), A('3 1/2', 3.5, 2),
  A('4', 4, 2), A('4 1/2', 4.5, 2), A('5', 5, 2),
];

// Znamionowe średnice z tabel tolerancji; dla pośrednich bierze się następną większą
const NOMINALS = [0.25, 0.3125, 0.375, 0.4375, 0.5, 0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.375,
  1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5];

// Zakresy tabeli 9: [górna granica, średnia średnica zakresu]
const ALLOW_RANGES: [number, number][] = [
  [3 / 16, 3 / 32], [5 / 16, 0.25], [7 / 16, 0.375], [9 / 16, 0.5], [11 / 16, 0.625],
  [13 / 16, 0.75], [15 / 16, 0.875], [1 + 1 / 16, 1], [1 + 3 / 16, 1.125], [1 + 5 / 16, 1.25],
  [1 + 7 / 16, 1.375], [1 + 9 / 16, 1.5], [1 + 7 / 8, 1.71875], [2 + 1 / 8, 2], [2 + 3 / 8, 2.25],
  [2 + 5 / 8, 2.5], [2 + 7 / 8, 2.75], [3.25, 3.0625], [3.75, 3.5], [4.25, 4], [4.75, 4.5],
  [5.5, 5.125],
];

const K_ALLOW: Record<AcmeClass, number> = { '2G': 0.008, '3G': 0.006, '4G': 0.004 };
const K_PITCH: Record<AcmeClass, [number, number]> = {
  '2G': [0.03, 0.006],
  '3G': [0.014, 0.0028],
  '4G': [0.01, 0.002],
};

const r4 = (v: number) => Math.round(v * 10000 + 1e-7) / 10000;
const r4d = (v: number) => Math.round(v * 10000 - 1e-7) / 10000; // połówki w dół (jak 0,05P w tabeli 4)

export type Lim = { max: number; min: number; tol: number };
const mk = (max: number, tol: number): Lim => {
  const m = r4(max);
  return { max: m, min: r4(m - tol), tol: r4(tol) };
};

export type AcmeResult = {
  D: number;
  n: number;
  P: number;
  starts: number;
  lead: number;
  leadAngle: number; // °
  designation: string;
  h: number; // wysokość podstawowa P/2
  depth: number; // głębokość nacinania (od średnicy zewn. do dna)
  clearance: number; // luz na średnicy zewn./rdzenia
  pitchAllowance: number;
  pitchTol: number;
  bolt: {
    major: Lim;
    pitch: Lim;
    minor: Lim;
    crestFlat: number;
    rootFlat: number;
  };
  nut: {
    major: Lim;
    pitch: Lim;
    minor: Lim;
    crestFlat: number;
    rootFlat: number;
  };
  inRange: boolean;
};

export const calcAcme = (
  D: number,
  n: number,
  cls: AcmeClass,
  starts = 1,
): AcmeResult | null => {
  if (!(D > 0) || !(n > 0)) return null;
  const P = 1 / n;
  const h = P / 2;
  const inRange = D >= 0.25 - 1e-9 && D <= 5 + 1e-9;

  // średnica nominalna do tabel tolerancji
  const Dtab = NOMINALS.find((x) => x >= D - 1e-9) ?? NOMINALS[NOMINALS.length - 1];
  const [kp, kd] = K_PITCH[cls];
  const td2 = kp * Math.sqrt(P) + kd * Math.sqrt(Dtab);

  const range = ALLOW_RANGES.find(([up]) => D <= up + 1e-9) ?? ALLOW_RANGES[ALLOW_RANGES.length - 1];
  const es = r4(K_ALLOW[cls] * Math.sqrt(range[1]));

  const c = n < 12 ? 0.02 : 0.01; // luz na średnicy zewn. i rdzenia
  const tLM = P * 0.05 < 0.005 ? 0.005 : r4d(P * 0.05); // tolerancja średnicy zewn./rdzenia nakrętki

  const D2 = D - h;
  const D1 = D - P;

  // śruba
  const boltMajor = mk(D, tLM);
  const boltPitch = mk(r4(D2) - es, td2);
  const boltMinor = mk(D1 - c, 1.5 * td2);
  // nakrętka
  const nutMajorLim: Lim = { min: r4(D + c), max: r4(D + c + tLM), tol: r4(tLM) };
  const nutPitch: Lim = { min: r4(D2), max: r4(r4(D2) + td2), tol: r4(td2) };
  const nutMinor: Lim = { min: r4(D1), max: r4(D1 + tLM), tol: r4(tLM) };

  const lead = starts * P;
  const leadAngle = (Math.atan(lead / (Math.PI * D2)) * 180) / Math.PI;

  return {
    D,
    n,
    P,
    starts,
    lead,
    leadAngle,
    designation: `${D.toFixed(3)}-${n}-ACME-${cls}`,
    h: r4(h),
    depth: r4d(h + c / 2),
    clearance: c,
    pitchAllowance: es,
    pitchTol: r4(td2),
    bolt: {
      major: boltMajor,
      pitch: boltPitch,
      minor: boltMinor,
      crestFlat: r4(0.3707 * P - 0.259 * es),
      rootFlat: r4(0.3707 * P - 0.259 * (c - es)),
    },
    nut: {
      major: nutMajorLim,
      pitch: nutPitch,
      minor: nutMinor,
      crestFlat: r4(0.3707 * P),
      rootFlat: r4(0.3707 * P - 0.259 * c),
    },
    inRange,
  };
};
