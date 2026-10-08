/** Korekcja temperaturowa wymiaru względem temperatury odniesienia 20 °C. */

export const REF_C = 20;
export const fToC = (f: number) => ((f - 32) * 5) / 9;
export const cToF = (c: number) => (c * 9) / 5 + 32;

/** α w µm/(m·K) -> 1/K */
const a = (alphaUm: number) => alphaUm * 1e-6;

/** Wymiar w 20 °C na podstawie pomiaru w temperaturze T [°C]. */
export const sizeAt20 = (measured: number, tC: number, alphaUm: number): number =>
  measured / (1 + a(alphaUm) * (tC - REF_C));

/** Jaki wymiar pokaże przyrząd, gdy detal ma docelowo L w 20 °C, a ma temperaturę T. */
export const readingAt = (nominal20: number, tC: number, alphaUm: number): number =>
  nominal20 * (1 + a(alphaUm) * (tC - REF_C));

/**
 * Wskazanie przyrządu o skali z materiału o α_g i temperaturze Tg przy pomiarze detalu
 * (α_p, Tp), którego wymiar w 20 °C wynosi L20.
 */
export const readingWithGauge = (
  l20: number, alphaPart: number, tPart: number, alphaGauge: number, tGauge: number,
): number =>
  (l20 * (1 + a(alphaPart) * (tPart - REF_C))) / (1 + a(alphaGauge) * (tGauge - REF_C));
