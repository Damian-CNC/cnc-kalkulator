// src/data/helicoilThreadsData.ts
// Baza danych wymiarów gwintów pod wkładki HeliCoil (EG M)
// Zgodna z DIN 8140-2, DIN 8140-1 oraz dokumentacją techniczną Böllhoff HELICOIL® Plus.
// Klasa tolerancji gwintu gniazda: 6H mod (STI - Screw Thread Insert).

export interface HelicoilLengthSpec {
  multiplier: '1.0d' | '1.5d' | '2.0d' | '2.5d' | '3.0d';
  factor: number;
  nominalLength: number; // L [mm]
  minThreadDepth: number; // t2 [mm]
  minDrillDepth: number; // t1 [mm]
}

export interface HelicoilThreadEntry {
  d: number;
  P: number;
  designation: string;
  isCoarse: boolean;
  tapDrill: number; // Wiertło pod gwintownik HeliCoil (B) [mm]
  formDrill?: number; // Wiertło pod wygniatak HeliCoil [mm]
  holdingThread: {
    D: { nom: number; min: number }; // Średnica zewnętrzna gwintu gniazda DHC
    D2: { nom: number; min: number; max: number }; // Średnica podziałowa D2HC (6H mod)
    D1: { nom: number; min: number; max: number }; // Średnica wewnętrzna otworu nagwintowanego D1HC (6H mod)
  };
  lengths: HelicoilLengthSpec[];
}

export function generateLengths(d: number, P: number): HelicoilLengthSpec[] {
  const round2 = (val: number) => Math.round(val * 100) / 100;
  const multipliers: Array<{ mult: '1.0d' | '1.5d' | '2.0d' | '2.5d' | '3.0d'; factor: number }> = [
    { mult: '1.0d', factor: 1.0 },
    { mult: '1.5d', factor: 1.5 },
    { mult: '2.0d', factor: 2.0 },
    { mult: '2.5d', factor: 2.5 },
    { mult: '3.0d', factor: 3.0 },
  ];

  return multipliers.map(({ mult, factor }) => {
    const L = round2(d * factor);
    // t2: minimalna głębokość nacięcia gwintu (L + 1..1.5 * P)
    const t2 = round2(L + 1.25 * P);
    // t1: minimalna głębokość wiercenia otworu z uwzględnieniem stożka wiertła i wybiegu gwintownika
    const t1 = round2(t2 + 2.5 * P);
    return {
      multiplier: mult,
      factor,
      nominalLength: L,
      minThreadDepth: t2,
      minDrillDepth: t1,
    };
  });
}

