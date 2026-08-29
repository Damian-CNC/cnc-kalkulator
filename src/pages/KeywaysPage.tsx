import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { findKeyway, keywayData, widthFits, widthLimits, type WidthFit } from '@/data/keywayData';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';

const fmt = (v: number, d = 2) => v.toFixed(d);
const sign = (v: number) => (v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3));

const KeywaysPage = () => {
  const [diameter, setDiameter] = useState('');
  const [fit, setFit] = useState<WidthFit['id']>('N9');

  const d = parseFloat(diameter.replace(',', '.'));
  const row = useMemo(() => (d > 0 ? findKeyway(d) : undefined), [d]);
  const limits = row ? widthLimits(row.b, fit) : null;

  const outOfRange = diameter !== '' && (!d || d <= 0 || !row);

  return (
    <PageLayout title="Wpusty pryzmowe (DIN 6885)">
      <div className="glass-module">
        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Średnica wału / otworu d [mm]
        </label>
        <input
          type="text"
          inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
          value={diameter}
          onChange={(e) => setDiameter(sanitizeDecimal(e.target.value))}
          className="input-field mb-6"
        />

        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Pasowanie szerokości b
        </label>
        <div className="grid grid-cols-3 gap-2">
          {widthFits.map((f) => (
            <button
              key={f.id}
              onClick={() => setFit(f.id)}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                fit === f.id
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div>{f.label}</div>
              <div className="text-[10px] font-normal text-zinc-500">{f.desc}</div>
            </button>
          ))}
        </div>

        {outOfRange && (
          <p className="mt-4 text-sm text-red-400">
            Brak danych dla tej średnicy. Zakres normy w module: 6–75 mm.
          </p>
        )}
      </div>

      {row && (
        <>
          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wpust b × h</h2>
            <div className="result-box text-2xl">
              {row.b} × {row.h} mm
            </div>
            <div className="mt-3 text-center text-sm text-zinc-400">
              Szerokość rowka {fit}: {row.b} mm ({sign(limits!.upper)} / {sign(limits!.lower)})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-module mb-0">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Wałek</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Głębokość t₁</span>
                  <span className="text-cyan-400 font-bold">
                    {fmt(row.t1, 1)} <span className="text-zinc-500">+{row.t1Tol}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Wymiar kontrolny d − t₁</span>
                  <span className="text-cyan-400 font-bold">{fmt(d - row.t1)} mm</span>
                </div>
              </div>
            </div>

            <div className="glass-module mb-0">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Piasta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Głębokość t₂</span>
                  <span className="text-cyan-400 font-bold">
                    {fmt(row.t2, 1)} <span className="text-zinc-500">+{row.t2Tol}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Wymiar kontrolny d + t₂</span>
                  <span className="text-cyan-400 font-bold">{fmt(d + row.t2)} mm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-module mt-4">
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Schemat</h3>
            <svg viewBox="0 0 240 160" className="w-full max-w-md mx-auto">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#3f3f46" strokeWidth="2" />
              <rect x="66" y="18" width="28" height="16" fill="#09090b" stroke="#22d3ee" strokeWidth="2" />
              <line x1="80" y1="20" x2="80" y2="140" stroke="#3f3f46" strokeDasharray="4 4" />
              <line x1="120" y1="20" x2="150" y2="20" stroke="#71717a" />
              <line x1="120" y1="34" x2="150" y2="34" stroke="#71717a" />
              <text x="154" y="31" fill="#22d3ee" fontSize="10">t₁</text>
              <text x="60" y="12" fill="#22d3ee" fontSize="10">b</text>
              <text x="96" y="86" fill="#a1a1aa" fontSize="10">d</text>

              <rect x="150" y="30" width="80" height="100" fill="none" stroke="#3f3f46" strokeWidth="2" />
              <path d="M160 80 A30 30 0 0 1 220 80" fill="none" stroke="#3f3f46" strokeWidth="2" />
              <rect x="176" y="44" width="28" height="14" fill="#09090b" stroke="#22d3ee" strokeWidth="2" />
              <text x="206" y="54" fill="#22d3ee" fontSize="10">t₂</text>
              <text x="168" y="146" fill="#a1a1aa" fontSize="10">piasta</text>
            </svg>
          </div>
        </>
      )}

      <div className="glass-module mt-4">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Tabela DIN 6885</h2>
        <div className="overflow-x-auto cv-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase">
                <th className="text-left py-2">d [mm]</th>
                <th className="text-right">b × h</th>
                <th className="text-right">t₁</th>
                <th className="text-right">t₂</th>
              </tr>
            </thead>
            <tbody>
              {keywayData.map((r) => (
                <tr
                  key={r.b + '-' + r.dMin}
                  className={`border-t border-zinc-800/70 ${
                    row === r ? 'text-cyan-400' : 'text-zinc-300'
                  }`}
                >
                  <td className="py-2">&gt;{r.dMin}–{r.dMax}</td>
                  <td className="text-right">{r.b} × {r.h}</td>
                  <td className="text-right">{r.t1.toFixed(1)}</td>
                  <td className="text-right">{r.t2.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-20" />
      <ClearFab onClear={() => { setDiameter(''); setFit('N9'); }} />
    </PageLayout>
  );
};

export default KeywaysPage;
