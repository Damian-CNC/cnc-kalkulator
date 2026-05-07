import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  DIN509_TYPES,
  DIN509_ROWS,
  findDin509,
  uniqueRadii,
  t1OptionsForRadius,
  type Din509Type,
} from '@/data/din509Data';

const TYPES: Din509Type[] = ['E', 'F', 'G', 'H'];

const Din509Svg = ({ type }: { type: Din509Type }) => {
  // Common: axis at y=170, top OD line at y=50, undercut between x=200..280
  // Right of x=280: face going up (form F/E) or shoulder
  const stroke = 'rgb(6,182,212)';
  const dim = 'rgb(148,163,184)';

  // Profile points depend on type
  // We draw: top OD line (left) → into undercut → bottom of undercut → face going up (right) → top OD line (right) for shoulder
  // For Form E: no face — exits to right OD (no shoulder)
  // For Form F: face goes up (perpendicular shoulder with small chamfer 8°)
  // For Form G: angled approach 55° (no radius), exits 15°
  // For Form H: angled approach 60°

  let pathPoints = '';
  let labels: { x: number; y: number; text: string; color?: string }[] = [];
  const exitAngleDeg = 15;
  const exitDx = 30; // horizontal length for 15° exit
  const exitDy = exitDx * Math.tan((exitAngleDeg * Math.PI) / 180);

  if (type === 'E') {
    // Top OD left → small radius down → flat bottom → 15° exit up to right OD
    // Points: (40,50) → (200,50) → curve to (210,80) → (260,80) → (260+exitDx,80-exitDy) → (380,80-exitDy)
    pathPoints = `M 40,50 L 200,50 Q 215,50 215,75 L 260,75 L ${260 + exitDx},${75 - exitDy} L 380,${75 - exitDy}`;
    labels = [
      { x: 207, y: 65, text: 'r', color: 'rgb(251,191,36)' },
      { x: 235, y: 90, text: 'f', color: 'rgb(244,114,182)' },
      { x: 305, y: 60, text: '15°', color: 'rgb(167,139,250)' },
      { x: 25, y: 65, text: 't₁', color: 'rgb(52,211,153)' },
    ];
  } else if (type === 'F') {
    // Form F: enters with 8° chamfer at top-left into undercut, has radius, flat bottom, 15° exit, then face goes up
    // Top OD (40,50) → (190,50) → 8° down to (200,55) → curve into → (215,75) → flat (260,75) → 15° exit (290,67) → vertical face up to (290,40)? Actually face is the perpendicular shoulder
    pathPoints = `M 40,50 L 190,50 L 205,52 Q 215,55 215,75 L 260,75 L ${260 + exitDx},${75 - exitDy} L 305,30`;
    labels = [
      { x: 195, y: 45, text: '8°', color: 'rgb(167,139,250)' },
      { x: 207, y: 65, text: 'r', color: 'rgb(251,191,36)' },
      { x: 235, y: 90, text: 'f', color: 'rgb(244,114,182)' },
      { x: 305, y: 60, text: '15°', color: 'rgb(167,139,250)' },
      { x: 320, y: 35, text: 't₂', color: 'rgb(52,211,153)' },
      { x: 25, y: 65, text: 't₁', color: 'rgb(52,211,153)' },
      { x: 240, y: 45, text: 'g', color: 'rgb(34,197,94)' },
    ];
  } else if (type === 'G') {
    // 55° angled approach (no radius) → flat bottom → 15° exit → vertical face
    // Approach: from (200,50) going down-right at 55° to (215,75)  (Δx = 25/tan55 ≈ 17.5)
    pathPoints = `M 40,50 L 200,50 L 217.5,75 L 260,75 L ${260 + exitDx},${75 - exitDy} L 305,30`;
    labels = [
      { x: 192, y: 70, text: '55°', color: 'rgb(167,139,250)' },
      { x: 235, y: 90, text: 'f', color: 'rgb(244,114,182)' },
      { x: 305, y: 60, text: '15°', color: 'rgb(167,139,250)' },
      { x: 320, y: 35, text: 't₂', color: 'rgb(52,211,153)' },
      { x: 25, y: 65, text: 't₁', color: 'rgb(52,211,153)' },
    ];
  } else {
    // H: 60° angled approach
    pathPoints = `M 40,50 L 200,50 L 214.4,75 L 260,75 L ${260 + exitDx},${75 - exitDy} L 305,30`;
    labels = [
      { x: 192, y: 70, text: '60°', color: 'rgb(167,139,250)' },
      { x: 235, y: 90, text: 'f', color: 'rgb(244,114,182)' },
      { x: 305, y: 60, text: '15°', color: 'rgb(167,139,250)' },
      { x: 320, y: 35, text: 't₂', color: 'rgb(52,211,153)' },
      { x: 25, y: 65, text: 't₁', color: 'rgb(52,211,153)' },
    ];
  }

  return (
    <svg viewBox="0 0 400 200" className="w-full max-w-md" fill="none">
      {/* Axis */}
      <line x1="20" y1="170" x2="380" y2="170" stroke="rgb(82,82,91)" strokeWidth="1" strokeDasharray="8 4" />
      <text x="385" y="173" fill="rgb(82,82,91)" fontSize="9">oś</text>
      {/* Top OD reference dashed */}
      <line x1="40" y1="50" x2="380" y2="50" stroke="rgb(82,82,91)" strokeWidth="0.5" strokeDasharray="3 3" />
      {/* Profile */}
      <path d={pathPoints} stroke={stroke} strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* Body fill (subtle) */}
      <path d={`${pathPoints} L 380,170 L 40,170 Z`} fill="rgba(6,182,212,0.05)" stroke="none" />
      {/* t1 dimension on left */}
      <line x1="25" y1="50" x2="25" y2="75" stroke={dim} strokeWidth="0.8" />
      <line x1="20" y1="50" x2="35" y2="50" stroke={dim} strokeWidth="0.8" />
      <line x1="20" y1="75" x2="35" y2="75" stroke={dim} strokeWidth="0.8" />
      {/* labels */}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} fill={l.color || dim} fontSize="11" fontWeight="bold">
          {l.text}
        </text>
      ))}
    </svg>
  );
};

