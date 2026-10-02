import { useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import CopyableValue from '@/components/CopyableValue';
import ClearFab from '@/components/ClearFab';
import {
  BOLT_CLASSES,
  NUT_CLASSES,
  boltLimits,
  nutLimits,
  type BoltClass,
  type Limits,
  type NutClass,
} from '@/lib/trapTolerance';

const round = (v: number, n = 3) => Number.isFinite(v) ? Number(v.toFixed(n)) : null;

const getCrestClearance = (P: number): number => {
  if (P <= 1.5) return 0.15;
  if (P <= 5) return 0.25;
  if (P <= 12) return 0.5;
  return 1.0;
};

const TrapezoidalThreadPage = () => {
  const [dInput, setDInput] = usePersistedState<string>('trap-d', '');
  const [pInput, setPInput] = usePersistedState<string>('trap-p', '');
  const [boltCls, setBoltCls] = usePersistedState<BoltClass>('trap-bolt-class', '7e');
  const [nutCls, setNutCls] = usePersistedState<NutClass>('trap-nut-class', '7H');
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'trap-tab');

  const parsedD = useMemo(() => {
    const v = parseFloat(dInput.replace(',', '.'));
    return isNaN(v) || v <= 0 ? null : v;
  }, [dInput]);

  const parsedP = useMemo(() => {
    const v = parseFloat(pInput.replace(',', '.'));
    return isNaN(v) || v <= 0 ? null : v;
  }, [pInput]);

  const nominal = useMemo(() => {
    if (parsedD === null || parsedP === null) return null;
    const d = parsedD;
    const P = parsedP;
    const ac = getCrestClearance(P);
    const d2 = d - 0.5 * P;
    const d3 = d - P - 2 * ac;
    const D4 = d + 2 * ac;
    const D1 = d - P;
    const h3 = 0.5 * P + ac;
    return {
      ac: round(ac),
      d: round(d),
      d2: round(d2),
      d3: round(d3),
      D4: round(D4),
      D1: round(D1),
      h3: round(h3),
    };
  }, [parsedD, parsedP]);

  const bolt = useMemo(() => {
    if (!nominal || parsedD === null || parsedP === null) return null;
    return boltLimits(parsedD, parsedP, boltCls, {
      d: nominal.d as number,
      d2: nominal.d2 as number,
      d3: nominal.d3 as number,
    });
  }, [nominal, parsedD, parsedP, boltCls]);

  const nut = useMemo(() => {
    if (!nominal || parsedD === null || parsedP === null) return null;
    return nutLimits(parsedD, parsedP, nutCls, {
      D1: nominal.D1 as number,
      d2: nominal.d2 as number,
      D4: nominal.D4 as number,
    });
  }, [nominal, parsedD, parsedP, nutCls]);

  const designation = parsedD !== null && parsedP !== null ? `Tr ${parsedD} × ${parsedP}` : null;

  return (
    <PageLayout title="Gwinty Trapezowe (Tr)" backRoute="/gwinty">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              Średnica (d) mm
            </label>
            <input
              type="text"
              inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
              value={dInput}
              onChange={(e) => setDInput(sanitizeDecimal(e.target.value))}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              Skok (P) mm
            </label>
            <input
              type="text"
              inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
              value={pInput}
              onChange={(e) => setPInput(sanitizeDecimal(e.target.value))}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-lg"
            />
          </div>
        </div>

        {designation && nominal && (
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {designation}
            </span>
            <p className="text-zinc-500 text-xs mt-2">Luz wierzchołkowy ac = {nominal.ac} mm</p>
          </div>
        )}

        {nominal && (
          <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔩 Śruba (Czop)
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔧 Nakrętka (Otwór)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external">
              <div className="space-y-3 mt-3">
                <NominalCard label="Średnica zewnętrzna (d)" value={nominal.d} />
                <NominalCard label="Średnica podziałowa (d2)" value={nominal.d2} />
                <NominalCard label="Średnica rdzenia (d3)" value={nominal.d3} />
                <CamCard label="Wysokość profilu gwintu (h3)" value={nominal.h3} note="Głębokość nacinania" />

                <ClassPicker
                  title="Klasa tolerancji śruby"
                  options={BOLT_CLASSES}
                  value={boltCls}
                  onChange={(v) => setBoltCls(v as BoltClass)}
                />
                {bolt ? (
                  <div className="space-y-3">
                    <p className="text-center text-sm font-semibold text-emerald-400">
                      Tr {parsedD} × {parsedP} – {bolt.cls}
                    </p>
                    <LimitCard label="Średnica zewnętrzna (d)" lim={bolt.d} />
                    <LimitCard label="Średnica podziałowa (d2)" lim={bolt.d2} />
                    <LimitCard label="Średnica rdzenia (d3)" lim={bolt.d3} />
                  </div>
                ) : (
                  <ToleranceUnavailable />
                )}
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="space-y-3 mt-3">
                <NominalCard label="Średnica wewnętrzna (D1)" value={nominal.D1} />
                <NominalCard label="Średnica podziałowa (D2)" value={nominal.d2} />
                <NominalCard label="Średnica zewn. w bruzdach (D4)" value={nominal.D4} />
                <CamCard label="Wysokość profilu gwintu (H4)" value={nominal.h3} note="Głębokość nacinania" />
                <CamCard label="Średnica wiercenia" value={nominal.D1} note="Równa D1" />

                <ClassPicker
                  title="Klasa tolerancji nakrętki"
                  options={NUT_CLASSES}
                  value={nutCls}
                  onChange={(v) => setNutCls(v as NutClass)}
                />
                {nut ? (
                  <div className="space-y-3">
                    <p className="text-center text-sm font-semibold text-emerald-400">
                      Tr {parsedD} × {parsedP} – {nut.cls}
                    </p>
                    <LimitCard label="Średnica rdzenia (D1)" lim={nut.D1} />
                    <LimitCard label="Średnica podziałowa (D2)" lim={nut.D2} />
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                      <p className="text-zinc-400 text-sm font-medium mb-1">Średnica zewn. w bruzdach (D4)</p>
                      <p className="text-xl font-bold text-zinc-100">
                        min <CopyableValue value={nut.D4min}>{fmt3(nut.D4min)}</CopyableValue> mm
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">Norma nie podaje tolerancji D4</p>
                    </div>
                  </div>
                ) : (
                  <ToleranceUnavailable />
                )}
              </div>
            </TabsContent>

            <p className="text-zinc-600 text-xs text-center mt-4">
              Wymiary nominalne wg DIN 103 · tolerancje wg ISO 2903 · Profil symetryczny 30°
            </p>
            <p className="text-zinc-600 text-[11px] text-center mt-1 leading-relaxed">
              Tolerancje dla gwintów jednozwojnych, grupa długości zazwyczaj N (7H/7e). Przy gwincie
              wielokrotnym tolerancje średnicy podziałowej trzeba zwiększyć wg normy.
            </p>
          </Tabs>
        )}

        {(parsedD === null || parsedP === null) && (
          <p className="text-center text-zinc-500 py-10">
            Wpisz średnicę nominalną i skok, aby zobaczyć wymiary gwintu.
          </p>
        )}
      </div>
      <ClearFab onClear={() => { setDInput(''); setPInput(''); }} />
    </PageLayout>
  );
};

