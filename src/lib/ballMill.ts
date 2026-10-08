/** Frez kulisty: średnica efektywna, prędkości i wysokość grzebienia (pozostałości między przejściami). */

/** Średnica efektywna przy głębokości skrawania ap. Dla ap ≥ D/2 średnica efektywna to D. */
export const effectiveDia = (D: number, ap: number): number => {
  if (!(D > 0) || !(ap > 0)) return 0;
  if (ap >= D / 2) return D;
  return 2 * Math.sqrt(ap * (D - ap));
};

/** Obroty [1/min] dla zadanej prędkości skrawania; k = 1000 (mm, m/min) albo 12 (in, ft/min). */
export const rpmFor = (vc: number, dia: number, k: number): number =>
  dia > 0 ? (k * vc) / (Math.PI * dia) : 0;

/** Prędkość skrawania dla zadanych obrotów. */
export const vcFor = (rpm: number, dia: number, k: number): number => (Math.PI * dia * rpm) / k;

/** Wysokość grzebienia na płaskiej powierzchni przy rozstawie ścieżek ae. */
export const scallopHeight = (D: number, ae: number): number | null => {
  const R = D / 2;
  if (!(R > 0) || !(ae > 0)) return null;
  const half = ae / 2;
  if (half >= R) return null;
  return R - Math.sqrt(R * R - half * half);
};

/** Rozstaw ścieżek dający zadaną wysokość grzebienia h. */
export const stepoverFor = (D: number, h: number): number | null => {
  const R = D / 2;
  if (!(R > 0) || !(h > 0) || h >= R) return null;
  return 2 * Math.sqrt(h * (2 * R - h));
};