const Din509Page = () => {
  const [type, setType] = useState<Din509Type>('E');
  const [rValue, setRValue] = useState<string>('');
  const [t1Value, setT1Value] = useState<string>('');

  const r = parseFloat(rValue.replace(',', '.'));
  const t1 = parseFloat(t1Value.replace(',', '.'));
  const result = useMemo(() => {
    if (isNaN(r) || isNaN(t1)) return null;
    return findDin509(r, t1);
  }, [r, t1]);

  const info = DIN509_TYPES[type];
  const t1Options = !isNaN(r) ? t1OptionsForRadius(r) : [];

  return (
    <PageLayout title="Podcięcia DIN 509">
      <div className="space-y-4">
        {/* Type tabs */}
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                type === t
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              Typ {t}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
          <p className="text-sm text-zinc-300">{info.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-zinc-500">
            {info.approachAngle !== null && (
              <span>Kąt wejścia: <span className="text-cyan-400 font-bold">{info.approachAngle}°</span></span>
            )}
            <span>Kąt wyjścia: <span className="text-cyan-400 font-bold">{info.exitAngle}°</span></span>
          </div>
        </div>

        {/* SVG */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 flex justify-center">
          <Din509Svg type={type} />
        </div>

        {/* Inputs */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                Promień r (mm)
              </label>
              <select
                value={rValue}
                onChange={(e) => { setRValue(e.target.value); setT1Value(''); }}
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="">— wybierz —</option>
                {uniqueRadii.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                Głębokość t₁ (mm)
              </label>
              <select
                value={t1Value}
                onChange={(e) => setT1Value(e.target.value)}
                disabled={!t1Options.length}
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer disabled:opacity-50"
              >
                <option value="">— wybierz —</option>
                {t1Options.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Wymiary z normy DIN 509</p>
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="Szerokość f" value={`${result.f} mm`} />
              <ResultCard label="Przesunięcie g" value={`${result.g} mm`} />
              <ResultCard label="Głębokość t₂" value={`${result.t2} mm`} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Oznaczenie na rysunku</p>
              <p className="text-cyan-400 font-bold text-lg">
                DIN 509 — {type} {result.r} × {result.t1}
              </p>
              <p className="text-zinc-500 text-xs mt-1">Zakres: {result.dRange}</p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-500 text-sm">
            Wybierz <span className="text-cyan-400 font-bold">r</span> oraz <span className="text-cyan-400 font-bold">t₁</span>, aby odczytać pozostałe wymiary.
          </div>
        )}

        {/* Full table */}
        <details className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Pełna tabela DIN 509
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="py-2 px-2 text-left">r</th>
                  <th className="py-2 px-2 text-left">t₁</th>
                  <th className="py-2 px-2 text-left">f</th>
                  <th className="py-2 px-2 text-left">g</th>
                  <th className="py-2 px-2 text-left">t₂</th>
                  <th className="py-2 px-2 text-left">Średnica</th>
                </tr>
              </thead>
              <tbody>
                {DIN509_ROWS.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-800/60 text-zinc-300">
                    <td className="py-2 px-2">{row.r}</td>
                    <td className="py-2 px-2">{row.t1}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.f}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.g}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.t2}</td>
                    <td className="py-2 px-2 text-zinc-500 text-xs">{row.dRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </PageLayout>
  );
};

const ResultCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 text-center">
    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
    <p className="text-cyan-400 font-bold text-xl">{value}</p>
  </div>
);

export default Din509Page;