export const HELICOIL_THREADS: HelicoilThreadEntry[] = [
  // GWINTY ZWYKŁE (COARSE)
  {
    d: 2, P: 0.4, designation: 'EG M2', isCoarse: true, tapDrill: 2.10, formDrill: 2.30,
    holdingThread: {
      D: { nom: 2.520, min: 2.520 },
      D2: { nom: 2.260, min: 2.260, max: 2.335 },
      D1: { nom: 2.087, min: 2.091, max: 2.179 },
    },
    lengths: generateLengths(2, 0.4),
  },
  {
    d: 2.5, P: 0.45, designation: 'EG M2.5', isCoarse: true, tapDrill: 2.60, formDrill: 2.85,
    holdingThread: {
      D: { nom: 3.085, min: 3.085 },
      D2: { nom: 2.793, min: 2.793, max: 2.873 },
      D1: { nom: 2.597, min: 2.597, max: 2.697 },
    },
    lengths: generateLengths(2.5, 0.45),
  },
  {
    d: 3, P: 0.5, designation: 'EG M3', isCoarse: true, tapDrill: 3.20, formDrill: 3.40,
    holdingThread: {
      D: { nom: 3.650, min: 3.650 },
      D2: { nom: 3.325, min: 3.325, max: 3.415 },
      D1: { nom: 3.108, min: 3.108, max: 3.220 },
    },
    lengths: generateLengths(3, 0.5),
  },
  {
    d: 3.5, P: 0.6, designation: 'EG M3.5', isCoarse: true, tapDrill: 3.70, formDrill: 4.00,
    holdingThread: {
      D: { nom: 4.280, min: 4.280 },
      D2: { nom: 3.890, min: 3.890, max: 3.990 },
      D1: { nom: 3.630, min: 3.630, max: 3.755 },
    },
    lengths: generateLengths(3.5, 0.6),
  },
  {
    d: 4, P: 0.7, designation: 'EG M4', isCoarse: true, tapDrill: 4.20, formDrill: 4.60,
    holdingThread: {
      D: { nom: 4.910, min: 4.910 },
      D2: { nom: 4.455, min: 4.455, max: 4.561 },
      D1: { nom: 4.152, min: 4.152, max: 4.292 },
    },
    lengths: generateLengths(4, 0.7),
  },
  {
    d: 5, P: 0.8, designation: 'EG M5', isCoarse: true, tapDrill: 5.25, formDrill: 5.60,
    holdingThread: {
      D: { nom: 6.040, min: 6.040 },
      D2: { nom: 5.520, min: 5.520, max: 5.638 },
      D1: { nom: 5.174, min: 5.174, max: 5.334 },
    },
    lengths: generateLengths(5, 0.8),
  },
  {
    d: 6, P: 1.0, designation: 'EG M6', isCoarse: true, tapDrill: 6.30, formDrill: 6.80,
    holdingThread: {
      D: { nom: 7.300, min: 7.300 },
      D2: { nom: 6.650, min: 6.650, max: 6.782 },
      D1: { nom: 6.217, min: 6.217, max: 6.407 },
    },
    lengths: generateLengths(6, 1.0),
  },
  {
    d: 7, P: 1.0, designation: 'EG M7', isCoarse: true, tapDrill: 7.30, formDrill: 7.80,
    holdingThread: {
      D: { nom: 8.300, min: 8.300 },
      D2: { nom: 7.650, min: 7.650, max: 7.782 },
      D1: { nom: 7.217, min: 7.217, max: 7.407 },
    },
    lengths: generateLengths(7, 1.0),
  },
  {
    d: 8, P: 1.25, designation: 'EG M8', isCoarse: true, tapDrill: 8.40, formDrill: 9.00,
    holdingThread: {
      D: { nom: 9.625, min: 9.625 },
      D2: { nom: 8.813, min: 8.813, max: 8.963 },
      D1: { nom: 8.271, min: 8.271, max: 8.483 },
    },
    lengths: generateLengths(8, 1.25),
  },
  {
    d: 9, P: 1.25, designation: 'EG M9', isCoarse: true, tapDrill: 9.40, formDrill: 10.00,
    holdingThread: {
      D: { nom: 10.625, min: 10.625 },
      D2: { nom: 9.813, min: 9.813, max: 9.963 },
      D1: { nom: 9.271, min: 9.271, max: 9.483 },
    },
    lengths: generateLengths(9, 1.25),
  },
  {
    d: 10, P: 1.5, designation: 'EG M10', isCoarse: true, tapDrill: 10.50, formDrill: 11.20,
    holdingThread: {
      D: { nom: 11.950, min: 11.950 },
      D2: { nom: 10.975, min: 10.975, max: 11.135 },
      D1: { nom: 10.324, min: 10.324, max: 10.560 },
    },
    lengths: generateLengths(10, 1.5),
  },
  {
    d: 11, P: 1.5, designation: 'EG M11', isCoarse: true, tapDrill: 11.50, formDrill: 12.20,
    holdingThread: {
      D: { nom: 12.950, min: 12.950 },
      D2: { nom: 11.975, min: 11.975, max: 12.135 },
      D1: { nom: 11.324, min: 11.324, max: 11.560 },
    },
    lengths: generateLengths(11, 1.5),
  },
  {
    d: 12, P: 1.75, designation: 'EG M12', isCoarse: true, tapDrill: 12.50, formDrill: 13.30,
    holdingThread: {
      D: { nom: 14.275, min: 14.275 },
      D2: { nom: 13.138, min: 13.138, max: 13.308 },
      D1: { nom: 12.376, min: 12.376, max: 12.636 },
    },
    lengths: generateLengths(12, 1.75),
  },
  {
    d: 14, P: 2.0, designation: 'EG M14', isCoarse: true, tapDrill: 14.50, formDrill: 15.50,
    holdingThread: {
      D: { nom: 16.600, min: 16.600 },
      D2: { nom: 15.300, min: 15.300, max: 15.480 },
      D1: { nom: 14.428, min: 14.428, max: 14.718 },
    },
    lengths: generateLengths(14, 2.0),
  },
  {
    d: 16, P: 2.0, designation: 'EG M16', isCoarse: true, tapDrill: 16.50, formDrill: 17.50,
    holdingThread: {
      D: { nom: 18.600, min: 18.600 },
      D2: { nom: 17.300, min: 17.300, max: 17.480 },
      D1: { nom: 16.428, min: 16.428, max: 16.718 },
    },
    lengths: generateLengths(16, 2.0),
  },
  {
    d: 18, P: 2.5, designation: 'EG M18', isCoarse: true, tapDrill: 18.50, formDrill: 19.80,
    holdingThread: {
      D: { nom: 21.250, min: 21.250 },
      D2: { nom: 19.625, min: 19.625, max: 19.825 },
      D1: { nom: 18.535, min: 18.535, max: 18.865 },
    },
    lengths: generateLengths(18, 2.5),
  },
  {
    d: 20, P: 2.5, designation: 'EG M20', isCoarse: true, tapDrill: 20.50, formDrill: 21.80,
    holdingThread: {
      D: { nom: 23.250, min: 23.250 },
      D2: { nom: 21.625, min: 21.625, max: 21.825 },
      D1: { nom: 20.535, min: 20.535, max: 20.865 },
    },
    lengths: generateLengths(20, 2.5),
  },
  {
    d: 22, P: 2.5, designation: 'EG M22', isCoarse: true, tapDrill: 22.50, formDrill: 23.80,
    holdingThread: {
      D: { nom: 25.250, min: 25.250 },
      D2: { nom: 23.625, min: 23.625, max: 23.825 },
      D1: { nom: 22.535, min: 22.535, max: 22.865 },
    },
    lengths: generateLengths(22, 2.5),
  },
  {
    d: 24, P: 3.0, designation: 'EG M24', isCoarse: true, tapDrill: 24.50, formDrill: 26.20,
    holdingThread: {
      D: { nom: 27.900, min: 27.900 },
      D2: { nom: 25.950, min: 25.950, max: 26.174 },
      D1: { nom: 24.642, min: 24.642, max: 25.022 },
    },
    lengths: generateLengths(24, 3.0),
  },
  {
    d: 27, P: 3.0, designation: 'EG M27', isCoarse: true, tapDrill: 27.50, formDrill: 29.20,
    holdingThread: {
      D: { nom: 30.900, min: 30.900 },
      D2: { nom: 28.950, min: 28.950, max: 29.174 },
      D1: { nom: 27.642, min: 27.642, max: 28.022 },
    },
    lengths: generateLengths(27, 3.0),
  },
  {
    d: 30, P: 3.5, designation: 'EG M30', isCoarse: true, tapDrill: 30.75, formDrill: 32.50,
    holdingThread: {
      D: { nom: 34.550, min: 34.550 },
      D2: { nom: 32.275, min: 32.275, max: 32.525 },
      D1: { nom: 30.749, min: 30.749, max: 31.179 },
    },
    lengths: generateLengths(30, 3.5),
  },
  {
    d: 33, P: 3.5, designation: 'EG M33', isCoarse: true, tapDrill: 33.75, formDrill: 35.50,
    holdingThread: {
      D: { nom: 37.550, min: 37.550 },
      D2: { nom: 35.275, min: 35.275, max: 35.525 },
      D1: { nom: 33.749, min: 33.749, max: 34.179 },
    },
    lengths: generateLengths(33, 3.5),
  },
  {
    d: 36, P: 4.0, designation: 'EG M36', isCoarse: true, tapDrill: 36.75, formDrill: 38.80,
    holdingThread: {
      D: { nom: 41.200, min: 41.200 },
      D2: { nom: 38.600, min: 38.600, max: 38.880 },
      D1: { nom: 36.856, min: 36.856, max: 37.336 },
    },
    lengths: generateLengths(36, 4.0),
  },

  // GWINTY DROBNOZWOJNE (FINE)
  {
    d: 8, P: 1.0, designation: 'EG M8×1', isCoarse: false, tapDrill: 8.30, formDrill: 8.80,
    holdingThread: {
      D: { nom: 9.300, min: 9.300 },
      D2: { nom: 8.650, min: 8.650, max: 8.782 },
      D1: { nom: 8.217, min: 8.217, max: 8.407 },
    },
    lengths: generateLengths(8, 1.0),
  },
  {
    d: 10, P: 1.0, designation: 'EG M10×1', isCoarse: false, tapDrill: 10.30, formDrill: 10.80,
    holdingThread: {
      D: { nom: 11.300, min: 11.300 },
      D2: { nom: 10.650, min: 10.650, max: 10.782 },
      D1: { nom: 10.217, min: 10.217, max: 10.407 },
    },
    lengths: generateLengths(10, 1.0),
  },
  {
    d: 10, P: 1.25, designation: 'EG M10×1.25', isCoarse: false, tapDrill: 10.30, formDrill: 11.00,
    holdingThread: {
      D: { nom: 11.625, min: 11.625 },
      D2: { nom: 10.813, min: 10.813, max: 10.963 },
      D1: { nom: 10.271, min: 10.271, max: 10.483 },
    },
    lengths: generateLengths(10, 1.25),
  },
  {
    d: 12, P: 1.0, designation: 'EG M12×1', isCoarse: false, tapDrill: 12.30, formDrill: 12.80,
    holdingThread: {
      D: { nom: 13.300, min: 13.300 },
      D2: { nom: 12.650, min: 12.650, max: 12.782 },
      D1: { nom: 12.217, min: 12.217, max: 12.407 },
    },
    lengths: generateLengths(12, 1.0),
  },
  {
    d: 12, P: 1.25, designation: 'EG M12×1.25', isCoarse: false, tapDrill: 12.30, formDrill: 13.00,
    holdingThread: {
      D: { nom: 13.625, min: 13.625 },
      D2: { nom: 12.813, min: 12.813, max: 12.963 },
      D1: { nom: 12.271, min: 12.271, max: 12.483 },
    },
    lengths: generateLengths(12, 1.25),
  },
  {
    d: 12, P: 1.5, designation: 'EG M12×1.5', isCoarse: false, tapDrill: 12.50, formDrill: 13.20,
    holdingThread: {
      D: { nom: 13.950, min: 13.950 },
      D2: { nom: 12.975, min: 12.975, max: 13.135 },
      D1: { nom: 12.324, min: 12.324, max: 12.560 },
    },
    lengths: generateLengths(12, 1.5),
  },
  {
    d: 14, P: 1.25, designation: 'EG M14×1.25', isCoarse: false, tapDrill: 14.30, formDrill: 15.00,
    holdingThread: {
      D: { nom: 15.625, min: 15.625 },
      D2: { nom: 14.813, min: 14.813, max: 14.963 },
      D1: { nom: 14.271, min: 14.271, max: 14.483 },
    },
    lengths: generateLengths(14, 1.25),
  },
  {
    d: 14, P: 1.5, designation: 'EG M14×1.5', isCoarse: false, tapDrill: 14.50, formDrill: 15.20,
    holdingThread: {
      D: { nom: 15.950, min: 15.950 },
      D2: { nom: 14.975, min: 14.975, max: 15.135 },
      D1: { nom: 14.324, min: 14.324, max: 14.560 },
    },
    lengths: generateLengths(14, 1.5),
  },
  {
    d: 16, P: 1.5, designation: 'EG M16×1.5', isCoarse: false, tapDrill: 16.50, formDrill: 17.20,
    holdingThread: {
      D: { nom: 17.950, min: 17.950 },
      D2: { nom: 16.975, min: 16.975, max: 17.135 },
      D1: { nom: 16.324, min: 16.324, max: 16.560 },
    },
    lengths: generateLengths(16, 1.5),
  },
  {
    d: 18, P: 1.5, designation: 'EG M18×1.5', isCoarse: false, tapDrill: 18.50, formDrill: 19.20,
    holdingThread: {
      D: { nom: 19.950, min: 19.950 },
      D2: { nom: 18.975, min: 18.975, max: 19.135 },
      D1: { nom: 18.324, min: 18.324, max: 18.560 },
    },
    lengths: generateLengths(18, 1.5),
  },
  {
    d: 18, P: 2.0, designation: 'EG M18×2', isCoarse: false, tapDrill: 18.50, formDrill: 19.50,
    holdingThread: {
      D: { nom: 20.600, min: 20.600 },
      D2: { nom: 19.300, min: 19.300, max: 19.480 },
      D1: { nom: 18.428, min: 18.428, max: 18.718 },
    },
    lengths: generateLengths(18, 2.0),
  },
  {
    d: 20, P: 1.5, designation: 'EG M20×1.5', isCoarse: false, tapDrill: 20.50, formDrill: 21.20,
    holdingThread: {
      D: { nom: 21.950, min: 21.950 },
      D2: { nom: 20.975, min: 20.975, max: 21.135 },
      D1: { nom: 20.324, min: 20.324, max: 20.560 },
    },
    lengths: generateLengths(20, 1.5),
  },
  {
    d: 20, P: 2.0, designation: 'EG M20×2', isCoarse: false, tapDrill: 20.50, formDrill: 21.50,
    holdingThread: {
      D: { nom: 22.600, min: 22.600 },
      D2: { nom: 21.300, min: 21.300, max: 21.480 },
      D1: { nom: 20.428, min: 20.428, max: 20.718 },
    },
    lengths: generateLengths(20, 2.0),
  },
  {
    d: 22, P: 1.5, designation: 'EG M22×1.5', isCoarse: false, tapDrill: 22.50, formDrill: 23.20,
    holdingThread: {
      D: { nom: 23.950, min: 23.950 },
      D2: { nom: 22.975, min: 22.975, max: 23.135 },
      D1: { nom: 22.324, min: 22.324, max: 22.560 },
    },
    lengths: generateLengths(22, 1.5),
  },
  {
    d: 24, P: 1.5, designation: 'EG M24×1.5', isCoarse: false, tapDrill: 24.50, formDrill: 25.20,
    holdingThread: {
      D: { nom: 25.950, min: 25.950 },
      D2: { nom: 24.975, min: 24.975, max: 25.135 },
      D1: { nom: 24.324, min: 24.324, max: 24.560 },
    },
    lengths: generateLengths(24, 1.5),
  },
  {
    d: 24, P: 2.0, designation: 'EG M24×2', isCoarse: false, tapDrill: 24.50, formDrill: 25.50,
    holdingThread: {
      D: { nom: 26.600, min: 26.600 },
      D2: { nom: 25.300, min: 25.300, max: 25.480 },
      D1: { nom: 24.428, min: 24.428, max: 24.718 },
    },
    lengths: generateLengths(24, 2.0),
  },
  {
    d: 27, P: 1.5, designation: 'EG M27×1.5', isCoarse: false, tapDrill: 27.50, formDrill: 28.20,
    holdingThread: {
      D: { nom: 28.950, min: 28.950 },
      D2: { nom: 27.975, min: 27.975, max: 28.135 },
      D1: { nom: 27.324, min: 27.324, max: 27.560 },
    },
    lengths: generateLengths(27, 1.5),
  },
  {
    d: 27, P: 2.0, designation: 'EG M27×2', isCoarse: false, tapDrill: 27.50, formDrill: 28.50,
    holdingThread: {
      D: { nom: 29.600, min: 29.600 },
      D2: { nom: 28.300, min: 28.300, max: 28.480 },
      D1: { nom: 27.428, min: 27.428, max: 27.718 },
    },
    lengths: generateLengths(27, 2.0),
  },
  {
    d: 30, P: 1.5, designation: 'EG M30×1.5', isCoarse: false, tapDrill: 30.50, formDrill: 31.20,
    holdingThread: {
      D: { nom: 31.950, min: 31.950 },
      D2: { nom: 30.975, min: 30.975, max: 31.135 },
      D1: { nom: 30.324, min: 30.324, max: 30.560 },
    },
    lengths: generateLengths(30, 1.5),
  },
  {
    d: 30, P: 2.0, designation: 'EG M30×2', isCoarse: false, tapDrill: 30.50, formDrill: 31.50,
    holdingThread: {
      D: { nom: 32.600, min: 32.600 },
      D2: { nom: 31.300, min: 31.300, max: 31.480 },
      D1: { nom: 30.428, min: 30.428, max: 30.718 },
    },
    lengths: generateLengths(30, 2.0),
  },
  {
    d: 36, P: 1.5, designation: 'EG M36×1.5', isCoarse: false, tapDrill: 36.50, formDrill: 37.20,
    holdingThread: {
      D: { nom: 37.950, min: 37.950 },
      D2: { nom: 36.975, min: 36.975, max: 37.135 },
      D1: { nom: 36.324, min: 36.324, max: 36.560 },
    },
    lengths: generateLengths(36, 1.5),
  },
  {
    d: 36, P: 2.0, designation: 'EG M36×2', isCoarse: false, tapDrill: 36.50, formDrill: 37.50,
    holdingThread: {
      D: { nom: 38.600, min: 38.600 },
      D2: { nom: 37.300, min: 37.300, max: 37.480 },
      D1: { nom: 36.428, min: 36.428, max: 36.718 },
    },
    lengths: generateLengths(36, 2.0),
  },
  {
    d: 36, P: 3.0, designation: 'EG M36×3', isCoarse: false, tapDrill: 36.75, formDrill: 38.20,
    holdingThread: {
      D: { nom: 39.900, min: 39.900 },
      D2: { nom: 37.950, min: 37.950, max: 38.174 },
      D1: { nom: 36.642, min: 36.642, max: 37.022 },
    },
    lengths: generateLengths(36, 3.0),
  },
];

