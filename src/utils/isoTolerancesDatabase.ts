// ISO 286 Tolerance Calculator - driven by imported JSON data
import tolerancesJson from '@/data/isoTolerances.json';

interface RangeEntry {
  minimum_diameter: number;
  maximum_diameter: number;
  upper_deviation: string;
  lower_deviation: string;
  [key: string]: string | number; // IT keys
}

interface TolerancesData {
  housingBores: Record<string, RangeEntry[]>;
  shafts: Record<string, RangeEntry[]>;
  shellBores: Record<string, RangeEntry[]>;
}

const data = tolerancesJson as TolerancesData;

// Build available tolerance keys from JSON
function getAvailableTolerances(isHole: boolean): string[] {
  if (isHole) {
    // Merge housingBores and shellBores keys (deduplicate)
    const keys = new Set([
      ...Object.keys(data.housingBores),
      ...Object.keys(data.shellBores),
    ]);
    return Array.from(keys).sort();
  }
  return Object.keys(data.shafts).sort();
}

export const HOLE_TOLERANCES = getAvailableTolerances(true);
export const SHAFT_TOLERANCES = getAvailableTolerances(false);

export interface ToleranceResult {
  nominal: number;
  rangeLabel: string;
  designation: string;
  upperDeviation_mm: number;
  lowerDeviation_mm: number;
  upperDeviation_um: number;
  lowerDeviation_um: number;
  dimMax: number;
  dimMin: number;
}

function findEntry(entries: RangeEntry[], nominal: number): RangeEntry | null {
  return entries.find(
    (e) => nominal >= e.minimum_diameter && nominal < e.maximum_diameter
  ) || null;
}

export function calculateTolerance(
  nominal: number,
  isHole: boolean,
  toleranceKey: string
): ToleranceResult | null {
  // Try to find tolerance data from JSON
  let entries: RangeEntry[] | undefined;

  if (isHole) {
    entries = data.housingBores[toleranceKey] || data.shellBores[toleranceKey];
  } else {
    entries = data.shafts[toleranceKey];
  }

  if (!entries) return null;

  const entry = findEntry(entries, nominal);
  if (!entry) return null;

  const upperDev_mm = parseFloat(entry.upper_deviation);
  const lowerDev_mm = parseFloat(entry.lower_deviation);

  const rangeLabel = `${entry.minimum_diameter}–${entry.maximum_diameter}`;

  return {
    nominal,
    rangeLabel,
    designation: `Ø${nominal} ${toleranceKey}`,
    upperDeviation_mm: upperDev_mm,
    lowerDeviation_mm: lowerDev_mm,
    upperDeviation_um: Math.round(upperDev_mm * 1000),
    lowerDeviation_um: Math.round(lowerDev_mm * 1000),
    dimMax: nominal + upperDev_mm,
    dimMin: nominal + lowerDev_mm,
  };
}