const fmt3 = (v: number) => v.toFixed(3);

function ClassPicker({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">{title}</p>
      <div className={`grid gap-2 ${options.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`py-3 rounded-xl font-bold text-sm transition-all border ${
              value === o
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function LimitCard({ label, lim }: { label: string; lim: Limits }) {
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-medium mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Max</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">
            <CopyableValue value={Number(fmt3(lim.max))}>{fmt3(lim.max)}</CopyableValue>
          </p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">Min</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">
            <CopyableValue value={Number(fmt3(lim.min))}>{fmt3(lim.min)}</CopyableValue>
          </p>
        </div>
      </div>
      <p className="text-emerald-700 text-xs mt-2">Tolerancja {fmt3(lim.tol)} mm</p>
    </div>
  );
}

function ToleranceUnavailable() {
  return (
    <p className="text-xs text-zinc-500 text-center py-3 leading-relaxed">
      Tolerancje ISO 2903 dotyczą średnic 5,6–355 mm i znormalizowanych skoków
      (1,5; 2; 3; 4; 5; 6; 7; 8; 9; 10; 12; 14; 16; 18; 20; 22; 24; 28; 32; 36; 40; 44 mm).
    </p>
  );
}

function NominalCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-zinc-100"><CopyableValue value={value}>{value ?? '—'}</CopyableValue> <span className="text-base text-zinc-500 font-normal">mm</span></p>
      <p className="text-zinc-600 text-xs mt-1">Wymiar nominalny</p>
    </div>
  );
}

function CamCard({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400"><CopyableValue value={value}>{value} mm</CopyableValue></p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

export default TrapezoidalThreadPage;
