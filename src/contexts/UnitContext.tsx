import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UnitSystem = 'metric' | 'imperial';

const STORAGE_KEY = 'cnc-unit-system';

export const MM_PER_INCH = 25.4;

/** length: mm -> inch */
export const mmToIn = (v: number) => v / MM_PER_INCH;
export const inToMm = (v: number) => v * MM_PER_INCH;
/** cutting speed: m/min -> SFM (ft/min) */
export const mMinToSfm = (v: number) => v * 3.280839895;
export const sfmToMMin = (v: number) => v / 3.280839895;
/** mass: kg -> lbs */
export const kgToLbs = (v: number) => v * 2.20462262;

type UnitContextValue = {
  system: UnitSystem;
  isImperial: boolean;
  setSystem: (s: UnitSystem) => void;
  toggle: () => void;
  /** unit labels adapting to the current system */
  u: {
    length: string;
    speed: string;
    feedRate: string;
    feedPerTooth: string;
    mass: string;
  };
  /** constant used in Vc/n formulas: 1000 (mm, m/min) or 12 (inch, ft/min) */
  speedConstant: number;
};

const UnitContext = createContext<UnitContextValue | null>(null);

const read = (): UnitSystem => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
};

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  const [system, setSystemState] = useState<UnitSystem>(read);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, system);
    } catch {
      /* noop */
    }
  }, [system]);

  const setSystem = useCallback((s: UnitSystem) => setSystemState(s), []);
  const toggle = useCallback(
    () => setSystemState((s) => (s === 'metric' ? 'imperial' : 'metric')),
    [],
  );

  const value = useMemo<UnitContextValue>(() => {
    const imperial = system === 'imperial';
    return {
      system,
      isImperial: imperial,
      setSystem,
      toggle,
      speedConstant: imperial ? 12 : 1000,
      u: {
        length: imperial ? 'inch' : 'mm',
        speed: imperial ? 'SFM' : 'm/min',
        feedRate: imperial ? 'IPM' : 'mm/min',
        feedPerTooth: imperial ? 'IPT' : 'mm/ząb',
        mass: imperial ? 'lbs' : 'kg',
      },
    };
  }, [system, setSystem, toggle]);

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
};

export const useUnits = (): UnitContextValue => {
  const ctx = useContext(UnitContext);
  if (!ctx) {
    // Safe fallback so isolated components never crash outside the provider.
    return {
      system: 'metric',
      isImperial: false,
      setSystem: () => undefined,
      toggle: () => undefined,
      speedConstant: 1000,
      u: { length: 'mm', speed: 'm/min', feedRate: 'mm/min', feedPerTooth: 'mm/ząb', mass: 'kg' },
    };
  }
  return ctx;
};

export default UnitContext;
