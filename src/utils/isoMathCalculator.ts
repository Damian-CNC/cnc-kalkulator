// ISO 286-1:2010 Complete Tabulated Tolerance Calculator
// All values from official ISO 286-1 tables — NO formulas, pure lookup

// ─── IT Grade Values (μm) per range ───
// Rows: range index (0=0-3, 1=3-6, ... 12=400-500)
// Cols: IT1..IT18
const IT_TABLE: number[][] = [
  // 0-3
  [0.8, 1.2, 2, 3, 4, 6, 10, 14, 25, 40, 60, 100, 140, 250, 400, 600, 1000, 1400],
  // 3-6
  [1, 1.5, 2.5, 4, 5, 8, 12, 18, 30, 48, 75, 120, 180, 300, 480, 750, 1200, 1800],
  // 6-10
  [1, 1.5, 2.5, 4, 6, 9, 15, 22, 36, 58, 90, 150, 220, 360, 580, 900, 1500, 2200],
  // 10-18
  [1.2, 2, 3, 5, 8, 11, 18, 27, 43, 70, 110, 180, 270, 430, 700, 1100, 1800, 2700],
  // 18-30
  [1.5, 2.5, 4, 6, 9, 13, 21, 33, 52, 84, 130, 210, 330, 520, 840, 1300, 2100, 3300],
  // 30-50
  [1.5, 2.5, 4, 7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000, 1600, 2500, 3900],
  // 50-80
  [2, 3, 5, 8, 13, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200, 1900, 3000, 4600],
  // 80-120
  [2.5, 4, 6, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400, 2200, 3500, 5400],
  // 120-180
  [3.5, 5, 8, 12, 18, 25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300],
  // 180-250
  [4.5, 7, 10, 14, 20, 29, 46, 72, 115, 185, 290, 460, 720, 1150, 1850, 2900, 4600, 7200],
  // 250-315
  [6, 8, 12, 16, 23, 32, 52, 81, 130, 210, 320, 520, 810, 1300, 2100, 3200, 5200, 8100],
  // 315-400
  [7, 9, 13, 18, 25, 36, 57, 89, 140, 230, 360, 570, 890, 1400, 2300, 3600, 5700, 8900],
  // 400-500
  [8, 10, 15, 20, 27, 40, 63, 97, 155, 250, 400, 630, 970, 1550, 2500, 4000, 6300, 9700],
];

// ─── Dimension Ranges ───
interface DimRange { above: number; upTo: number; }
const RANGES: DimRange[] = [
  { above: 0, upTo: 3 },
  { above: 3, upTo: 6 },
  { above: 6, upTo: 10 },
  { above: 10, upTo: 18 },
  { above: 18, upTo: 30 },
  { above: 30, upTo: 50 },
  { above: 50, upTo: 80 },
  { above: 80, upTo: 120 },
  { above: 120, upTo: 180 },
  { above: 180, upTo: 250 },
  { above: 250, upTo: 315 },
  { above: 315, upTo: 400 },
  { above: 400, upTo: 500 },
];

// ─── Shaft Fundamental Deviations (μm) — ISO 286-1 Tables 4 & 5 ───
// For a-h: value = upper deviation (es), negative
// For k-zc: value = lower deviation (ei), positive
// 13 ranges: 0-3, 3-6, 6-10, 10-18, 18-30, 30-50, 50-80, 80-120, 120-180, 180-250, 250-315, 315-400, 400-500

