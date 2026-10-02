/**
 * Otwory pod śruby: otwór przelotowy (ISO 273), wytoczenie / przetoczenie
 * pod łeb lub nakrętkę oraz pogłębienie stożkowe (ISO 7721 / ISO 15065).
 * Wymiary łbów wg norm wyrobu; wytoczenia liczone z luzem (zbliżone do DIN 974-1).
 */

export type Series = 'fine' | 'medium' | 'coarse';
export type Fit = 'close' | 'normal' | 'loose';
export type Mode = 'cbore' | 'spot' | 'none';
export type HeadId =
  | 'socket'
  | 'lowSocket'
  | 'hexIso'
  | 'hexDin'
  | 'csk'
  | 'button'
  | 'cheese'
  | 'pan'
  | 'nut'
  | 'custom';

// d -> [fine, medium, coarse] wg ISO 273
export const ISO273: Record<string, [number, number, number]> = {
  '1.6': [1.7, 1.8, 2],
  '2': [2.2, 2.4, 2.6],
  '2.5': [2.7, 2.9, 3.1],
  '3': [3.2, 3.4, 3.6],
  '3.5': [3.7, 3.9, 4.2],
  '4': [4.3, 4.5, 4.8],
  '5': [5.3, 5.5, 5.8],
  '6': [6.4, 6.6, 7],
  '7': [7.4, 7.6, 8],
  '8': [8.4, 9, 10],
  '10': [10.5, 11, 12],
  '12': [13, 13.5, 14.5],
  '14': [15, 15.5, 16.5],
  '16': [17, 17.5, 18.5],
  '18': [19, 20, 21],
  '20': [21, 22, 24],
  '22': [23, 24, 26],
  '24': [25, 26, 28],
  '27': [28, 30, 32],
  '30': [31, 33, 35],
  '33': [34, 36, 38],
  '36': [37, 39, 42],
  '39': [40, 42, 45],
  '42': [43, 45, 48],
  '45': [46, 48, 52],
  '48': [50, 52, 56],
};
export const SIZES = Object.keys(ISO273);

// ISO 286-1: tolerancje IT12 / IT13 / IT14 (µm) dla zakresów średnic
const IT_RANGES: { upTo: number; it: [number, number, number] }[] = [
  { upTo: 3, it: [100, 140, 250] },
  { upTo: 6, it: [120, 180, 300] },
  { upTo: 10, it: [150, 220, 360] },
  { upTo: 18, it: [180, 270, 430] },
  { upTo: 30, it: [210, 330, 520] },
  { upTo: 50, it: [250, 390, 620] },
  { upTo: 80, it: [300, 460, 740] },
  { upTo: 120, it: [350, 540, 870] },
];
const SERIES_INDEX: Record<Series, 0 | 1 | 2> = { fine: 0, medium: 1, coarse: 2 };
const SERIES_GRADE: Record<Series, string> = { fine: 'H12', medium: 'H13', coarse: 'H14' };

/** Tolerancja H (µm) dla średnicy i szeregu: H12 / H13 / H14. */
export const holeTolerance = (dia: number, series: Series): number => {
  const row = IT_RANGES.find((r) => dia <= r.upTo) ?? IT_RANGES[IT_RANGES.length - 1];
  return row.it[SERIES_INDEX[series]];
};
export const seriesGrade = (s: Series) => SERIES_GRADE[s];

type HeadDim = { a: number; k: number }; // a = dk (okrągły) albo s (klucz), k = wysokość

const T = (rows: [string, number, number][]): Record<string, HeadDim> =>
  Object.fromEntries(rows.map(([m, a, k]) => [m, { a, k }]));

