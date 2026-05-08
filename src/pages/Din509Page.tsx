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
  const profileStroke = 'rgb(6,182,212)';
  const dimStroke = 'rgb(113,113,122)';
  const labelFill = 'rgb(161,161,170)';
  const axisStroke = 'rgb(82,82,91)';

  const mainPaths: Record<Din509Type, string> = {
    E: 'M 20,30 L 100,30 L 100,85 A 15,15 0 0,0 115,100 L 150,100 L 210,80 L 280,80',
    F: 'M 20,30 L 100,30 L 100,65 L 90,88 A 12,12 0 0,0 102,100 L 150,100 L 210,80 L 280,80',
    G: 'M 20,30 L 100,30 L 100,55 L 60,90 A 10,10 0 0,0 70,100 L 150,100 L 210,80 L 280,80',
    H: 'M 20,30 L 100,30 L 100,50 L 65,95 A 5,5 0 0,0 70,100 L 150,100 L 210,80 L 280,80',
  };

  const entryAngleLabels: Partial<Record<Din509Type, { x: number; y: number; text: string }>> = {
    F: { x: 72, y: 77, text: '8°' },
    G: { x: 56, y: 72, text: '55°' },
    H: { x: 58, y: 78, text: '60°' },
  };

  const entryLabel = entryAngleLabels[type];

  return (
    <svg viewBox="0 0 300 150" className="w-full max-w-md" fill="none">
      {/* Spindle axis */}
      <line x1="20" y1="140" x2="280" y2="140" stroke={axisStroke} strokeWidth="1" strokeDasharray="4 4" />
      <text x="282" y="143" fill={axisStroke} fontSize="7">oś</text>

      {/* Helper lines */}
      <line x1="100" y1="30" x2="100" y2="110" stroke={axisStroke} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="80" y1="80" x2="280" y2="80" stroke={axisStroke} strokeWidth="1" strokeDasharray="2 2" />

      {/* Main profile contour */}
      <path d={mainPaths[type]} stroke={profileStroke} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />

      {/* t1 (depth from smaller Ø to undercut bottom) on far left */}
      <line x1="28" y1={yOD} x2="28" y2={yBottom} stroke={dimStroke} strokeWidth="0.8" />
      <line x1="22" y1={yOD} x2="34" y2={yOD} stroke={dimStroke} strokeWidth="0.8" />
      <line x1="22" y1={yBottom} x2="34" y2={yBottom} stroke={dimStroke} strokeWidth="0.8" />
      <text x="10" y={(yOD + yBottom) / 2 + 4} fill={labelFill} fontSize="11" fontWeight="bold">t₁</text>

      {/* f (flat bottom width) */}
      <line x1={xRadiusEnd} y1={yBottom + 14} x2={xExitStart} y2={yBottom + 14} stroke={dimStroke} strokeWidth="0.8" />
      <line x1={xRadiusEnd} y1={yBottom + 10} x2={xRadiusEnd} y2={yBottom + 18} stroke={dimStroke} strokeWidth="0.8" />
      <line x1={xExitStart} y1={yBottom + 10} x2={xExitStart} y2={yBottom + 18} stroke={dimStroke} strokeWidth="0.8" />
      <text x={(xRadiusEnd + xExitStart) / 2 - 4} y={yBottom + 28} fill={labelFill} fontSize="11" fontWeight="bold">f</text>

      {/* r (radius pointer) */}
      <line x1={xRadiusEnd - 4} y1={yBottom - 4} x2={xRadiusEnd + 14} y2={yBottom - 22} stroke={dimStroke} strokeWidth="0.8" />
      <text x={xRadiusEnd + 16} y={yBottom - 22} fill={labelFill} fontSize="11" fontWeight="bold">r</text>

      {/* 15° exit angle label */}
      <text x={xExitStart + exitDx / 2 - 4} y={yOD + 24} fill={labelFill} fontSize="11" fontWeight="bold">15°</text>

      {/* d1 (smaller Ø) — vertical dim on far right */}
      <line x1="370" y1={yOD} x2="370" y2={yAxis} stroke={dimStroke} strokeWidth="0.8" />
      <line x1="364" y1={yOD} x2="376" y2={yOD} stroke={dimStroke} strokeWidth="0.8" />
      <line x1="364" y1={yAxis} x2="376" y2={yAxis} stroke={dimStroke} strokeWidth="0.8" />
      <text x="356" y={(yOD + yAxis) / 2 + 4} fill={labelFill} fontSize="11" fontWeight="bold">d₁</text>

      {/* t2 — height of vertical shoulder face (yTop → yOD), shown on left of wall */}
      <line x1={xWall - 40} y1={yTop} x2={xWall - 40} y2={yOD} stroke={dimStroke} strokeWidth="0.8" />
      <line x1={xWall - 44} y1={yTop} x2={xWall - 36} y2={yTop} stroke={dimStroke} strokeWidth="0.8" />
      <line x1={xWall - 44} y1={yOD} x2={xWall - 36} y2={yOD} stroke={dimStroke} strokeWidth="0.8" />
      <text x={xWall - 58} y={(yTop + yOD) / 2 + 4} fill={labelFill} fontSize="11" fontWeight="bold">t₂</text>

      {/* Entry angle label (8° / 55° / 60°) */}
      {entryLabel && (
        <text x={entryLabel.x} y={entryLabel.y} fill={labelFill} fontSize="11" fontWeight="bold">
          {entryLabel.text}
        </text>
      )}
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