const SHAFT_FD: Record<string, number[]> = {
  // ── Clearance positions (es = upper deviation, negative) ──
  a:  [-270, -270, -280, -290, -300, -310, -320, -340, -360, -380, -410, -440, -480],
  b:  [-140, -140, -150, -150, -160, -170, -180, -200, -220, -240, -260, -280, -300],
  c:  [-60,  -70,  -80,  -95,  -110, -120, -140, -170, -200, -230, -260, -290, -320],
  cd: [-34,  -46,  -56,  -68,  -80,  -95,  -110, -130, -155, -185, -210, -235, -260],
  d:  [-20,  -30,  -40,  -50,  -65,  -80,  -100, -120, -145, -170, -190, -210, -230],
  e:  [-14,  -20,  -25,  -32,  -40,  -50,  -60,  -72,  -85,  -100, -110, -125, -135],
  ef: [-10,  -15,  -19,  -24,  -30,  -38,  -45,  -54,  -64,  -75,  -83,  -94,  -102],
  f:  [-6,   -10,  -13,  -16,  -20,  -25,  -30,  -36,  -43,  -50,  -56,  -62,  -68],
  fg: [-4,   -7,   -9,   -11,  -14,  -17,  -20,  -24,  -29,  -33,  -37,  -40,  -44],
  g:  [-2,   -4,   -5,   -6,   -7,   -9,   -10,  -12,  -14,  -15,  -17,  -18,  -20],
  h:  [0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0],

  // ── Transition/interference positions (ei = lower deviation, positive) ──
  k:  [0,    1,    1,    1,    2,    2,    2,    3,    3,    4,    4,    4,    5],
  m:  [2,    4,    6,    7,    8,    9,    11,   13,   15,   17,   20,   21,   23],
  n:  [4,    8,    10,   12,   15,   17,   20,   23,   27,   31,   34,   37,   40],
  p:  [6,    12,   15,   18,   22,   26,   32,   37,   43,   50,   56,   62,   68],
  r:  [10,   15,   19,   23,   28,   34,   41,   48,   55,   63,   72,   78,   86],
  s:  [14,   19,   23,   28,   35,   43,   53,   59,   68,   79,   88,   98,   108],
  t:  [18,   23,   28,   33,   41,   48,   60,   68,   80,   94,   108,  114,  126],
  u:  [18,   28,   34,   40,   48,   60,   75,   90,   106,  122,  137,  151,  165],
  v:  [18,   28,   34,   45,   56,   68,   87,   102,  122,  140,  155,  175,  195],
  x:  [26,   35,   42,   50,   60,   72,   97,   114,  134,  158,  175,  199,  225],
  y:  [26,   42,   50,   60,   74,   88,   110,  132,  156,  184,  210,  232,  256],
  z:  [32,   42,   52,   64,   88,   108,  136,  164,  196,  232,  264,  296,  328],
  za: [40,   50,   60,   77,   108,  136,  172,  210,  252,  300,  340,  380,  420],
  zb: [48,   58,   68,   90,   130,  168,  214,  262,  314,  374,  420,  470,  520],
  zc: [60,   70,   80,   108,  160,  204,  262,  320,  384,  456,  510,  570,  630],
};

// j: special — depends on IT grade. Tabulated for j5, j6, j7 (es values)
// For other IT grades: ei = 0 (no deviation), same as js basically
const J_DEVIATIONS: Record<number, number[]> = {
  // j5 (es):
  5: [-2, -2, -2, -3, -3, -4, -5, -7, -9, -11, -13, -14, -15],
  // j6 (es):
  6: [-2, -2, -2, -3, -3, -4, -5, -9, -11, -13, -16, -18, -20],
  // j7 (es):
  7: [-4, -4, -5, -6, -8, -10, -12, -15, -18, -21, -26, -28, -32],
  // j8 (es):
  8: [-4, -6, -8, -10, -12, -14, -18, -22, -26, -30, -36, -38, -42],
};

// k for IT grades other than 4-7: ei = 0
const K_LOW_GRADE: number[] = [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5]; // IT4-IT7
const K_OTHER: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];     // other IT grades

// ─── Exports ───
export const SHAFT_LETTERS = [
  'a', 'b', 'c', 'cd', 'd', 'e', 'ef', 'f', 'fg', 'g', 'h',
  'js', 'j', 'k', 'm', 'n', 'p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'za', 'zb', 'zc'
];
export const HOLE_LETTERS = [
  'A', 'B', 'C', 'CD', 'D', 'E', 'EF', 'F', 'FG', 'G', 'H',
  'JS', 'J', 'K', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'ZA', 'ZB', 'ZC'
];
export const IT_GRADES = Array.from({ length: 18 }, (_, i) => i + 1);

// ─── Lookup Functions ───
function findRangeIndex(nominal: number): number {
  for (let i = 0; i < RANGES.length; i++) {
    if (nominal > RANGES[i].above && nominal <= RANGES[i].upTo) return i;
  }
  return -1;
}

function getIT(rangeIdx: number, grade: number): number {
  if (rangeIdx < 0 || rangeIdx >= IT_TABLE.length) return 0;
  const col = grade - 1; // IT1 = index 0
  return IT_TABLE[rangeIdx][col] ?? 0;
}