export const HEAD_DATA: Record<Exclude<HeadId, 'custom'>, {
  shape: 'round' | 'hex' | 'csk';
  dims: Record<string, HeadDim>;
}> = {
  socket: {
    shape: 'round',
    dims: T([
      ['1.6', 3, 1.6], ['2', 3.8, 2], ['2.5', 4.5, 2.5], ['3', 5.5, 3], ['4', 7, 4],
      ['5', 8.5, 5], ['6', 10, 6], ['8', 13, 8], ['10', 16, 10], ['12', 18, 12],
      ['14', 21, 14], ['16', 24, 16], ['18', 27, 18], ['20', 30, 20], ['22', 33, 22],
      ['24', 36, 24], ['27', 40, 27], ['30', 45, 30], ['36', 54, 36], ['42', 63, 42],
      ['48', 72, 48],
    ]),
  },
  lowSocket: {
    shape: 'round',
    dims: T([
      ['3', 5.5, 2], ['4', 7, 2.8], ['5', 8.5, 3.5], ['6', 10, 4], ['8', 13, 5],
      ['10', 16, 6], ['12', 18, 7], ['14', 21, 8], ['16', 24, 9],
    ]),
  },
  hexIso: {
    shape: 'hex',
    dims: T([
      ['3', 5.5, 2], ['4', 7, 2.8], ['5', 8, 3.5], ['6', 10, 4], ['8', 13, 5.3],
      ['10', 16, 6.4], ['12', 18, 7.5], ['14', 21, 8.8], ['16', 24, 10], ['18', 27, 11.5],
      ['20', 30, 12.5], ['22', 34, 14], ['24', 36, 15], ['27', 41, 17], ['30', 46, 18.7],
      ['36', 55, 22.5], ['42', 65, 26], ['48', 75, 30],
    ]),
  },
  hexDin: {
    shape: 'hex',
    dims: T([
      ['3', 5.5, 2], ['4', 7, 2.8], ['5', 8, 3.5], ['6', 10, 4], ['8', 13, 5.3],
      ['10', 17, 6.4], ['12', 19, 7.5], ['14', 22, 8.8], ['16', 24, 10], ['18', 27, 11.5],
      ['20', 30, 12.5], ['22', 32, 14], ['24', 36, 15], ['27', 41, 17], ['30', 46, 18.7],
      ['36', 55, 22.5], ['42', 65, 26], ['48', 75, 30],
    ]),
  },
  csk: {
    shape: 'csk',
    dims: T([
      ['3', 6.72, 1.86], ['4', 8.96, 2.48], ['5', 11.2, 3.1], ['6', 13.44, 3.72],
      ['8', 17.92, 4.96], ['10', 22.4, 6.2], ['12', 26.88, 7.44], ['16', 33.6, 8.8],
      ['20', 40.32, 10.16],
    ]),
  },
  button: {
    shape: 'round',
    dims: T([
      ['3', 5.7, 1.65], ['4', 7.6, 2.2], ['5', 9.5, 2.75], ['6', 10.5, 3.3], ['8', 14, 4.4],
      ['10', 17.5, 5.5], ['12', 21, 6.6], ['16', 28, 8.8],
    ]),
  },
  cheese: {
    shape: 'round',
    dims: T([
      ['3', 5.5, 2], ['4', 7, 2.6], ['5', 8.5, 3.3], ['6', 10, 3.9], ['8', 13, 5], ['10', 16, 6],
    ]),
  },
  pan: {
    shape: 'round',
    dims: T([
      ['3', 6, 2.4], ['4', 8, 3.1], ['5', 10, 3.8], ['6', 12, 4.6], ['8', 16, 6], ['10', 20, 7.5],
    ]),
  },
  nut: {
    shape: 'hex',
    dims: T([
      ['3', 5.5, 2.4], ['4', 7, 3.2], ['5', 8, 4.7], ['6', 10, 5.2], ['8', 13, 6.8],
      ['10', 16, 8.4], ['12', 18, 10.8], ['14', 21, 12.8], ['16', 24, 14.8], ['18', 27, 15.8],
      ['20', 30, 18], ['22', 34, 19.4], ['24', 36, 21.5], ['27', 41, 23.8], ['30', 46, 25.6],
      ['36', 55, 31],
    ]),
  },
};
export const HEAD_IDS = [...Object.keys(HEAD_DATA), 'custom'] as HeadId[];

// Podkładki: d2 (średnica zewn.), h (grubość)
export const WASHERS: Record<'w7089' | 'w7093', Record<string, [number, number]>> = {
  w7089: {
    '3': [7, 0.5], '4': [9, 0.8], '5': [10, 1], '6': [12, 1.6], '8': [16, 1.6], '10': [20, 2],
    '12': [24, 2.5], '14': [28, 2.5], '16': [30, 3], '18': [34, 3], '20': [37, 3], '22': [39, 3],
    '24': [44, 4], '27': [50, 4], '30': [56, 4], '36': [66, 5],
  },
  w7093: {
    '3': [9, 0.8], '4': [12, 1], '5': [15, 1.2], '6': [18, 1.6], '8': [24, 2], '10': [30, 2.5],
    '12': [37, 3], '14': [44, 3], '16': [50, 3], '20': [60, 4], '24': [72, 5],
  },
};

const FIT_RATIO: Record<Fit, number> = { close: 0.05, normal: 0.1, loose: 0.2 };
const FIT_MIN: Record<Fit, number> = { close: 0.3, normal: 0.5, loose: 1 };
const CSK_ALLOW: Record<Fit, number> = { close: 0.2, normal: 0.4, loose: 0.8 };

const ceilTo = (v: number, step: number) => Math.ceil(v / step - 1e-9) * step;
const r2 = (v: number) => Math.round(v * 100) / 100;

export const STD_LENGTHS = [
  4, 5, 6, 8, 10, 12, 14, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120,
  130, 140, 150, 160, 180, 200,
];
export const ENGAGEMENT: Record<'steel' | 'cast' | 'alu', number> = { steel: 1, cast: 1.5, alu: 2 };

export type HolesInput = {
  size: string;
  head: HeadId;
  series: Series;
  fit: Fit;
  mode: Mode;
  washer: 'none' | 'w7089' | 'w7093' | 'custom';
  washerOd?: number;
  washerTh?: number;
  customShape: 'round' | 'hex';
  customA?: number;
  customK?: number;
  recess: number;
  spotDepth: number;
  angle: number;
  plate?: number;
  material: 'steel' | 'cast' | 'alu';
};

