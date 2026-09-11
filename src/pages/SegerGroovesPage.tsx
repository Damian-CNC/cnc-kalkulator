import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { Centerline, Dimension, EngineeringDrawing, Witness } from '@/components/EngineeringDrawing';
import { din471, din472, it11, it13, type SegerRow } from '@/data/segerData';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';

type SegerDimension = 'd1' | 'd2' | 'm' | 'n' | null;

const SegerGroovesPage = () => {
  const [type, setType] = useState<'shaft' | 'bore'>('shaft');
  const [query, setQuery] = useState('');
  const [activeDimension, setActiveDimension] = useState<SegerDimension>(null);

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
                onFocus={(event) => { selectOnFocus(event); setActiveDimension('d1'); }}
                onBlur={() => setActiveDimension(null)}
          value={query}
          onChange={(e) => { setActiveDimension('d1'); setQuery(sanitizeDecimal(e.target.value)); }}
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
              <div tabIndex={0} onFocus={() => setActiveDimension('d2')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('d2')} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500/60">
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
              <div tabIndex={0} onFocus={() => setActiveDimension('m')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('m')} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 focus:outline-none focus:border-cyan-500/60">
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
              <div tabIndex={0} onFocus={() => setActiveDimension('n')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('n')} className="flex justify-between rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/60">
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
            <EngineeringDrawing label={type === 'shaft' ? 'DIN 471 shaft groove' : 'DIN 472 bore groove'}>
              {({ arrow, hatch }) => type === 'shaft' ? (
                <>
                  <path d="M24 48 H206 V62 H230 V48 H296 V132 H230 V118 H206 V132 H24 Z" fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" />
                  <Centerline x1={16} y1={90} x2={304} y2={90} />
                  <Witness x1={294} y1={46} x2={310} y2={46} /><Witness x1={294} y1={134} x2={310} y2={134} />
                  <Dimension x1={304} y1={50} x2={304} y2={130} label="d₁" arrowId={arrow} active={activeDimension === 'd1'} labelX={292} labelY={90} rotateLabel />
                  <Witness x1={228} y1={60} x2={274} y2={60} /><Witness x1={228} y1={120} x2={274} y2={120} />
                  <Dimension x1={266} y1={64} x2={266} y2={116} label="d₂" arrowId={arrow} active={activeDimension === 'd2'} labelX={254} labelY={90} rotateLabel />
                  <Witness x1={204} y1={46} x2={204} y2={25} /><Witness x1={232} y1={46} x2={232} y2={25} />
                  <Dimension x1={208} y1={30} x2={228} y2={30} label="m" arrowId={arrow} active={activeDimension === 'm'} labelY={17} />
                  <Witness x1={232} y1={44} x2={232} y2={10} /><Witness x1={294} y1={44} x2={294} y2={10} />
                  <Dimension x1={236} y1={14} x2={290} y2={14} label="n" arrowId={arrow} active={activeDimension === 'n'} labelY={6} />
                </>
              ) : (
                <>
                  <path d="M24 24 H296 V58 H222 V72 H198 V58 H24 Z M24 122 H198 V108 H222 V122 H296 V156 H24 Z" fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" />
                  <Centerline x1={16} y1={90} x2={304} y2={90} />
                  <Witness x1={292} y1={56} x2={310} y2={56} /><Witness x1={292} y1={124} x2={310} y2={124} />
                  <Dimension x1={304} y1={60} x2={304} y2={120} label="d₁" arrowId={arrow} active={activeDimension === 'd1'} labelX={292} labelY={90} rotateLabel />
                  <Witness x1={220} y1={70} x2={276} y2={70} /><Witness x1={220} y1={110} x2={276} y2={110} />
                  <Dimension x1={268} y1={74} x2={268} y2={106} label="d₂" arrowId={arrow} active={activeDimension === 'd2'} labelX={256} labelY={90} rotateLabel />
                  <Witness x1={196} y1={56} x2={196} y2={38} /><Witness x1={224} y1={56} x2={224} y2={38} />
                  <Dimension x1={200} y1={42} x2={220} y2={42} label="m" arrowId={arrow} active={activeDimension === 'm'} labelY={30} />
                </>
              )}
            </EngineeringDrawing>
          </div>
        </>
      )}

      <div className="h-20" />
      <ClearFab onClear={() => { setQuery(''); setActiveDimension(null); }} />
    </PageLayout>
  );
};

export default SegerGroovesPage;
