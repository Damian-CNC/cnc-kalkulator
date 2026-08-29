import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { din471, din472, it11, it13, type SegerRow } from '@/data/segerData';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';

const SegerGroovesPage = () => {
  const [type, setType] = useState<'shaft' | 'bore'>('shaft');
  const [query, setQuery] = useState('');

  const table = type === 'shaft' ? din471 : din472;
  const d1 = parseFloat(query.replace(',', '.'));

  const row: SegerRow | undefined = useMemo(
    () => (d1 > 0 ? table.find((r) => r.d1 === d1) : undefined),
    [table, d1],
  );

  const suggestions = useMemo(() => {
    if (!query.trim() || row) return [];
    return table.filter((r) => String(r.d1).startsWith(query.trim())).slice(0, 6);
  }, [table, query, row]);

  const notFound = query !== '' && !row && suggestions.length === 0;

  const tolD2 = row ? it11(row.d2) : 0;
  const tolM = row ? it13(row.m) : 0;

  return (
    <PageLayout title="Rowki Segera (DIN 471 / 472)">
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setType('shaft')}
            className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
              type === 'shaft'
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Wałek — DIN 471
          </button>
          <button
            onClick={() => setType('bore')}
            className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
              type === 'bore'
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Otwór — DIN 472
          </button>
        </div>

        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Średnica nominalna d₁ [mm]
        </label>
        <input
          type="text"
          inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
          value={query}
          onChange={(e) => setQuery(sanitizeDecimal(e.target.value))}
          className="input-field"
        />

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((s) => (
              <button
                key={s.d1}
                onClick={() => setQuery(String(s.d1))}
                className="px-3 py-2 rounded-lg text-sm border border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                Ø{s.d1}
              </button>
            ))}
          </div>
        )}

        {notFound && (
          <p className="mt-3 text-sm text-red-400">
            Brak wymiaru znormalizowanego w zakresie 8–100 mm.
          </p>
        )}
      </div>

      {row && (
        <>
          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wymiary rowka</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                  Dno rowka d₂ ({type === 'shaft' ? 'h11' : 'H11'})
                </div>
                <div className="text-2xl font-bold text-cyan-400">{row.d2.toFixed(2)}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {type === 'shaft'
                    ? `${(row.d2 - tolD2).toFixed(2)} … ${row.d2.toFixed(2)} mm`
                    : `${row.d2.toFixed(2)} … ${(row.d2 + tolD2).toFixed(2)} mm`}
                </div>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                  Szerokość m (H13)
                </div>
                <div className="text-2xl font-bold text-cyan-400">{row.m.toFixed(2)}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {row.m.toFixed(2)} … {(row.m + tolM).toFixed(2)} mm
                </div>
              </div>
            </div>
          </div>

          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
              Pierścień i wytrzymałość
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Grubość pierścienia s</span>
                <span className="text-cyan-400 font-bold">{row.s.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Min. odległość od krawędzi n</span>
                <span className="text-cyan-400 font-bold">{row.n.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Obciążenie rowka F_R (orient.)</span>
                <span className="text-cyan-400 font-bold">{row.fr.toFixed(1)} kN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Głębokość rowka</span>
                <span className="text-cyan-400 font-bold">
                  {(Math.abs(row.d1 - row.d2) / 2).toFixed(2)} mm
                </span>
              </div>
            </div>
          </div>

          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Przekrój</h2>
            <svg viewBox="0 0 300 150" className="w-full max-w-lg mx-auto">
              <line x1="20" y1="120" x2="280" y2="120" stroke="#3f3f46" strokeDasharray="6 4" />
              {type === 'shaft' ? (
                <>
                  <path
                    d="M20 60 H130 V78 H165 V60 H280"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                  />
                  <line x1="130" y1="40" x2="130" y2="78" stroke="#71717a" />
                  <line x1="165" y1="40" x2="165" y2="78" stroke="#71717a" />
                  <line x1="130" y1="44" x2="165" y2="44" stroke="#a1a1aa" />
                  <text x="140" y="38" fill="#22d3ee" fontSize="11">m</text>
                  <line x1="240" y1="60" x2="240" y2="120" stroke="#a1a1aa" />
                  <text x="246" y="94" fill="#a1a1aa" fontSize="11">d₁/2</text>
                  <line x1="200" y1="78" x2="200" y2="120" stroke="#a1a1aa" />
                  <text x="176" y="100" fill="#22d3ee" fontSize="11">d₂/2</text>
                </>
              ) : (
                <>
                  <path
                    d="M20 40 H130 V22 H165 V40 H280"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                  />
                  <line x1="130" y1="22" x2="130" y2="12" stroke="#71717a" />
                  <line x1="165" y1="22" x2="165" y2="12" stroke="#71717a" />
                  <text x="140" y="12" fill="#22d3ee" fontSize="11">m</text>
                  <line x1="240" y1="40" x2="240" y2="120" stroke="#a1a1aa" />
                  <text x="246" y="84" fill="#a1a1aa" fontSize="11">d₁/2</text>
                  <line x1="200" y1="22" x2="200" y2="120" stroke="#a1a1aa" />
                  <text x="172" y="72" fill="#22d3ee" fontSize="11">d₂/2</text>
                </>
              )}
              <text x="24" y="136" fill="#71717a" fontSize="10">oś obrotu</text>
            </svg>
          </div>
        </>
      )}

      <div className="h-20" />
      <ClearFab onClear={() => setQuery('')} />
    </PageLayout>
  );
};

export default SegerGroovesPage;