export type HolesResult = {
  d: number;
  hole: { nominal: number; tolUm: number; grade: string; min: number; max: number };
  headShape: 'round' | 'hex' | 'csk';
  headA: number; // dk albo s
  headK: number;
  headEff: number; // średnica opisana (okrągła lub po narożach)
  washer: { od: number; th: number } | null;
  kind: 'csk' | 'cbore' | 'spot' | 'none';
  big?: { dia: number; tolUm: number; depth: number };
  csk?: { dia: number; depth: number; angle: number };
  remaining: number | null;
  length: { min: number; std: number | null; engagement: number } | null;
  warnings: string[];
};

export const headAvailable = (head: HeadId, size: string): boolean =>
  head === 'custom' || !!HEAD_DATA[head as Exclude<HeadId, 'custom'>].dims[size];

export const calcHoles = (inp: HolesInput): HolesResult | null => {
  const row = ISO273[inp.size];
  if (!row) return null;
  const d = Number(inp.size);
  const nominal = row[SERIES_INDEX[inp.series]];
  const tolUm = holeTolerance(nominal, inp.series);
  const warnings: string[] = [];

  let shape: 'round' | 'hex' | 'csk';
  let a: number;
  let k: number;
  if (inp.head === 'custom') {
    if (!inp.customA || !inp.customK || inp.customA <= 0 || inp.customK <= 0) return null;
    shape = inp.customShape;
    a = inp.customA;
    k = inp.customK;
  } else {
    const dim = HEAD_DATA[inp.head].dims[inp.size];
    if (!dim) return null;
    shape = HEAD_DATA[inp.head].shape;
    a = dim.a;
    k = dim.k;
  }
  const headEff = shape === 'hex' ? a * 1.1547 : a;

  let washer: { od: number; th: number } | null = null;
  if (inp.washer === 'custom') {
    if (inp.washerOd && inp.washerTh && inp.washerOd > 0 && inp.washerTh > 0) {
      washer = { od: inp.washerOd, th: inp.washerTh };
    }
  } else if (inp.washer !== 'none') {
    const w = WASHERS[inp.washer][inp.size];
    if (w) washer = { od: w[0], th: w[1] };
    else warnings.push('noWasher');
  }
  if (shape === 'csk') washer = null;

  const recess = Math.max(0, inp.recess || 0);
  const kind: HolesResult['kind'] =
    shape === 'csk' && inp.mode !== 'none' ? 'csk' : inp.mode === 'none' ? 'none' : inp.mode;

  const result: HolesResult = {
    d,
    hole: {
      nominal,
      tolUm,
      grade: SERIES_GRADE[inp.series],
      min: nominal,
      max: r2(nominal + tolUm / 1000),
    },
    headShape: shape,
    headA: a,
    headEff: r2(headEff),
    headK: k,
    washer,
    kind,
    remaining: null,
    length: null,
    warnings,
  };

  let underHead = 0; // głębokość płaszczyzny pod łbem względem lica (>0 = poniżej)
  const hw = washer ? washer.th : 0;

  if (kind === 'csk') {
    const tan = Math.tan((inp.angle * Math.PI) / 360);
    const dia = r2(a + CSK_ALLOW[inp.fit] + 2 * recess * tan);
    const depth = r2((dia - nominal) / 2 / tan);
    result.csk = { dia, depth, angle: inp.angle };
    if (dia <= nominal) warnings.push('cskSmall');
    if (inp.plate !== undefined && inp.plate > 0) {
      result.remaining = r2(inp.plate - depth);
    }
    underHead = recess; // długość całkowita liczona od wierzchu łba
  } else if (kind === 'cbore' || kind === 'spot') {
    const base = Math.max(headEff, washer ? washer.od : 0);
    const dia = ceilTo(base + Math.max(FIT_MIN[inp.fit], FIT_RATIO[inp.fit] * base), 0.5);
    const depth =
      kind === 'cbore' ? r2(ceilTo(k + hw + recess, 0.1)) : Math.max(0, inp.spotDepth || 0);
    const tol = holeTolerance(dia, 'medium');
    result.big = { dia, tolUm: tol, depth };
    if (dia <= nominal) warnings.push('cboreSmall');
    if (inp.plate !== undefined && inp.plate > 0) {
      result.remaining = r2(inp.plate - depth);
    }
    underHead = depth - hw;
  } else {
    underHead = -hw;
  }

  if (result.remaining !== null) {
    if (result.remaining <= 0) warnings.push('platePierced');
    else if (result.remaining < Math.max(1, 0.3 * d)) warnings.push('plateThin');
  }

  if (inp.plate !== undefined && inp.plate > 0 && inp.head !== 'nut') {
    const engagement = ENGAGEMENT[inp.material] * d;
    const min = inp.plate - underHead + engagement;
    const std = STD_LENGTHS.find((l) => l >= min - 1e-9) ?? null;
    result.length = { min: r2(min), std, engagement: r2(engagement) };
  }

  return result;
};
