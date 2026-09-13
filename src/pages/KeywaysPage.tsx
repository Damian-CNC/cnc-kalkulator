import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { Centerline, Dimension, EngineeringDrawing, Leader, Witness } from '@/components/EngineeringDrawing';
import { findKeyway, keywayData, widthFits, widthLimits, type WidthFit } from '@/data/keywayData';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';

const fmt = (v: number, d = 2) => v.toFixed(d);
const sign = (v: number) => (v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3));
type KeywayDimension = 'd' | 'b' | 't1' | 't2' | null;

const KeywaysPage = () => {
  const [diameter, setDiameter] = useState('');
  const [fit, setFit] = useState<WidthFit['id']>('N9');
  const [activeDimension, setActiveDimension] = useState<KeywayDimension>(null);

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
                onFocus={(event) => { selectOnFocus(event); setActiveDimension('d'); }}
                onBlur={() => setActiveDimension(null)}
          value={diameter}
          onChange={(e) => { setActiveDimension('d'); setDiameter(sanitizeDecimal(e.target.value)); }}
          className="input-field mb-6"
        />

        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Pasowanie szerokości b
        </label>
        <div className="grid grid-cols-3 gap-2">
          {widthFits.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFit(f.id); setActiveDimension('b'); }}
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
            <div tabIndex={0} onFocus={() => setActiveDimension('b')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('b')} className="result-box text-2xl focus:outline-none focus:ring-1 focus:ring-cyan-500/60">
              {row.b} × {row.h} mm
            </div>
            <div className="mt-3 text-center text-sm text-zinc-400">
              {limits && <>Szerokość rowka {fit}: {row.b} mm ({sign(limits.upper)} / {sign(limits.lower)})</>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-module mb-0">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Wałek</h3>
              <div className="space-y-2 text-sm">
                <div tabIndex={0} onFocus={() => setActiveDimension('t1')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('t1')} className="flex justify-between rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/60">
                  <span className="text-zinc-500">Głębokość t₁</span>
                  <span className="text-cyan-400 font-bold">
                    {fmt(row.t1, 1)} <span className="text-zinc-500">+{row.t1Tol}</span>
                  </span>
                </div>
                <div tabIndex={0} onFocus={() => setActiveDimension('t2')} onBlur={() => setActiveDimension(null)} onClick={() => setActiveDimension('t2')} className="flex justify-between rounded focus:outline-none focus:ring-1 focus:ring-cyan-500/60">
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
            <EngineeringDrawing label="DIN 6885 keyway cross-section">
              {({ arrow, hatch }) => (
                <>
                  <path d="M132 31 V58 Q132 62 136 62 H184 Q188 62 188 58 V31 A65 65 0 1 1 132 31 Z" fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" strokeLinejoin="round" />
                  <Centerline x1={78} y1={90} x2={242} y2={90} /><Centerline x1={160} y1={10} x2={160} y2={170} />
                  <Witness x1={130} y1={29} x2={130} y2={13} /><Witness x1={190} y1={29} x2={190} y2={13} />
                  <Dimension x1={134} y1={17} x2={186} y2={17} label="b" arrowId={arrow} active={activeDimension === 'b'} labelY={8} />
                  <Witness x1={190} y1={29} x2={218} y2={29} /><Witness x1={190} y1={62} x2={218} y2={62} />
                  <Dimension x1={210} y1={33} x2={210} y2={58} label="t₁" arrowId={arrow} active={activeDimension === 't1'} labelX={223} labelY={46} rotateLabel />
                  <Witness x1={93} y1={25} x2={68} y2={25} /><Witness x1={95} y1={155} x2={68} y2={155} />
                  <Dimension x1={76} y1={29} x2={76} y2={151} label="d" arrowId={arrow} active={activeDimension === 'd'} labelX={63} labelY={90} rotateLabel />
                  <Witness x1={188} y1={62} x2={292} y2={62} /><Witness x1={160} y1={155} x2={292} y2={155} />
                  <Dimension x1={284} y1={66} x2={284} y2={151} label="d − t₁" arrowId={arrow} active={activeDimension === 't2'} labelX={299} labelY={109} rotateLabel />
                  <Leader points="136,61 112,76 91,76" label="r" labelX={79} labelY={79} arrowId={arrow} />
                  <Leader points="184,61 207,76 229,76" label="r" labelX={233} labelY={79} arrowId={arrow} />
                </>
              )}
            </EngineeringDrawing>
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
      <ClearFab onClear={() => { setDiameter(''); setFit('N9'); setActiveDimension(null); }} />
    </PageLayout>
  );
};

export default KeywaysPage;