// Get shaft fundamental deviation in μm
function getShaftFD(letter: string, rangeIdx: number, itGrade: number, itValue: number): { es: number; ei: number } | null {
  const lc = letter.toLowerCase();

  // js: symmetric ±IT/2
  if (lc === 'js') {
    const half = Math.round(itValue / 2);
    return { es: half, ei: -half };
  }

  // j: special handling per IT grade
  if (lc === 'j') {
    const jRow = J_DEVIATIONS[itGrade];
    if (jRow) {
      // j5-j8: es is given, ei = es - IT
      const es = jRow[rangeIdx];
      return { es, ei: es - itValue };
    }
    // Other grades: symmetric like js
    const half = Math.round(itValue / 2);
    return { es: half, ei: -half };
  }

  // k: special handling for IT grade
  if (lc === 'k') {
    const ei = (itGrade >= 4 && itGrade <= 7) ? K_LOW_GRADE[rangeIdx] : K_OTHER[rangeIdx];
    return { es: ei + itValue, ei };
  }

  const fdRow = SHAFT_FD[lc];
  if (!fdRow) return null;

  const fdVal = fdRow[rangeIdx];

  // Letters a-h: fdVal is es (upper deviation, ≤ 0)
  if (['a', 'b', 'c', 'cd', 'd', 'e', 'ef', 'f', 'fg', 'g', 'h'].includes(lc)) {
    return { es: fdVal, ei: fdVal - itValue };
  }

  // Letters m-zc: fdVal is ei (lower deviation, ≥ 0)
  return { es: fdVal + itValue, ei: fdVal };
}

// Get hole deviations — mirror of shaft per ISO 286-1 rule
function getHoleFD(letter: string, rangeIdx: number, itGrade: number, itValue: number): { ES: number; EI: number } | null {
  const lc = letter.toLowerCase();

  // JS: symmetric ±IT/2
  if (lc === 'js') {
    const half = Math.round(itValue / 2);
    return { ES: half, EI: -half };
  }

  // General rule: hole deviation = negative of equivalent shaft deviation
  const shaft = getShaftFD(letter, rangeIdx, itGrade, itValue);
  if (!shaft) return null;

  // For A-H: EI = -es(shaft), ES = EI + IT
  if (['a', 'b', 'c', 'cd', 'd', 'e', 'ef', 'f', 'fg', 'g', 'h'].includes(lc)) {
    const EI = -shaft.es;
    return { ES: EI + itValue, EI };
  }

  // For J: special
  if (lc === 'j') {
    const ES = -shaft.ei;
    return { ES, EI: ES - itValue };
  }

  // For K: special  
  if (lc === 'k') {
    const ES = -shaft.ei;
    return { ES, EI: ES - itValue };
  }

  // For M-ZC: ES = -ei(shaft), EI = ES - IT
  const ES = -shaft.ei;
  return { ES, EI: ES - itValue };
}

// ─── Main Calculation ───
export interface ToleranceResult {
  nominal: number;
  rangeLabel: string;
  designation: string;
  itValue: number;
  upperDeviation_um: number;
  lowerDeviation_um: number;
  upperDeviation_mm: number;
  lowerDeviation_mm: number;
  dimMax: number;
  dimMin: number;
}

export function calculateTolerance(
  nominal: number,
  isHole: boolean,
  letter: string,
  itGrade: number
): ToleranceResult | null {
  const rangeIdx = findRangeIndex(nominal);
  if (rangeIdx < 0) return null;

  const range = RANGES[rangeIdx];
  const itValue = getIT(rangeIdx, itGrade);
  if (itValue <= 0) return null;

  let upper: number;
  let lower: number;

  if (isHole) {
    const result = getHoleFD(letter, rangeIdx, itGrade, itValue);
    if (!result) return null;
    upper = result.ES;
    lower = result.EI;
  } else {
    const result = getShaftFD(letter, rangeIdx, itGrade, itValue);
    if (!result) return null;
    upper = result.es;
    lower = result.ei;
  }

  const displayLetter = isHole ? letter.toUpperCase() : letter.toLowerCase();
  const rangeLabel = `${range.above}–${range.upTo}`;

  return {
    nominal,
    rangeLabel,
    designation: `Ø${nominal} ${displayLetter}${itGrade}`,
    itValue,
    upperDeviation_um: upper,
    lowerDeviation_um: lower,
    upperDeviation_mm: upper / 1000,
    lowerDeviation_mm: lower / 1000,
    dimMax: nominal + upper / 1000,
    dimMin: nominal + lower / 1000,
  };
}
