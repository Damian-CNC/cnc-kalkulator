import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';
import { Centerline, Dimension, EngineeringDrawing, Witness } from '@/components/EngineeringDrawing';
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
                  <path d="M56 84 A68 68 0 1 0 192 84 A68 68 0 0 0 56 84 Z M105 22 V49 H143 V22" fill={`url(#${hatch})`} fillRule="evenodd" className="stroke-zinc-200 stroke-[2]" strokeLinejoin="round" />
                  <Centerline x1={44} y1={84} x2={204} y2={84} /><Centerline x1={124} y1={8} x2={124} y2={160} />
                  <Witness x1={103} y1={20} x2={103} y2={8} /><Witness x1={145} y1={20} x2={145} y2={8} />
                  <Dimension x1={107} y1={12} x2={141} y2={12} label="b" arrowId={arrow} active={activeDimension === 'b'} labelY={5} />
                  <Witness x1={145} y1={22} x2={174} y2={22} /><Witness x1={145} y1={49} x2={174} y2={49} />
                  <Dimension x1={166} y1={26} x2={166} y2={45} label="t₁" arrowId={arrow} active={activeDimension === 't1'} labelX={180} labelY={36} rotateLabel />
                  <Witness x1={56} y1={82} x2={30} y2={82} /><Witness x1={56} y1={152} x2={30} y2={152} />
                  <Dimension x1={38} y1={86} x2={38} y2={148} label="d" arrowId={arrow} active={activeDimension === 'd'} labelX={25} labelY={117} rotateLabel />
                  <path d="M226 40 H300 V136 H226 V110 Q263 74 300 110 V40 Z M248 78 V98 H278 V78" fill={`url(#${hatch})`} fillRule="evenodd" className="stroke-zinc-200 stroke-[2]" />
                  <Witness x1={246} y1={76} x2={246} y2={60} /><Witness x1={280} y1={76} x2={280} y2={60} />
                  <Dimension x1={250} y1={64} x2={276} y2={64} label="b" arrowId={arrow} active={activeDimension === 'b'} labelY={53} />
                  <Witness x1={280} y1={78} x2={308} y2={78} /><Witness x1={280} y1={98} x2={308} y2={98} />
                  <Dimension x1={302} y1={82} x2={302} y2={94} label="t₂" arrowId={arrow} active={activeDimension === 't2'} labelX={291} labelY={88} rotateLabel />
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
