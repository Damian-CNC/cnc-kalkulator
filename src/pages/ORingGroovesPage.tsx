import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { Centerline, Dimension, EngineeringDrawing, Leader, Witness } from '@/components/EngineeringDrawing';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';

const CORDS = [1.5, 1.78, 2.0, 2.5, 2.62, 3.0, 3.53, 4.0, 5.0, 5.33, 7.0];

type Mode = 'radial' | 'axial' | 'dynamic';
type ORingDimension = 'b' | 't' | 'r1' | 'r2' | null;

const modes: { id: Mode; label: string; squeeze: [number, number] }[] = [
  { id: 'radial', label: 'Statyczne promieniowe', squeeze: [0.15, 0.25] },
  { id: 'axial', label: 'Statyczne osiowe', squeeze: [0.18, 0.28] },
  { id: 'dynamic', label: 'Dynamiczne', squeeze: [0.1, 0.18] },
];

const ORingGroovesPage = () => {
  const [cord, setCord] = usePersistedState<number>('oring-cord', 2.62);
  const [mode, setMode] = useQueryState<Mode>('mode', 'radial', ['radial', 'axial', 'dynamic'], 'oring-mode');
  const [activeDimension, setActiveDimension] = useState<ORingDimension>(null);

  const data = useMemo(() => {
    const m = modes.find((x) => x.id === mode) ?? modes[0];
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

  const Cell = ({ label, value, unit = 'mm', dimension }: { label: string; value: string; unit?: string; dimension?: ORingDimension }) => (
    <div tabIndex={dimension ? 0 : undefined} onFocus={() => dimension && setActiveDimension(dimension)} onBlur={() => setActiveDimension(null)} onClick={() => dimension && setActiveDimension(dimension)} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500/60">
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
          <Cell label="Głębokość t" value={data.t.toFixed(2)} dimension="t" />
          <Cell
            label="Zakres t"
            value={`${data.tMin.toFixed(2)}–${data.tMax.toFixed(2)}`}
          />
          <Cell label="Szerokość b (bez podparcia)" value={data.b0.toFixed(2)} dimension="b" />
          <Cell label="b — 1 pierścień podpierający" value={data.b1.toFixed(2)} />
          <Cell label="b — 2 pierścienie" value={data.b2.toFixed(2)} />
          <Cell label="Ścisk" value={`${data.squeezePct[0].toFixed(0)}–${data.squeezePct[1].toFixed(0)}`} unit="%" />
          <Cell label="Promień dna r₁" value={data.r1.toFixed(2)} dimension="r1" />
          <Cell label="Promień krawędzi r₂" value={data.r2.toFixed(2)} dimension="r2" />
          <Cell label="Skos montażowy 15°, dł." value={data.chamfer.toFixed(2)} />
          <Cell label="Wypełnienie rowka" value={data.fill.toFixed(0)} unit="%" />
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Schemat rowka</h2>
        <EngineeringDrawing label="ISO 3601 radial O-ring groove">
          {({ arrow, hatch }) => (
            <>
              <path d="M20 52 H100 L112 64 V116 Q112 124 120 124 H200 Q208 124 208 116 V60 Q208 52 216 52 H270 L300 34 V164 H20 Z" fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" strokeLinejoin="round" />
              <Centerline x1={160} y1={38} x2={160} y2={166} />
              <circle cx="160" cy="88" r="30" className="stroke-zinc-500 stroke-[1] fill-transparent" strokeDasharray="5 4" />
              <Witness x1={110} y1={126} x2={110} y2={154} /><Witness x1={210} y1={126} x2={210} y2={154} />
              <Dimension x1={114} y1={148} x2={206} y2={148} label="b" arrowId={arrow} active={activeDimension === 'b'} labelY={138} />
              <Witness x1={212} y1={52} x2={252} y2={52} /><Witness x1={210} y1={124} x2={252} y2={124} />
              <Dimension x1={244} y1={56} x2={244} y2={120} label="t" arrowId={arrow} active={activeDimension === 't'} labelX={257} labelY={88} rotateLabel />
              <Leader points="119,123 91,109 65,109" label="r₁" labelX={46} labelY={112} active={activeDimension === 'r1'} arrowId={arrow} />
              <Leader points="111,63 86,77 62,77" label="r₂" labelX={43} labelY={80} active={activeDimension === 'r2'} arrowId={arrow} />
              <line x1="270" y1="52" x2="270" y2="78" className="stroke-zinc-500 stroke-[1]" />
              <path d="M270 70 A18 18 0 0 1 275 69" className="stroke-cyan-400 stroke-[1.2]" />
              <Leader points="285,43 266,25 236,25" label="15°–20°" labelX={200} labelY={28} arrowId={arrow} />
            </>
          )}
        </EngineeringDrawing>
        <p className="text-xs text-zinc-600 mt-4">
          Wartości orientacyjne wg ISO 3601-2. Zalecane wypełnienie rowka 70–85 %.
        </p>
      </div>

      <div className="h-20" />
      <ClearFab onClear={() => { setCord(2.62); setMode('radial'); setActiveDimension(null); }} />
    </PageLayout>
  );
};

export default ORingGroovesPage;
