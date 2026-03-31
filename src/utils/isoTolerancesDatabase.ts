// ISO 286-1 Tolerance Calculator
// Dimension ranges per ISO 286-1 (mm)

export interface DimensionRange {
  above: number; // powyżej (exclusive)
  upTo: number;  // do włącznie (inclusive)
}

export const DIMENSION_RANGES: DimensionRange[] = [
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

// IT grade values in micrometers per dimension range index
// Source: ISO 286-1 Table
// Rows = dimension range index, Columns = IT01, IT0, IT1..IT18
const IT_VALUES: Record<number, number[]> = {
  // index 0: >0..3
  0:  [0.3, 0.5, 0.8, 1.2, 2, 3, 4, 6, 10, 14, 25, 40, 60, 100, 140, 250, 400, 600, 1000, 1400],
  // index 1: >3..6
  1:  [0.4, 0.6, 1, 1.5, 2.5, 4, 5, 8, 12, 18, 30, 48, 75, 120, 180, 300, 480, 750, 1200, 1800],
  // index 2: >6..10
  2:  [0.4, 0.6, 1, 1.5, 2.5, 4, 6, 9, 15, 22, 36, 58, 90, 150, 220, 360, 580, 900, 1500, 2200],
  // index 3: >10..18
  3:  [0.5, 0.8, 1.2, 2, 3, 5, 8, 11, 18, 27, 43, 70, 110, 180, 270, 430, 700, 1100, 1800, 2700],
  // index 4: >18..30
  4:  [0.6, 1, 1.5, 2.5, 4, 6, 9, 13, 21, 33, 52, 84, 130, 210, 330, 520, 840, 1300, 2100, 3300],
  // index 5: >30..50
  5:  [0.6, 1, 1.5, 2.5, 4, 7, 11, 16, 25, 39, 62, 100, 160, 250, 390, 620, 1000, 1600, 2500, 3900],
  // index 6: >50..80
  6:  [0.8, 1, 2, 3, 5, 8, 13, 19, 30, 46, 74, 120, 190, 300, 460, 740, 1200, 1900, 3000, 4600],
  // index 7: >80..120
  7:  [1, 1.5, 2.5, 4, 6, 10, 15, 22, 35, 54, 87, 140, 220, 350, 540, 870, 1400, 2200, 3500, 5400],
  // index 8: >120..180
  8:  [1.2, 2, 3.5, 5, 8, 12, 18, 25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300],
  // index 9: >180..250
  9:  [2, 3, 4.5, 7, 10, 14, 20, 29, 46, 72, 115, 185, 290, 460, 720, 1150, 1850, 2900, 4600, 7200],
  // index 10: >250..315
  10: [2.5, 4, 6, 8, 12, 16, 23, 32, 52, 81, 130, 210, 320, 520, 810, 1300, 2100, 3200, 5200, 8100],
  // index 11: >315..400
  11: [3, 5, 7, 9, 13, 18, 25, 36, 57, 89, 140, 230, 360, 570, 890, 1400, 2300, 3600, 5700, 8900],
  // index 12: >400..500
  12: [4, 6, 8, 10, 15, 20, 27, 40, 63, 97, 155, 250, 400, 630, 970, 1550, 2500, 4000, 6300, 9700],
};

// Fundamental deviations in micrometers per dimension range index
// For holes (uppercase): value = lower deviation (EI) except for A-H where it's upper deviation (ES)
// For shafts (lowercase): value = upper deviation (es) except for a-h
// Positive = material added, Negative = material removed

// Shaft fundamental deviations (upper deviation 'es' for a-h, lower deviation 'ei' for j-zc)
// Key format: "rangeIndex_letter"
type DeviationTable = Record<string, number>;

// Simplified: fundamental deviation for shafts (lowercase)
// es (upper deviation) for letters a through h
// ei (lower deviation) for letters k through zc
const SHAFT_DEVIATIONS: Record<string, Record<number, number>> = {
  a:  { 0: -270, 1: -270, 2: -280, 3: -290, 4: -300, 5: -310, 6: -320, 7: -340, 8: -360, 9: -380, 10: -410, 11: -440, 12: -480 },
  b:  { 0: -140, 1: -140, 2: -150, 3: -150, 4: -160, 5: -170, 6: -180, 7: -200, 8: -220, 9: -240, 10: -260, 11: -280, 12: -300 },
  c:  { 0: -60, 1: -70, 2: -80, 3: -95, 4: -110, 5: -120, 6: -140, 7: -170, 8: -200, 9: -230, 10: -260, 11: -290, 12: -320 },
  d:  { 0: -20, 1: -30, 2: -40, 3: -50, 4: -65, 5: -80, 6: -100, 7: -120, 8: -145, 9: -170, 10: -190, 11: -210, 12: -230 },
  e:  { 0: -14, 1: -20, 2: -25, 3: -32, 4: -40, 5: -50, 6: -60, 7: -72, 8: -85, 9: -100, 10: -110, 11: -125, 12: -135 },
  f:  { 0: -6, 1: -10, 2: -13, 3: -16, 4: -20, 5: -25, 6: -30, 7: -36, 8: -43, 9: -50, 10: -56, 11: -62, 12: -68 },
  g:  { 0: -2, 1: -4, 2: -5, 3: -6, 4: -7, 5: -9, 6: -10, 7: -12, 8: -14, 9: -15, 10: -17, 11: -18, 12: -20 },
  h:  { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  js: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 }, // special: ±IT/2
  j:  { 0: -2, 1: -2, 2: -2, 3: -3, 4: -3, 5: -4, 6: -5, 7: -6, 8: -6, 9: -7, 10: -7, 11: -7, 12: -7 }, // approximate for j5-j8
  k:  { 0: 0, 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 5 },
  m:  { 0: 2, 1: 4, 2: 6, 3: 7, 4: 8, 5: 9, 6: 11, 7: 13, 8: 15, 9: 17, 10: 20, 11: 21, 12: 23 },
  n:  { 0: 4, 1: 8, 2: 10, 3: 12, 4: 15, 5: 17, 6: 20, 7: 23, 8: 27, 9: 31, 10: 34, 11: 37, 12: 40 },
  p:  { 0: 6, 1: 12, 2: 15, 3: 18, 4: 22, 5: 26, 6: 32, 7: 37, 8: 43, 9: 50, 10: 56, 11: 62, 12: 68 },
  r:  { 0: 10, 1: 15, 2: 19, 3: 23, 4: 28, 5: 34, 6: 41, 7: 48, 8: 55, 9: 63, 10: 72, 11: 78, 12: 86 },
  s:  { 0: 14, 1: 19, 2: 23, 3: 28, 4: 35, 5: 43, 6: 53, 7: 59, 8: 68, 9: 79, 10: 88, 11: 98, 12: 108 },
  t:  { 0: 18, 1: 23, 2: 28, 3: 33, 4: 41, 5: 48, 6: 60, 7: 68, 8: 80, 9: 94, 10: 108, 11: 114, 12: 126 },
  u:  { 0: 18, 1: 28, 2: 34, 3: 40, 4: 48, 5: 60, 6: 75, 7: 90, 8: 106, 9: 122, 10: 137, 11: 151, 12: 165 },
  x:  { 0: 26, 1: 35, 2: 42, 3: 50, 4: 60, 5: 72, 6: 90, 7: 107, 8: 125, 9: 146, 10: 165, 11: 182, 12: 200 },
  z:  { 0: 32, 1: 42, 2: 52, 3: 64, 4: 78, 5: 94, 6: 114, 7: 136, 8: 160, 9: 186, 10: 210, 11: 232, 12: 256 },
  za: { 0: 40, 1: 50, 2: 60, 3: 77, 4: 98, 5: 120, 6: 146, 7: 174, 8: 208, 9: 242, 10: 272, 11: 302, 12: 330 },
  zb: { 0: 48, 1: 58, 2: 68, 3: 90, 4: 118, 5: 148, 6: 180, 7: 214, 8: 254, 9: 300, 10: 340, 11: 375, 12: 410 },
  zc: { 0: 60, 1: 70, 2: 80, 3: 108, 4: 140, 5: 180, 6: 222, 7: 265, 8: 310, 9: 365, 10: 415, 11: 460, 12: 510 },
};

// For holes: fundamental deviation is the negative of the shaft deviation (with sign change)
// EI(hole) = -es(shaft) for letters A-H (uppercase = hole)
// ES(hole) = -ei(shaft) for letters K-ZC
// Exception: js/Js = ±IT/2

export const HOLE_LETTERS = ['A','B','C','D','E','F','G','H','JS','J','K','M','N','P','R','S','T','U','X','Z','ZA','ZB','ZC'];
export const SHAFT_LETTERS = ['a','b','c','d','e','f','g','h','js','j','k','m','n','p','r','s','t','u','x','z','za','zb','zc'];

export const IT_GRADES = Array.from({ length: 18 }, (_, i) => i + 1); // IT1..IT18

function findRangeIndex(nominal: number): number | null {
  for (let i = 0; i < DIMENSION_RANGES.length; i++) {
    const r = DIMENSION_RANGES[i];
    if (nominal > r.above && nominal <= r.upTo) return i;
  }
  return null;
}

function getITValue(rangeIndex: number, itGrade: number): number | null {
  const row = IT_VALUES[rangeIndex];
  if (!row) return null;
  // IT grades in our array: index 0=IT01, 1=IT0, 2=IT1, 3=IT2, ... so IT1=index2, ITn=index(n+1)
  const colIndex = itGrade + 1; // IT1->2, IT2->3, ... IT18->19
  return row[colIndex] ?? null;
}

export interface ToleranceResult {
  nominal: number;
  rangeLabel: string;
  letter: string;
  itGrade: number;
  designation: string;
  toleranceValue: number;   // IT value in μm
  upperDeviation: number;   // in μm
  lowerDeviation: number;   // in μm
  dimMax: number;            // in mm
  dimMin: number;            // in mm
}

export function calculateTolerance(
  nominal: number,
  isHole: boolean,
  letter: string,
  itGrade: number
): ToleranceResult | null {
  const rangeIndex = findRangeIndex(nominal);
  if (rangeIndex === null) return null;

  const range = DIMENSION_RANGES[rangeIndex];
  const rangeLabel = `>${range.above}…${range.upTo}`;

  const toleranceValue = getITValue(rangeIndex, itGrade);
  if (toleranceValue === null) return null;

  const letterKey = letter.toLowerCase();
  const isJs = letterKey === 'js';

  let upperDeviation: number;
  let lowerDeviation: number;

  if (isJs) {
    // Special case: js/Js = symmetrical ±IT/2
    upperDeviation = Math.round(toleranceValue / 2);
    lowerDeviation = -upperDeviation;
  } else if (isHole) {
    // Hole: fundamental deviation is inverted from shaft
    const shaftDev = SHAFT_DEVIATIONS[letterKey];
    if (!shaftDev || shaftDev[rangeIndex] === undefined) return null;
    const fundamentalDev = shaftDev[rangeIndex];

    if (['a','b','c','d','e','f','g','h'].includes(letterKey)) {
      // Letters A-H: EI = -es(shaft), ES = EI + IT
      lowerDeviation = -fundamentalDev;
      upperDeviation = lowerDeviation + toleranceValue;
    } else {
      // Letters K-ZC: ES = -ei(shaft) where ei = fundamentalDev (lower dev for shaft)
      // For shaft k-zc: ei = fundamentalDev, es = ei + IT
      // For hole K-ZC: ES = -fundamentalDev, EI = ES - IT
      upperDeviation = -fundamentalDev;
      lowerDeviation = upperDeviation - toleranceValue;
    }
  } else {
    // Shaft
    const shaftDev = SHAFT_DEVIATIONS[letterKey];
    if (!shaftDev || shaftDev[rangeIndex] === undefined) return null;
    const fundamentalDev = shaftDev[rangeIndex];

    if (['a','b','c','d','e','f','g','h'].includes(letterKey)) {
      // a-h: es = fundamentalDev (negative), ei = es - IT
      upperDeviation = fundamentalDev;
      lowerDeviation = upperDeviation - toleranceValue;
    } else {
      // k-zc: ei = fundamentalDev (positive), es = ei + IT
      lowerDeviation = fundamentalDev;
      upperDeviation = lowerDeviation + toleranceValue;
    }
  }

  const designationLetter = isHole ? letter.toUpperCase() : letter.toLowerCase();
  const designation = `Ø${nominal} ${designationLetter}${itGrade}`;

  return {
    nominal,
    rangeLabel,
    letter: designationLetter,
    itGrade,
    designation,
    toleranceValue,
    upperDeviation,
    lowerDeviation,
    dimMax: nominal + upperDeviation / 1000,
    dimMin: nominal + lowerDeviation / 1000,
  };
}
