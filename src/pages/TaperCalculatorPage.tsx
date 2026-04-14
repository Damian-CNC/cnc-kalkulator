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

type SolvedField = 'd1' | 'd2' | 'l' | 'angle' | null;

const TaperCalculatorPage = () => {
  const navigate = useNavigate();
  const [d1Input, setD1Input] = useState('');
  const [d2Input, setD2Input] = useState('');
  const [lInput, setLInput] = useState('');
  const [angleInput, setAngleInput] = useState('');

  const clearAll = () => {
    setD1Input(''); setD2Input(''); setLInput(''); setAngleInput('');
  };

  const solver = useMemo(() => {
    const D1 = parse(d1Input);
    const D2 = parse(d2Input);
    const L = parse(lInput);
    const A = parse(angleInput);

    const filled = [D1, D2, L, A].filter(v => v !== null).length;
    if (filled < 3) return null;

    let solvedField: SolvedField = null;
    let rD1 = D1, rD2 = D2, rL = L, rAngle = A;

    if (D1 !== null && D2 !== null && L !== null && A === null) {
      // solve angle
      const big = Math.max(D1, D2);
      const small = Math.min(D1, D2);
      rAngle = Math.atan((big - small) / (2 * L)) * (180 / Math.PI);
      rD1 = big; rD2 = small;
      solvedField = 'angle';
    } else if (D2 !== null && L !== null && A !== null && D1 === null) {
      // solve D1
      const tanA = Math.tan(A * Math.PI / 180);
      rD1 = D2 + 2 * L * tanA;
      rD2 = D2;
      rAngle = A;
      solvedField = 'd1';
    } else if (D1 !== null && L !== null && A !== null && D2 === null) {
      // solve D2
      const tanA = Math.tan(A * Math.PI / 180);
      rD2 = D1 - 2 * L * tanA;
      if (rD2 < 0) rD2 = 0;
      rAngle = A;
      solvedField = 'd2';
    } else if (D1 !== null && D2 !== null && A !== null && L === null) {
      // solve L
      const tanA = Math.tan(A * Math.PI / 180);
      if (tanA === 0) return null;
      const big = Math.max(D1, D2);
      const small = Math.min(D1, D2);
      rL = (big - small) / (2 * tanA);
      rD1 = big; rD2 = small;
      rAngle = A;
      solvedField = 'l';
    } else if (filled === 4) {
      // all filled, just compute from D1/D2/L
      const big = Math.max(D1!, D2!);
      const small = Math.min(D1!, D2!);
      rAngle = Math.atan((big - small) / (2 * L!)) * (180 / Math.PI);
      rD1 = big; rD2 = small; rL = L;
      solvedField = null;
    } else {
      return null;
    }

    if (rD1 === null || rD2 === null || rL === null || rAngle === null || rL === 0) return null;

    const betaDeg = rAngle;
    const alfaDeg = betaDeg * 2;
    const C = (rD1 - rD2) / rL;
    const taperRatio = C > 0 ? 1 / C : 0;

    return {
      d1: rD1, d2: rD2, l: rL, betaDeg, alfaDeg, C, taperRatio,
      dms: toDms(betaDeg), dmsAlfa: toDms(alfaDeg), solvedField,
    };
  }, [d1Input, d2Input, lInput, angleInput]);

  // Dynamic SVG points based on solved values
  const svgPoints = useMemo(() => {
    if (!solver) return { topLeft: 30, bottomLeft: 130, topRight: 50, bottomRight: 110 };
    const maxD = Math.max(solver.d1, 1);
    const ratio = solver.d2 / maxD;
    const halfD1 = 50; // half-height for D1
    const halfD2 = halfD1 * ratio;
    const cy = 80;
    return {
      topLeft: cy - halfD1, bottomLeft: cy + halfD1,
      topRight: cy - halfD2, bottomRight: cy + halfD2,
    };
  }, [solver]);

  const accentBorder = 'border-cyan-500 ring-2 ring-cyan-500/30';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-6" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <header className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          Kalkulator Stożków
        </h1>
      </header>

      <main className="w-full max-w-2xl mx-auto space-y-5">
        {/* SVG Diagram */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex justify-center">
          <svg viewBox="0 0 320 160" className="w-full max-w-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon
              points={`60,${svgPoints.topLeft} 260,${svgPoints.topRight} 260,${svgPoints.bottomRight} 60,${svgPoints.bottomLeft}`}
              fill="rgba(6,182,212,0.1)" stroke="rgb(6,182,212)" strokeWidth="1.5"
            />
            <line x1="40" y1={svgPoints.topLeft} x2="40" y2={svgPoints.bottomLeft} stroke="rgb(52,211,153)" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="20" y="85" fill="rgb(52,211,153)" fontSize="12" fontWeight="bold" textAnchor="middle">D1</text>
            <line x1="280" y1={svgPoints.topRight} x2="280" y2={svgPoints.bottomRight} stroke="rgb(251,191,36)" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="300" y="85" fill="rgb(251,191,36)" fontSize="12" fontWeight="bold" textAnchor="middle">D2</text>
            <line x1="60" y1="145" x2="260" y2="145" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="60" y1="140" x2="60" y2="150" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="260" y1="140" x2="260" y2="150" stroke="rgb(148,163,184)" strokeWidth="1" />
            <text x="160" y="155" fill="rgb(148,163,184)" fontSize="11" textAnchor="middle">L</text>
            <path d={`M 240,80 A 30 30 0 0 1 260,${svgPoints.topRight}`} stroke="rgb(244,114,182)" strokeWidth="1.5" fill="none" />
            <text x="232" y="58" fill="rgb(244,114,182)" fontSize="10" fontWeight="bold">α/2</text>
            <line x1="50" y1="80" x2="270" y2="80" stroke="rgb(63,63,70)" strokeWidth="0.5" strokeDasharray="6 3" />
          </svg>
        </div>

        {/* Inputs - 4 fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emerald-400">D1 (mm)</label>
            <input type="text" inputMode="decimal" placeholder={solver?.solvedField === 'd1' ? solver.d1.toFixed(3) : '0'}
              value={d1Input} onChange={(e) => setD1Input(e.target.value)}
              className={`flex h-12 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold ${solver?.solvedField === 'd1' ? accentBorder : 'border-zinc-700'}`}
            />
            {solver?.solvedField === 'd1' && <span className="text-cyan-400 text-xs text-center font-bold">= {solver.d1.toFixed(3)} mm</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-amber-400">D2 (mm)</label>
            <input type="text" inputMode="decimal" placeholder={solver?.solvedField === 'd2' ? solver.d2.toFixed(3) : '0'}
              value={d2Input} onChange={(e) => setD2Input(e.target.value)}
              className={`flex h-12 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold ${solver?.solvedField === 'd2' ? accentBorder : 'border-zinc-700'}`}
            />
            {solver?.solvedField === 'd2' && <span className="text-cyan-400 text-xs text-center font-bold">= {solver.d2.toFixed(3)} mm</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">L (mm)</label>
            <input type="text" inputMode="decimal" placeholder={solver?.solvedField === 'l' ? solver.l.toFixed(3) : '0'}
              value={lInput} onChange={(e) => setLInput(e.target.value)}
              className={`flex h-12 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold ${solver?.solvedField === 'l' ? accentBorder : 'border-zinc-700'}`}
            />
            {solver?.solvedField === 'l' && <span className="text-cyan-400 text-xs text-center font-bold">= {solver.l.toFixed(3)} mm</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-pink-400">α/2 (°)</label>
            <input type="text" inputMode="decimal" placeholder={solver?.solvedField === 'angle' ? solver.betaDeg.toFixed(3) : '0'}
              value={angleInput} onChange={(e) => setAngleInput(e.target.value)}
              className={`flex h-12 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold ${solver?.solvedField === 'angle' ? accentBorder : 'border-zinc-700'}`}
            />
            {solver?.solvedField === 'angle' && <span className="text-cyan-400 text-xs text-center font-bold">= {solver.betaDeg.toFixed(3)}°</span>}
          </div>
        </div>

        {/* Clear button */}
        <button onClick={clearAll}
          className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Wyczyść wszystko
        </button>

        {/* Results */}
        {solver && (
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Kąt ustawienia (α/2)</p>
              <p className="text-3xl md:text-4xl font-black text-cyan-400 text-center">
                {solver.betaDeg.toFixed(3)}°
              </p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {solver.dms.d}° {solver.dms.m}' {solver.dms.s}"
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Kąt pełny (α)</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400 text-center">
                {solver.alfaDeg.toFixed(3)}°
              </p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {solver.dmsAlfa.d}° {solver.dmsAlfa.m}' {solver.dmsAlfa.s}"
              </p>
            </div>

            <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
              <p className="text-cyan-300 text-sm font-medium mb-2">Zbieżność</p>
              <p className="text-2xl md:text-3xl font-bold text-cyan-400 text-center">
                {solver.C > 0 ? `1 : ${solver.taperRatio.toFixed(2)}` : '—'}
              </p>
              <p className="text-cyan-600 text-xs text-center mt-1.5">
                C = {solver.C.toFixed(4)} mm/mm
              </p>
            </div>
          </div>
        )}

        {!solver && (
          <p className="text-center text-zinc-500 py-10">
            Wypełnij dowolne 3 z 4 pól — czwarte zostanie obliczone automatycznie.
          </p>
        )}
      </main>
    </div>
  );
};

export default TaperCalculatorPage;
