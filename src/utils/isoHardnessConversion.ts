// ISO Hardness Conversion Tables
// Based on ISO 6506 (Brinell) and ISO 6508 (Rockwell C)
// Source: ISO 18265:2013 - Metallic materials - Conversion of hardness values

interface ConversionEntry {
  hb: number;
  hrc: number;
}

// Official ISO conversion table for steel
// HB (10mm ball, 3000 kgf load) to HRC
const conversionTable: ConversionEntry[] = [
  { hb: 739, hrc: 65 },
  { hb: 722, hrc: 64 },
  { hb: 705, hrc: 63 },
  { hb: 688, hrc: 62 },
  { hb: 670, hrc: 61 },
  { hb: 654, hrc: 60 },
  { hb: 634, hrc: 59 },
  { hb: 615, hrc: 58 },
  { hb: 595, hrc: 57 },
  { hb: 577, hrc: 56 },
  { hb: 560, hrc: 55 },
  { hb: 543, hrc: 54 },
  { hb: 525, hrc: 53 },
  { hb: 512, hrc: 52 },
  { hb: 496, hrc: 51 },
  { hb: 481, hrc: 50 },
  { hb: 469, hrc: 49 },
  { hb: 455, hrc: 48 },
  { hb: 443, hrc: 47 },
  { hb: 432, hrc: 46 },
  { hb: 421, hrc: 45 },
  { hb: 409, hrc: 44 },
  { hb: 400, hrc: 43 },
  { hb: 390, hrc: 42 },
  { hb: 381, hrc: 41 },
  { hb: 371, hrc: 40 },
  { hb: 362, hrc: 39 },
  { hb: 353, hrc: 38 },
  { hb: 344, hrc: 37 },
  { hb: 336, hrc: 36 },
  { hb: 327, hrc: 35 },
  { hb: 319, hrc: 34 },
  { hb: 311, hrc: 33 },
  { hb: 301, hrc: 32 },
  { hb: 294, hrc: 31 },
  { hb: 286, hrc: 30 },
  { hb: 279, hrc: 29 },
  { hb: 271, hrc: 28 },
  { hb: 264, hrc: 27 },
  { hb: 258, hrc: 26 },
  { hb: 253, hrc: 25 },
  { hb: 247, hrc: 24 },
  { hb: 243, hrc: 23 },
  { hb: 237, hrc: 22 },
  { hb: 231, hrc: 21 },
  { hb: 226, hrc: 20 },
];

export type ConversionDirection = 'hb-to-hrc' | 'hrc-to-hb';

export interface ConversionResult {
  success: boolean;
  value?: number;
  message?: string;
}

export function convertHardness(
  inputValue: number,
  direction: ConversionDirection
): ConversionResult {
  if (isNaN(inputValue) || inputValue <= 0) {
    return {
      success: false,
      message: 'Wprowadź prawidłową wartość dodatnią.',
    };
  }

  if (direction === 'hb-to-hrc') {
    // Find exact match or interpolate
    const exactMatch = conversionTable.find((entry) => entry.hb === inputValue);
    if (exactMatch) {
      return { success: true, value: exactMatch.hrc };
    }

    // Check if value is within range
    const minHb = conversionTable[conversionTable.length - 1].hb;
    const maxHb = conversionTable[0].hb;

    if (inputValue < minHb || inputValue > maxHb) {
      return {
        success: false,
        message: `Brak dokładnego odpowiednika w normie ISO dla podanej wartości. Zakres HB: ${minHb}–${maxHb}.`,
      };
    }

    // Find closest entries for interpolation
    let lowerEntry: ConversionEntry | null = null;
    let upperEntry: ConversionEntry | null = null;

    for (let i = 0; i < conversionTable.length - 1; i++) {
      if (conversionTable[i].hb >= inputValue && conversionTable[i + 1].hb <= inputValue) {
        upperEntry = conversionTable[i];
        lowerEntry = conversionTable[i + 1];
        break;
      }
    }

    if (lowerEntry && upperEntry) {
      // Linear interpolation
      const ratio = (inputValue - lowerEntry.hb) / (upperEntry.hb - lowerEntry.hb);
      const interpolatedHrc = lowerEntry.hrc + ratio * (upperEntry.hrc - lowerEntry.hrc);
      return { success: true, value: Math.round(interpolatedHrc * 10) / 10 };
    }

    return {
      success: false,
      message: 'Brak dokładnego odpowiednika w normie ISO dla podanej wartości.',
    };
  } else {
    // HRC to HB
    const exactMatch = conversionTable.find((entry) => entry.hrc === inputValue);
    if (exactMatch) {
      return { success: true, value: exactMatch.hb };
    }

    // Check if value is within range
    const minHrc = conversionTable[conversionTable.length - 1].hrc;
    const maxHrc = conversionTable[0].hrc;

    if (inputValue < minHrc || inputValue > maxHrc) {
      return {
        success: false,
        message: `Brak dokładnego odpowiednika w normie ISO dla podanej wartości. Zakres HRC: ${minHrc}–${maxHrc}.`,
      };
    }

    // Find closest entries for interpolation
    let lowerEntry: ConversionEntry | null = null;
    let upperEntry: ConversionEntry | null = null;

    for (let i = 0; i < conversionTable.length - 1; i++) {
      if (conversionTable[i].hrc >= inputValue && conversionTable[i + 1].hrc <= inputValue) {
        upperEntry = conversionTable[i];
        lowerEntry = conversionTable[i + 1];
        break;
      }
    }

    if (lowerEntry && upperEntry) {
      // Linear interpolation
      const ratio = (inputValue - lowerEntry.hrc) / (upperEntry.hrc - lowerEntry.hrc);
      const interpolatedHb = lowerEntry.hb + ratio * (upperEntry.hb - lowerEntry.hb);
      return { success: true, value: Math.round(interpolatedHb) };
    }

    return {
      success: false,
      message: 'Brak dokładnego odpowiednika w normie ISO dla podanej wartości.',
    };
  }
}

export function getHbRange(): { min: number; max: number } {
  return {
    min: conversionTable[conversionTable.length - 1].hb,
    max: conversionTable[0].hb,
  };
}

export function getHrcRange(): { min: number; max: number } {
  return {
    min: conversionTable[conversionTable.length - 1].hrc,
    max: conversionTable[0].hrc,
  };
}
