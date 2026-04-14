import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TaperCalculatorPage = () => {
  const navigate = useNavigate();
  const [d1Input, setD1Input] = useState('');
  const [d2Input, setD2Input] = useState('');
  const [lInput, setLInput] = useState('');

  const parse = (v: string) => {
    const n = parseFloat(v.replace(',', '.'));
    return isNaN(n) || n < 0 ? null : n;
  };

  const result = useMemo(() => {
    const D1 = parse(d1Input);
    const D2 = parse(d2Input);
    const L = parse(lInput);
    if (D1 === null || D2 === null || L === null || L === 0) return null;

    const big = Math.max(D1, D2);
    const small = Math.min(D1, D2);
    const rDiff = (big - small) / 2;
    const betaRad = Math.atan(rDiff / L);
    const betaDeg = betaRad * (180 / Math.PI);
    const alfaDeg = betaDeg * 2;
    const C = (big - small) / L;
    const taperRatio = C > 0 ? (1 / C) : 0;

    // DMS
    const d = Math.floor(betaDeg);
    const m = Math.floor((betaDeg - d) * 60);
    const s = Math.round(((betaDeg - d) * 60 - m) * 60);

    const dAlfa = Math.floor(alfaDeg);
    const mAlfa = Math.floor((alfaDeg - dAlfa) * 60);
    const sAlfa = Math.round(((alfaDeg - dAlfa) * 60 - mAlfa) * 60);

    return { betaDeg, alfaDeg, C, taperRatio, dms: { d, m, s }, dmsAlfa: { d: dAlfa, m: mAlfa, s: sAlfa }, big, small };
  }, [d1Input, d2Input, lInput]);

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
            {/* Taper body */}
            <polygon points="60,30 260,50 260,110 60,130" fill="rgba(6,182,212,0.1)" stroke="rgb(6,182,212)" strokeWidth="1.5" />
            {/* D1 line */}
            <line x1="40" y1="30" x2="40" y2="130" stroke="rgb(52,211,153)" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="20" y="85" fill="rgb(52,211,153)" fontSize="12" fontWeight="bold" textAnchor="middle">D1</text>
            {/* D2 line */}
            <line x1="280" y1="50" x2="280" y2="110" stroke="rgb(251,191,36)" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="300" y="85" fill="rgb(251,191,36)" fontSize="12" fontWeight="bold" textAnchor="middle">D2</text>
            {/* L line */}
            <line x1="60" y1="145" x2="260" y2="145" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="60" y1="140" x2="60" y2="150" stroke="rgb(148,163,184)" strokeWidth="1" />
            <line x1="260" y1="140" x2="260" y2="150" stroke="rgb(148,163,184)" strokeWidth="1" />
            <text x="160" y="155" fill="rgb(148,163,184)" fontSize="11" textAnchor="middle">L</text>
            {/* Angle arc */}
            <path d="M 240,80 A 30 30 0 0 1 260,50" stroke="rgb(244,114,182)" strokeWidth="1.5" fill="none" />
            <text x="232" y="58" fill="rgb(244,114,182)" fontSize="10" fontWeight="bold">α/2</text>
            {/* Center axis */}
            <line x1="50" y1="80" x2="270" y2="80" stroke="rgb(63,63,70)" strokeWidth="0.5" strokeDasharray="6 3" />
          </svg>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-3 gap-3">
          <InputField label="D1 (mm)" value={d1Input} onChange={setD1Input} color="text-emerald-400" />
          <InputField label="D2 (mm)" value={d2Input} onChange={setD2Input} color="text-amber-400" />
          <InputField label="L (mm)" value={lInput} onChange={setLInput} color="text-zinc-300" />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Half angle */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Kąt ustawienia (α/2)</p>
              <p className="text-3xl md:text-4xl font-black text-cyan-400 text-center">
                {result.betaDeg.toFixed(3)}°
              </p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {result.dms.d}° {result.dms.m}' {result.dms.s}"
              </p>
            </div>

            {/* Full angle */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-2">Kąt pełny (α)</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400 text-center">
                {result.alfaDeg.toFixed(3)}°
              </p>
              <p className="text-center text-amber-400 text-sm mt-1 font-medium">
                {result.dmsAlfa.d}° {result.dmsAlfa.m}' {result.dmsAlfa.s}"
              </p>
            </div>

            {/* Taper ratio */}
            <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
              <p className="text-cyan-300 text-sm font-medium mb-2">Zbieżność</p>
              <p className="text-2xl md:text-3xl font-bold text-cyan-400 text-center">
                {result.C > 0 ? `1 : ${result.taperRatio.toFixed(2)}` : '—'}
              </p>
              <p className="text-cyan-600 text-xs text-center mt-1.5">
                C = {result.C.toFixed(4)} mm/mm
              </p>
            </div>
          </div>
        )}

        {!result && (
          <p className="text-center text-zinc-500 py-10">
            Wpisz wymiary D1, D2 i L, aby obliczyć parametry stożka.
          </p>
        )}
      </main>
    </div>
  );
};

function InputField({ label, value, onChange, color }: { label: string; value: string; onChange: (v: string) => void; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-sm font-medium ${color}`}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-center font-bold"
      />
    </div>
  );
}

export default TaperCalculatorPage;
