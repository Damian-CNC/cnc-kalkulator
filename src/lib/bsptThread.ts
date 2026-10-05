/**
 * Gwint rurowy stożkowy BSPT wg ISO 7-1 (R – zewnętrzny, Rc – wewnętrzny stożkowy).
 * Zarys Whitwortha 55°, zbieżność 1:16 na średnicy. Średnice odniesione do płaszczyzny
 * pomiarowej (gauge plane), położonej w odległości a od małego końca gwintu.
 */

export type BsptSize = {
  id: string;
  tpi: number;
  d: number; // średnica zewnętrzna w płaszczyźnie pomiarowej [mm]
  a: number; // odległość płaszczyzny pomiarowej od małego końca [mm]
  L: number; // minimalna długość gwintu użytecznego (zewnętrznego) [mm]
};

const B = (id: string, tpi: number, d: number, a: number, L: number): BsptSize => ({ id, tpi, d, a, L });

export const BSPT_SIZES: BsptSize[] = [
  B('1/16', 28, 7.723, 4.0, 6.5),
  B('1/8', 28, 9.728, 4.0, 6.5),
  B('1/4', 19, 13.157, 6.0, 9.7),
  B('3/8', 19, 16.662, 6.4, 10.1),
  B('1/2', 14, 20.955, 8.2, 13.2),
  B('3/4', 14, 26.441, 9.5, 14.5),
  B('1', 11, 33.249, 10.4, 16.8),
  B('1 1/4', 11, 41.91, 12.7, 19.1),
  B('1 1/2', 11, 47.803, 12.7, 19.1),
  B('2', 11, 59.614, 15.9, 23.4),
  B('2 1/2', 11, 75.184, 17.5, 26.7),
  B('3', 11, 87.884, 20.6, 29.8),
  B('4', 11, 113.03, 25.4, 35.8),
  B('5', 11, 138.43, 28.6, 40.1),
  B('6', 11, 163.83, 28.6, 40.1),
];

export const TAPER = 1 / 16;
const r3 = (v: number) => Math.round(v * 1000 + 1e-7) / 1000;

export type BsptResult = {
  designation: string;
  P: number;
  tpi: number;
  h: number; // wysokość zarysu (głębokość nacinania)
  r: number; // promień zaokrąglenia
  gauge: { d: number; d2: number; d1: number };
  small: { d: number; d2: number; d1: number }; // na małym końcu
  end: { d: number; d2: number; d1: number; x: number }; // na końcu gwintu użytecznego
  a: number;
  L: number;
  halfAngle: number; // °
};

export const calcBspt = (s: BsptSize): BsptResult => {
  const P = 25.4 / s.tpi;
  const h = r3(0.640327 * P); // jak w tabelach normy: h zaokrąglone do 0,001
  const at = (dMajor: number) => ({
    d: r3(dMajor),
    d2: r3(dMajor - h),
    d1: r3(dMajor - 2 * h),
  });
  const dSmall = s.d - s.a * TAPER;
  const dEnd = s.d + (s.L - s.a) * TAPER;
  return {
    designation: `R ${s.id}`,
    P: r3(P),
    tpi: s.tpi,
    h,
    r: r3(0.137329 * P),
    gauge: at(s.d),
    small: at(dSmall),
    end: { ...at(dEnd), x: s.L },
    a: s.a,
    L: s.L,
    halfAngle: (Math.atan(TAPER / 2) * 180) / Math.PI,
  };
};