/**
 * Oblicza parametry gwintu HeliCoil dla dowolnej średnicy d i skoku P
 * na podstawie formuł normy DIN 8140-2.
 */
export function calculateCustomHelicoil(d: number, P: number): HelicoilThreadEntry {
  const round3 = (val: number) => Math.round(val * 1000) / 1000;
  const round2 = (val: number) => Math.round(val * 100) / 100;

  // Wymiary profilu gwintu gniazda EG M
  const D_nom = round3(d + 1.3 * P);
  const D2_nom = round3(D_nom - 0.649519 * P);
  const D1_min = round3(D_nom - 1.082532 * P);

  // Tolerancja 6H mod wg DIN 8140-2
  let TD1 = 0.200;
  let TD2 = 0.150;
  if (P <= 0.45) { TD1 = 0.088; TD2 = 0.075; }
  else if (P <= 0.5) { TD1 = 0.112; TD2 = 0.090; }
  else if (P <= 0.7) { TD1 = 0.140; TD2 = 0.106; }
  else if (P <= 0.8) { TD1 = 0.160; TD2 = 0.118; }
  else if (P <= 1.0) { TD1 = 0.190; TD2 = 0.132; }
  else if (P <= 1.25) { TD1 = 0.212; TD2 = 0.150; }
  else if (P <= 1.5) { TD1 = 0.236; TD2 = 0.160; }
  else if (P <= 1.75) { TD1 = 0.260; TD2 = 0.170; }
  else if (P <= 2.0) { TD1 = 0.290; TD2 = 0.180; }
  else if (P <= 2.5) { TD1 = 0.330; TD2 = 0.200; }
  else if (P <= 3.0) { TD1 = 0.380; TD2 = 0.224; }
  else { TD1 = 0.430; TD2 = 0.250; }

  const D1_max = round3(D1_min + TD1);
  const D2_max = round3(D2_nom + TD2);

  // Standardowe wiertło skrawające B (bliskie D1_min, zaokrąglone w typowe średnice wierteł)
  const tapDrill = round2(d + (P >= 1.0 ? 0.35 * P + 0.1 : 0.25 * P + 0.1));
  const formDrill = round2(d + 0.8 * P);

  return {
    d,
    P,
    designation: `EG M${d}×${P}`,
    isCoarse: false,
    tapDrill,
    formDrill,
    holdingThread: {
      D: { nom: D_nom, min: D_nom },
      D2: { nom: D2_nom, min: D2_nom, max: D2_max },
      D1: { nom: D1_min, min: D1_min, max: D1_max },
    },
    lengths: generateLengths(d, P),
  };
}
