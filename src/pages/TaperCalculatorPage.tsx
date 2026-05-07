import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const parse = (v: string) => {
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) || n <= 0 ? null : n;
};

const toDms = (deg: number) => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.round(((deg - d) * 60 - m) * 60);
  return { d, m, s };
};

type SolvedField = 'd1' | 'd2' | 'l' | 'halfAngle' | null;

const TaperCalculatorPage = () => {
  const navigate = useNavigate();
  const [d1Input, setD1Input] = useState('');
  const [d2Input, setD2Input] = useState('');
  const [lInput, setLInput] = useState('');
  const [halfAngleInput, setHalfAngleInput] = useState(''); // α/2 in degrees

  const clearAll = () => { setD1Input(''); setD2Input(''); setLInput(''); setHalfAngleInput(''); };

  const solver = useMemo(() => {
    const D1 = parse(d1Input);
    const D2 = parse(d2Input);
    const L = parse(lInput);
    const halfDeg = parse(halfAngleInput); // α/2

    const filled = [D1, D2, L, halfDeg].filter(v => v !== null).length;
    if (filled < 3) return null;

    let solvedField: SolvedField = null;
    let rD1 = D1, rD2 = D2, rL = L, rHalf = halfDeg;

    if (D1 !== null && D2 !== null && L !== null && halfDeg === null) {
      const big = Math.max(D1, D2); const small = Math.min(D1, D2);
      rHalf = Math.atan((big - small) / (2 * L)) * (180 / Math.PI);
      rD1 = big; rD2 = small;
      solvedField = 'halfAngle';
    } else if (D2 !== null && L !== null && halfDeg !== null && D1 === null) {
      const halfRad = halfDeg * (Math.PI / 180);
      rD1 = D2 + 2 * L * Math.tan(halfRad);
      solvedField = 'd1';
    } else if (D1 !== null && L !== null && halfDeg !== null && D2 === null) {
      const halfRad = halfDeg * (Math.PI / 180);
      rD2 = D1 - 2 * L * Math.tan(halfRad);
      if (rD2! < 0) rD2 = 0;
      solvedField = 'd2';
    } else if (D1 !== null && D2 !== null && halfDeg !== null && L === null) {
      const halfRad = halfDeg * (Math.PI / 180);
      const tanA = Math.tan(halfRad);
      if (tanA === 0) return null;
      const big = Math.max(D1, D2); const small = Math.min(D1, D2);
      rL = (big - small) / (2 * tanA);
      rD1 = big; rD2 = small;
      solvedField = 'l';
    } else if (filled === 4) {
      const big = Math.max(D1!, D2!); const small = Math.min(D1!, D2!);
      rHalf = Math.atan((big - small) / (2 * L!)) * (180 / Math.PI);
      rD1 = big; rD2 = small; rL = L;
      solvedField = null;
    } else { return null; }

    if (rD1 === null || rD2 === null || rL === null || rHalf === null || rL === 0) return null;

    const alphaDeg = rHalf * 2;
    const C = (rD1 - rD2) / rL;
    const taperRatio = C > 0 ? 1 / C : 0;

    return {
      d1: rD1, d2: rD2, l: rL, halfDeg: rHalf, alphaDeg, C, taperRatio,
      dmsAlpha: toDms(alphaDeg), dmsHalf: toDms(rHalf), solvedField,
    };
  }, [d1Input, d2Input, lInput, halfAngleInput]);

  const accent = 'border-cyan-500 ring-2 ring-cyan-500/30';

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden pb-safe"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <header className="flex items-center gap-4 mb-6 sm:mb-8 mt-2 p-4 sm:p-6 pb-0 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Wstecz"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold tracking-wide">Kalkulator Faz</h1>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-5">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-2">Narzędzie dla tokarzy</span>
        {/* SVG — half-view of shaft chamfer (lathe view) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 flex justify-center">
          <svg viewBox="0 0 400 200" className="w-full max-w-md" fill="none">
            {/* Spindle axis (bottom) */}
            <line x1="20" y1="170" x2="380" y2="170" stroke="rgb(82,82,91)" strokeWidth="1" strokeDasharray="8 4" />
            <text x="385" y="173" fill="rgb(82,82,91)" fontSize="9">oś</text>

            {/* Part contour: top OD line → chamfer → face down to axis */}
            {/* Top OD horizontal (left) at y=50, from x=40 to x=240 */}
            {/* Chamfer from (240,50) to (310,110) */}
            {/* Face vertical from (310,110) to (310,170) */}
            <polyline
              points="40,50 240,50 310,110 310,170"
              stroke="rgb(6,182,212)"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
            {/* Subtle fill of the body */}
            <polygon points="40,50 240,50 310,110 310,170 40,170" fill="rgba(6,182,212,0.05)" stroke="none" />

            {/* D1 dimension — large diameter (left side) */}
            <line x1="25" y1="50" x2="25" y2="170" stroke="rgb(52,211,153)" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="20" y1="50" x2="45" y2="50" stroke="rgb(52,211,153)" strokeWidth="1" />
            <line x1="20" y1="170" x2="45" y2="170" stroke="rgb(52,211,153)" strokeWidth="1" />
            <text x="14" y="113" fill="rgb(52,211,153)" fontSize="12" fontWeight="bold" textAnchor="middle">D1</text>

            {/* D2 dimension — small diameter (right side, at face) */}
            <line x1="330" y1="110" x2="330" y2="170" stroke="rgb(251,191,36)" strokeWidth="1" strokeDasharray="4 2" />
            <line x1="310" y1="110" x2="335" y2="110" stroke="rgb(251,191,36)" strokeWidth="1" />
            <line x1="310" y1="170" x2="335" y2="170" stroke="rgb(251,191,36)" strokeWidth="1" />
            <text x="345" y="143" fill="rgb(251,191,36)" fontSize="12" fontWeight="bold" textAnchor="middle">D2</text>

            {/* L dimension — chamfer length along Z (top) */}
            <line x1="240" y1="30" x2="310" y2="30" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="240" y1="25" x2="240" y2="55" stroke="rgb(148,163,184)" strokeWidth="0.8" strokeDasharray="3 2" />
            <line x1="310" y1="25" x2="310" y2="115" stroke="rgb(148,163,184)" strokeWidth="0.8" strokeDasharray="3 2" />
            <text x="275" y="22" fill="rgb(148,163,184)" fontSize="11" fontWeight="bold" textAnchor="middle">L</text>

            {/* Angle α/2 — between chamfer line and horizontal (extension of OD) */}
            <line x1="240" y1="50" x2="320" y2="50" stroke="rgb(244,114,182)" strokeWidth="0.8" strokeDasharray="3 2" />
            <path d="M 280,50 A 40 40 0 0 1 268.5,77" stroke="rgb(244,114,182)" strokeWidth="1.5" fill="none" />
            <text x="288" y="72" fill="rgb(244,114,182)" fontSize="10" fontWeight="bold">Kąt α/2</text>
          </svg>
        </div>

        {/* 4 Input fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="D1 — Śr. większa (mm)" value={d1Input} onChange={setD1Input} color="text-emerald-400"
            solved={solver?.solvedField === 'd1'} solvedValue={solver?.d1} unit="mm" accentClass={accent} />
          <Field label="D2 — Śr. mniejsza (mm)" value={d2Input} onChange={setD2Input} color="text-amber-400"
            solved={solver?.solvedField === 'd2'} solvedValue={solver?.d2} unit="mm" accentClass={accent} />
          <Field label="L — Długość (mm)" value={lInput} onChange={setLInput} color="text-zinc-300"
            solved={solver?.solvedField === 'l'} solvedValue={solver?.l} unit="mm" accentClass={accent} />
          <Field label="α/2 — Kąt ustawienia (°)" value={halfAngleInput} onChange={setHalfAngleInput} color="text-pink-400"
            solved={solver?.solvedField === 'halfAngle'} solvedValue={solver?.halfDeg} unit="°" accentClass={accent} />
        </div>

        <button onClick={clearAll} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm">
          <RotateCcw className="w-4 h-4" /> Wyczyść wszystko
        </button>

        {/* Result cards */}
        {solver && (
          <div className="space-y-3">
            {/* Full angle α */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Kąt pełny (α)</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400 text-center">{solver.alphaDeg.toFixed(3)}°</p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {solver.dmsAlpha.d}° {solver.dmsAlpha.m}' {solver.dmsAlpha.s}"
              </p>
            </div>

            {/* Half angle α/2 */}
            <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
              <p className="text-cyan-300 text-sm font-medium mb-2">Kąt ustawienia (α/2) — dla maszyny</p>
              <p className="text-3xl md:text-4xl font-black text-cyan-400 text-center">{solver.halfDeg.toFixed(3)}°</p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {solver.dmsHalf.d}° {solver.dmsHalf.m}' {solver.dmsHalf.s}"
              </p>
            </div>

            {/* Taper ratio */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Zbieżność</p>
              <p className="text-2xl md:text-3xl font-bold text-cyan-400 text-center">
                {solver.C > 0 ? `1 : ${solver.taperRatio.toFixed(2)}` : '—'}
              </p>
              <p className="text-zinc-600 text-xs text-center mt-1.5">C = {solver.C.toFixed(4)} mm/mm</p>
            </div>
          </div>
        )}

        {!solver && (
          <p className="text-center text-zinc-500 py-10">Wypełnij dowolne 3 z 4 pól — czwarte zostanie obliczone automatycznie.</p>
        )}
      </main>
    </div>
  );
};

function Field({ label, value, onChange, color, solved, solvedValue, unit, accentClass }: {
  label: string; value: string; onChange: (v: string) => void; color: string;
  solved: boolean; solvedValue?: number; unit: string; accentClass: string;
}) {
  return (
    <div className="flex flex-col">
      <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${color}`}>{label}</label>
      <input type="text" inputMode="decimal" placeholder={solved && solvedValue !== undefined ? solvedValue.toFixed(3) : '—'}
        value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-lg text-center font-bold ${solved ? accentClass : 'border-zinc-800'}`}
      />
      {solved && solvedValue !== undefined && (
        <span className="text-cyan-400 text-xs text-center font-bold mt-1">= {solvedValue.toFixed(3)} {unit}</span>
      )}
    </div>
  );
}

export default TaperCalculatorPage;
