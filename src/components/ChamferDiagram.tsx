interface ChamferDiagramProps {
  /** promień otworu */
  R: number;
  /** szerokość fazy (poziomo) */
  w: number;
  /** głębokość fazy (pionowo) */
  h: number;
  /** zejście czubka narzędzia poniżej powierzchni */
  Z: number;
  /** odsunięcie osi narzędzia od osi otworu */
  e: number;
  /** połowa kąta narzędzia [°] */
  alpha: number;
  /** narzędzie za małe */
  warn?: boolean;
}

const W = 300;
const H_MAX = 240;
const PAD = 14;

/** Przekrój: otwór, faza i narzędzie w pozycji końcowej. Litery zgodne z kartami wyników. */
const ChamferDiagram = ({ R, w, h, Z, e, alpha, warn = false }: ChamferDiagramProps) => {
  const a = (alpha * Math.PI) / 180;
  const tanA = Math.tan(a);
  const extend = 0.2 * Z; // narzędzie wystaje ponad powierzchnię
  const rExt = (Z + extend) * tanA;

  const xMin = Math.min(0, e - rExt) - 0.1 * (R + w);
  const xMaxMat = Math.max(R + w, e + rExt) + 0.12 * (R + w);
  const yMin = -extend - 0.3 * Z;
  const yMax = Z + 0.3 * Z;

  const k = Math.min((W - 2 * PAD) / (xMaxMat - xMin), (H_MAX - 2 * PAD) / (yMax - yMin));
  const H = Math.ceil((yMax - yMin) * k + 2 * PAD);
  const X = (x: number) => PAD + (x - xMin) * k;
  const Y = (y: number) => PAD + (y - yMin) * k;

  const pts = (list: Array<[number, number]>) => list.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');

  const material = pts([
    [R + w, 0],
    [xMaxMat, 0],
    [xMaxMat, yMax],
    [R, yMax],
    [R, h],
  ]);
  const tool = pts([
    [e - rExt, -extend],
    [e + rExt, -extend],
    [e, Z],
  ]);

  // wymiar Z (po lewej stronie)
  const xZ = Math.min(0, e - rExt) - 0.05 * (R + w);
  // wymiar e (nad narzędziem)
  const yE = -extend - 0.15 * Z;

  // łuk kąta α przy czubku
  const rho = Math.max(18, Math.min(34, 0.22 * Z * k));
  const tipX = X(e);
  const tipY = Y(Z);
  const arcStart = `${tipX},${tipY - rho}`;
  const arcEnd = `${tipX + rho * Math.sin(a)},${tipY - rho * Math.cos(a)}`;
  const labelX = tipX + 1.45 * rho * Math.sin(a / 2);
  const labelY = tipY - 1.45 * rho * Math.cos(a / 2) + 4;

  const stroke = warn ? '#f59e0b' : '#22d3ee';
  const fill = warn ? 'rgba(245,158,11,0.15)' : 'rgba(34,211,238,0.16)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto block" role="img" aria-label="Przekrój fazy">
      {/* materiał */}
      <polygon points={material} fill="#27272a" stroke="#52525b" strokeWidth="1" />
      {/* faza */}
      <line x1={X(R + w)} y1={Y(0)} x2={X(R)} y2={Y(h)} stroke="#06b6d4" strokeWidth="2.5" />

      {/* osie */}
      <line x1={X(0)} y1={Y(yMin + 0.1 * Z)} x2={X(0)} y2={Y(yMax)} stroke="#71717a" strokeWidth="1" strokeDasharray="8 3 2 3" />
      <line x1={X(e)} y1={Y(-extend)} x2={X(e)} y2={Y(Z)} stroke={stroke} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />

      {/* narzędzie */}
      <polygon points={tool} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={tipX} cy={tipY} r="2.5" fill={stroke} />

      {/* kąt α */}
      <path d={`M ${arcStart} A ${rho} ${rho} 0 0 1 ${arcEnd}`} fill="none" stroke="#a1a1aa" strokeWidth="1" />
      <text x={labelX} y={labelY} fill="#d4d4d8" fontSize="11" textAnchor="middle">α</text>

      {/* Z */}
      <line x1={X(xZ)} y1={Y(0)} x2={X(xZ)} y2={Y(Z)} stroke="#a1a1aa" strokeWidth="1" />
      <line x1={X(xZ) - 4} y1={Y(0)} x2={X(xZ) + 4} y2={Y(0)} stroke="#a1a1aa" strokeWidth="1" />
      <line x1={X(xZ) - 4} y1={Y(Z)} x2={X(e)} y2={Y(Z)} stroke="#a1a1aa" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
      <text x={X(xZ) - 6} y={(Y(0) + Y(Z)) / 2 + 4} fill="#fbbf24" fontSize="12" fontWeight="700" textAnchor="end">Z</text>

      {/* e */}
      <line x1={X(0)} y1={Y(yE)} x2={X(e)} y2={Y(yE)} stroke="#a1a1aa" strokeWidth="1" />
      <line x1={X(0)} y1={Y(yE) - 4} x2={X(0)} y2={Y(yE) + 4} stroke="#a1a1aa" strokeWidth="1" />
      <line x1={X(e)} y1={Y(yE) - 4} x2={X(e)} y2={Y(yE) + 4} stroke="#a1a1aa" strokeWidth="1" />
      <text x={(X(0) + X(e)) / 2} y={Y(yE) - 5} fill="#fbbf24" fontSize="12" fontWeight="700" textAnchor="middle">e</text>

      {/* c */}
      <text x={X(R + w * 0.5) + 14} y={Y(h * 0.5) + 14} fill="#22d3ee" fontSize="12" fontWeight="700">c</text>
    </svg>
  );
};

export default ChamferDiagram;
