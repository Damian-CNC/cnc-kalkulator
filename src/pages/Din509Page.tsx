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
    E: 'M 20,30 L 100,30 L 100,80 A 10,10 0 0,0 110,90 L 150,90 L 187,80 L 280,80',
    F: 'M 20,30 L 100,30 L 100,70 L 96,82 A 8,8 0 0,0 104,90 L 150,90 L 187,80 L 280,80',
    G: 'M 20,30 L 100,30 L 100,65 L 85,82 A 8,8 0 0,0 93,90 L 150,90 L 187,80 L 280,80',
    H: 'M 20,30 L 100,30 L 100,60 L 82,85 A 5,5 0 0,0 87,90 L 150,90 L 187,80 L 280,80',
  };

  const t2LeftX: Record<'F' | 'G' | 'H', number> = { F: 96, G: 85, H: 82 };

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

      {/* t1 — vertical depth from smaller Ø down to undercut bottom */}
      <line x1="88" y1="80" x2="88" y2="90" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="84" y1="80" x2="92" y2="80" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="84" y1="90" x2="92" y2="90" stroke={dimStroke} strokeWidth="0.8" />
      <text x="76" y="88" fill={labelFill} fontSize="9" fontWeight="bold">t₁</text>

      {type !== 'E' && (
        <>
          {/* t2 — horizontal face allowance to the left of the shoulder */}
          {(() => {
            const xLeft = t2LeftX[type as 'F' | 'G' | 'H'];
            return (
              <>
                <line x1={xLeft} y1="20" x2={xLeft} y2="40" stroke={dimStroke} strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1={xLeft} y1="24" x2="100" y2="24" stroke={dimStroke} strokeWidth="0.8" />
                <line x1={xLeft} y1="20" x2={xLeft} y2="28" stroke={dimStroke} strokeWidth="0.8" />
                <line x1="100" y1="20" x2="100" y2="28" stroke={dimStroke} strokeWidth="0.8" />
                <text x={(xLeft + 100) / 2 - 4} y="18" fill={labelFill} fontSize="9" fontWeight="bold">t₂</text>
              </>
            );
          })()}
        </>
      )}

      {/* f below the undercut bottom */}
      <line x1="115" y1="102" x2="150" y2="102" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="115" y1="98" x2="115" y2="106" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="150" y1="98" x2="150" y2="106" stroke={dimStroke} strokeWidth="0.8" />
      <text x="130" y="116" fill={labelFill} fontSize="9" fontWeight="bold">f</text>

      {/* r pointer */}
      <line x1="112" y1="88" x2="128" y2="78" stroke={dimStroke} strokeWidth="0.8" />
      <text x="131" y="78" fill={labelFill} fontSize="9" fontWeight="bold">r</text>

      {/* Angle label 15° on the exit ramp (150,90 → 187,80) */}
      <text x="170" y="78" fill={labelFill} fontSize="9" fontWeight="bold">15°</text>

      {/* d1 (smaller Ø) */}
      <line x1="270" y1="80" x2="270" y2="140" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="266" y1="80" x2="274" y2="80" stroke={dimStroke} strokeWidth="0.8" />
      <line x1="266" y1="140" x2="274" y2="140" stroke={dimStroke} strokeWidth="0.8" />
      <text x="258" y="113" fill={labelFill} fontSize="9" fontWeight="bold">d₁</text>

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
