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

  // Dynamic SVG
  const svg = useMemo(() => {
    const d1 = solver?.d1 ?? 60;
    const d2 = solver?.d2 ?? 40;
    const maxD = Math.max(d1, 1);
    const h1 = 45; // max half-height for D1
    const h2 = h1 * (d2 / maxD);
    const cy = 80;
    return { t1: cy - h1, b1: cy + h1, t2: cy - h2, b2: cy + h2 };
  }, [solver]);

  const accent = 'border-cyan-500 ring-2 ring-cyan-500/30';

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-6" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <header className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">Kalkulator Stożków</h1>
      </header>

      <main className="w-full max-w-2xl mx-auto space-y-5">
        {/* SVG Diagram — symmetric taper cross-section */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex justify-center">
          <svg viewBox="0 0 340 180" className="w-full max-w-md" fill="none">
            {/* Taper body — symmetric */}
            <polygon points={`70,${svg.t1} 270,${svg.t2} 270,${svg.b2} 70,${svg.b1}`} fill="rgba(6,182,212,0.08)" stroke="rgb(6,182,212)" strokeWidth="1.5" />
            {/* Center axis */}
            <line x1="50" y1="80" x2="290" y2="80" stroke="rgb(63,63,70)" strokeWidth="0.8" strokeDasharray="6 3" />
            <text x="295" y="83" fill="rgb(82,82,91)" fontSize="9">oś</text>

            {/* D1 dimension */}
            <line x1="50" y1={svg.t1} x2="50" y2={svg.b1} stroke="rgb(52,211,153)" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="50" y1={svg.t1} x2="55" y2={svg.t1} stroke="rgb(52,211,153)" strokeWidth="1" />
            <line x1="50" y1={svg.b1} x2="55" y2={svg.b1} stroke="rgb(52,211,153)" strokeWidth="1" />
            <text x="32" y="84" fill="rgb(52,211,153)" fontSize="12" fontWeight="bold" textAnchor="middle">D1</text>

            {/* D2 dimension */}
            <line x1="290" y1={svg.t2} x2="290" y2={svg.b2} stroke="rgb(251,191,36)" strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="285" y1={svg.t2} x2="290" y2={svg.t2} stroke="rgb(251,191,36)" strokeWidth="1" />
            <line x1="285" y1={svg.b2} x2="290" y2={svg.b2} stroke="rgb(251,191,36)" strokeWidth="1" />
            <text x="308" y="84" fill="rgb(251,191,36)" fontSize="12" fontWeight="bold" textAnchor="middle">D2</text>

            {/* L dimension */}
            <line x1="70" y1="165" x2="270" y2="165" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="70" y1="160" x2="70" y2="170" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="270" y1="160" x2="270" y2="170" stroke="rgb(148,163,184)" strokeWidth="1" />
            <text x="170" y="175" fill="rgb(148,163,184)" fontSize="11" textAnchor="middle">L</text>

            {/* α — full angle between upper and lower generatrix at right side */}
            <line x1="270" y1={svg.t2} x2="240" y2={svg.t2 - 8} stroke="rgb(244,114,182)" strokeWidth="0.8" strokeDasharray="3 2" />
            <line x1="270" y1={svg.b2} x2="240" y2={svg.b2 + 8} stroke="rgb(244,114,182)" strokeWidth="0.8" strokeDasharray="3 2" />
            <path d={`M 255,${svg.t2 + 4} A 15 15 0 0 1 255,${svg.b2 - 4}`} stroke="rgb(244,114,182)" strokeWidth="1.5" fill="none" />
            <text x="242" y={80 + 4} fill="rgb(244,114,182)" fontSize="10" fontWeight="bold" textAnchor="end">α</text>

            {/* α/2 — half angle between axis and upper generatrix */}
            <path d={`M 120,80 A 50 50 0 0 0 ${115},${svg.t1 + (80 - svg.t1) * 0.35}`} stroke="rgb(6,182,212)" strokeWidth="1.2" fill="none" />
            <text x="105" y={svg.t1 + (80 - svg.t1) * 0.55} fill="rgb(6,182,212)" fontSize="9" fontWeight="bold" textAnchor="end">α/2</text>
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
          <Field label="α — Kąt pełny (°)" value={alphaInput} onChange={setAlphaInput} color="text-pink-400"
            solved={solver?.solvedField === 'alpha'} solvedValue={solver?.alphaDeg} unit="°" accentClass={accent} />
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
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-medium ${color}`}>{label}</label>
      <input type="text" inputMode="decimal" placeholder={solved && solvedValue !== undefined ? solvedValue.toFixed(3) : '—'}
        value={value} onChange={(e) => onChange(e.target.value)}
        className={`flex h-12 w-full rounded-xl border bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold transition-all ${solved ? accentClass : 'border-zinc-700'}`}
      />
      {solved && solvedValue !== undefined && (
        <span className="text-cyan-400 text-xs text-center font-bold">= {solvedValue.toFixed(3)} {unit}</span>
      )}
    </div>
  );
}

export default TaperCalculatorPage;
