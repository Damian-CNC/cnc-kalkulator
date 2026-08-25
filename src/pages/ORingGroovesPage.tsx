import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';

const CORDS = [1.5, 1.78, 2.0, 2.5, 2.62, 3.0, 3.53, 4.0, 5.0, 5.33, 7.0];

type Mode = 'radial' | 'axial' | 'dynamic';

const modes: { id: Mode; label: string; squeeze: [number, number] }[] = [
  { id: 'radial', label: 'Statyczne promieniowe', squeeze: [0.15, 0.25] },
  { id: 'axial', label: 'Statyczne osiowe', squeeze: [0.18, 0.28] },
  { id: 'dynamic', label: 'Dynamiczne', squeeze: [0.1, 0.18] },
];

const ORingGroovesPage = () => {
  const [cord, setCord] = useState(2.62);
  const [mode, setMode] = useState<Mode>('radial');

  const data = useMemo(() => {
    const m = modes.find((x) => x.id === mode)!;
    const [sMin, sMax] = m.squeeze;
    const sNom = (sMin + sMax) / 2;
    const t = cord * (1 - sNom);
    const tMin = cord * (1 - sMax);
    const tMax = cord * (1 - sMin);
    const b0 = cord * 1.35;
    const step = cord * 0.65;
    return {
      squeezePct: [sMin * 100, sMax * 100] as [number, number],
      t,
      tMin,
      tMax,
      b0,
      b1: b0 + step,
      b2: b0 + 2 * step,
      r1: Math.max(0.1, cord * 0.12),
      r2: Math.max(0.1, cord * 0.06),
      chamfer: cord * 1.5,
      fill: ((Math.PI * cord * cord) / 4 / (b0 * t)) * 100,
    };
  }, [cord, mode]);

  const Cell = ({ label, value, unit = 'mm' }: { label: string; value: string; unit?: string }) => (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-cyan-400">
        {value} <span className="text-sm text-zinc-500">{unit}</span>
      </div>
    </div>
  );

  return (
    <PageLayout title="Rowki O-ring (ISO 3601)">
      <div className="glass-module">
        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Grubość sznura d₂ [mm]
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {CORDS.map((c) => (
            <button
              key={c}
              onClick={() => setCord(c)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                cord === c
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {c.toFixed(2)}
            </button>
          ))}
        </div>

        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Rodzaj uszczelnienia
        </label>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`py-3 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                mode === m.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wymiary rowka</h2>
        <div className="grid grid-cols-2 gap-4">
          <Cell label="Głębokość t" value={data.t.toFixed(2)} />
          <Cell
            label="Zakres t"
            value={`${data.tMin.toFixed(2)}–${data.tMax.toFixed(2)}`}
          />
          <Cell label="Szerokość b (bez podparcia)" value={data.b0.toFixed(2)} />
          <Cell label="b — 1 pierścień podpierający" value={data.b1.toFixed(2)} />
          <Cell label="b — 2 pierścienie" value={data.b2.toFixed(2)} />
          <Cell label="Ścisk" value={`${data.squeezePct[0].toFixed(0)}–${data.squeezePct[1].toFixed(0)}`} unit="%" />
          <Cell label="Promień dna r₁" value={data.r1.toFixed(2)} />
          <Cell label="Promień krawędzi r₂" value={data.r2.toFixed(2)} />
          <Cell label="Skos montażowy 15°, dł." value={data.chamfer.toFixed(2)} />
          <Cell label="Wypełnienie rowka" value={data.fill.toFixed(0)} unit="%" />
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Schemat rowka</h2>
        <svg viewBox="0 0 300 150" className="w-full max-w-lg mx-auto">
          <path d="M10 40 H100 V95 H190 V40 H250 L290 20" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
          <circle cx="145" cy="72" r="24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="100" y1="115" x2="190" y2="115" stroke="#71717a" />
          <text x="138" y="130" fill="#22d3ee" fontSize="11">b</text>
          <line x1="215" y1="40" x2="215" y2="95" stroke="#71717a" />
          <text x="220" y="72" fill="#22d3ee" fontSize="11">t</text>
          <text x="256" y="18" fill="#a1a1aa" fontSize="10">15°</text>
          <text x="104" y="90" fill="#a1a1aa" fontSize="9">r₁</text>
        </svg>
        <p className="text-xs text-zinc-600 mt-4">
          Wartości orientacyjne wg ISO 3601-2. Zalecane wypełnienie rowka 70–85 %.
        </p>
      </div>

      <div className="h-20" />
      <ClearFab onClear={() => { setCord(2.62); setMode('radial'); }} />
    </PageLayout>
  );
};

export default ORingGroovesPage;
