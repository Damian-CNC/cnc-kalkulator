// src/utils/ThreadMath.ts

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

export function calculateMetricThread(d: number, P: number): ThreadNominalDimensions {
  const round3 = (val: number) => Math.round(val * 1000) / 1000;

  return {
    nominalDiameter: round3(d),
    pitch: round3(P),
    pitchDiameter: round3(d - 0.649519 * P),
    externalMinorDiameter: round3(d - 1.226869 * P),
    internalMinorDiameter: round3(d - 1.082532 * P),
    tapDrillSize: round3(d - P),
    formTapDrillSize: round3(d - (0.49 * P)),
    // Obliczenia wysokości profilu dla Fusion 360 / CAM:
    externalThreadHeight: round3(0.613435 * P),
    internalThreadHeight: round3(0.541266 * P),
  };
}