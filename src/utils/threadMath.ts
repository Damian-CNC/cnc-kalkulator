// src/utils/ThreadMath.ts

import standardMetricPitches from '@/data/standardMetricPitches';

export interface ThreadNominalDimensions {
  nominalDiameter: number;
  pitch: number;
  pitchDiameter: number;
  externalMinorDiameter: number;
  internalMinorDiameter: number;
  tapDrillSize: number;
  formTapDrillSize: number;
  // NOWE PARAMETRY DLA CAM:
  externalThreadHeight: number; // h3
  internalThreadHeight: number; // H1
}

const standardCoarseFormDrills: Record<number, number> = {
  1: 0.90,
  1.2: 1.10,
  1.4: 1.28,
  1.6: 1.45,
  1.8: 1.65,
  2: 1.82,
  2.5: 2.30,
  3: 2.80,
  3.5: 3.25,
  4: 3.70,
  5: 4.65,
  6: 5.55,
  7: 6.55,
  8: 7.40,
  9: 8.40,
  10: 9.30,
  12: 11.20,
  14: 13.10,
  16: 15.10,
  18: 16.90,
  20: 18.90,
  22: 20.90,
  24: 22.70,
  27: 25.70,
  30: 28.30,
  33: 31.30,
  36: 34.20,
};

/**
 * Zwraca zalecaną średnicę wiertła pod wygniatak (roll tap / forming tap)
 * wg danych katalogowych producentów (Walter InnoForm, Gühring, EMUGE).
 * Dla pozostałych skoków: D = d - 0.453 × P.
 */
export function getMetricFormTapDrill(d: number, P: number): number {
  const coarse = (standardMetricPitches as Record<string, number[]>)[String(d)];
  if (coarse && coarse.length > 0 && coarse[coarse.length - 1] === P && standardCoarseFormDrills[d]) {
    return standardCoarseFormDrills[d];
  }
  return Math.round((d - 0.453 * P) * 100) / 100;
}

export function calculateMetricThread(d: number, P: number): ThreadNominalDimensions {
  const round3 = (val: number) => Math.round(val * 1000) / 1000;

  return {
    nominalDiameter: round3(d),
    pitch: round3(P),
    pitchDiameter: round3(d - 0.649519 * P),
    externalMinorDiameter: round3(d - 1.226869 * P),
    internalMinorDiameter: round3(d - 1.082532 * P),
    tapDrillSize: round3(d - P),
    formTapDrillSize: getMetricFormTapDrill(d, P),
    // Obliczenia wysokości profilu dla Fusion 360 / CAM:
    externalThreadHeight: round3(0.613435 * P),
    internalThreadHeight: round3(0.541266 * P),
  };
}
