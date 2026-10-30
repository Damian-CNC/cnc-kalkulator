import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Ruler, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import ClearFab from '@/components/ClearFab';
import useLength from '@/hooks/useLength';
import {
  BOLT_CLASSES,
  NUT_CLASSES,
  boltLimits,
  nutLimits,
  type BoltClass,
  type NutClass,
} from '@/lib/trapTolerance';
import { DiameterCard, PitchCard, DepthCard, DrillCard, AuxCard } from '@/components/ThreadResultCards';

const round = (v: number, n = 3) => Number.isFinite(v) ? Number(v.toFixed(n)) : null;

const getCrestClearance = (P: number): number => {
  if (P <= 1.5) return 0.15;
  if (P <= 5) return 0.25;
  if (P <= 12) return 0.5;
  return 1.0;
};

const TrapezoidalThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  const navigate = useNavigate();
  const [dInput, setDInput] = usePersistedState<string>('trap-d', '');
  const [pInput, setPInput] = usePersistedState<string>('trap-p', '');
  const L = useLength('mm');
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
    <PageLayout title="Gwinty Trapezowe (Tr)" backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
          <div className="lg:grid lg:grid-cols-[290px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
            {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
            <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    {t('threads.diameterD')}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    onFocus={selectOnFocus}
                    value={dInput}
                    placeholder="np. 20"
                    onChange={(e) => setDInput(sanitizeDecimal(e.target.value))}
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-base md:text-sm md:py-2 md:px-3 md:rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    {t('threads.pitch')}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    onFocus={selectOnFocus}
                    value={pInput}
                    placeholder="np. 4"
                    onChange={(e) => setPInput(sanitizeDecimal(e.target.value))}
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-base md:text-sm md:py-2 md:px-3 md:rounded-lg"
                  />
                </div>
              </div>

              {designation && nominal && (
                <>
                  <div className="text-center pt-1 border-t border-zinc-800/60">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                      {designation}
                    </span>
                    <p className="text-zinc-500 text-xs mt-1">{t('trapezoidal.crestClearance')} ac = {L.disp(nominal.ac as number)} {L.unit}</p>
                  </div>

                  <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                      🔩 {t('threads.bolt')}
                    </TabsTrigger>
                    <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                      🔧 {t('threads.nut')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Klasa tolerancji */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    {threadTab === 'external' ? (
                      <div>
                        <ClassPicker
                          title={t('trapezoidal.boltToleranceTitle')}
                          options={BOLT_CLASSES}
                          value={boltCls}
                          onChange={(v) => setBoltCls(v as BoltClass)}
                        />
                        {bolt && (
                          <p className="text-center text-xs font-semibold text-emerald-400 mt-2">
                            Tr {parsedD} × {parsedP} – {bolt.cls}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <ClassPicker
                          title={t('trapezoidal.nutToleranceTitle')}
                          options={NUT_CLASSES}
                          value={nutCls}
                          onChange={(v) => setNutCls(v as NutClass)}
                        />
                        {nut && (
                          <p className="text-center text-xs font-semibold text-emerald-400 mt-2">
                            Tr {parsedD} × {parsedP} – {nut.cls}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-zinc-500 text-[11px] text-center pt-2 border-t border-zinc-800/60 leading-relaxed">
                    Wymiary wg DIN 103 · Tolerancje wg ISO 2903
                  </p>
                </>
              )}

              <div className="pt-2 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => navigate('/kat-linii-srubowej')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 active:scale-98 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{t('threads.helixAndShim')}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Prawa kolumna: karty wyników */}
            <div className="min-w-0">
              {nominal ? (
                <>
                  <TabsContent value="external" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('threads.majorDiameterD')}
                        limits={bolt ? bolt.d : null}
                        unit="mm"
                        nominal={nominal.d as number}
                        tolClass={bolt ? boltCls : undefined}
                        digits={3}
                      />
                      <DiameterCard
                        label={t('threads.pitchDiameterD2')}
                        limits={bolt ? bolt.d2 : null}
                        unit="mm"
                        nominal={nominal.d2 as number}
                        tolClass={bolt ? boltCls : undefined}
                        digits={3}
                      />
                      <DiameterCard
                        label={t('threads.minorDiameterD3')}
                        limits={bolt ? bolt.d3 : null}
                        unit="mm"
                        nominal={nominal.d3 as number}
                        tolClass={bolt ? boltCls : undefined}
                        digits={3}
                      />
                      <PitchCard
                        label={t('threads.pitch')}
                        pitch={parsedP!}
                        unit="mm"
                        digits={3}
                      />
                      <div className="md:col-span-2">
                        <DepthCard
                          label={t('threads.threadDepthH3')}
                          depth={nominal.h3 as number}
                          unit="mm"
                          note="h3 = P/2 + ac"
                          digits={3}
                        />
                      </div>
                      {!bolt && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-zinc-500 text-center py-2 leading-relaxed">
                            {t('trapezoidal.standardRange')}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="internal" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('trapezoidal.majorDiaNut')}
                        limits={
                          nut
                            ? { max: Number((nominal.D4 as number).toFixed(3)), min: nut.D4min, tol: Number(((nominal.D4 as number) - nut.D4min).toFixed(3)) }
                            : null
                        }
                        unit="mm"
                        nominal={nominal.D4 as number}
                        tolClass={nut ? nutCls : undefined}
                        digits={3}
                        note="min wg normy"
                      />
                      <DiameterCard
                        label={t('threads.pitchDiameterInternal')}
                        limits={nut ? nut.D2 : null}
                        unit="mm"
                        nominal={nominal.d2 as number}
                        tolClass={nut ? nutCls : undefined}
                        digits={3}
                      />
                      <DiameterCard
                        label={t('threads.minorDiameterInternal')}
                        limits={nut ? nut.D1 : null}
                        unit="mm"
                        nominal={nominal.D1 as number}
                        tolClass={nut ? nutCls : undefined}
                        digits={3}
                      />
                      <PitchCard
                        label={t('threads.pitch')}
                        pitch={parsedP!}
                        unit="mm"
                        digits={3}
                      />
                      <DepthCard
                        label={t('threads.threadDepthH3')}
                        depth={nominal.h3 as number}
                        unit="mm"
                        note="h3 = P/2 + ac"
                        digits={3}
                      />
                      <DrillCard
                        label={t('trapezoidal.tapDrill')}
                        diameter={nominal.D1 as number}
                        unit="mm"
                        note={t('trapezoidal.tapDrillNote')}
                        digits={3}
                      />
                      {!nut && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-zinc-500 text-center py-2 leading-relaxed">
                            {t('trapezoidal.standardRange')}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </>
              ) : (
                <div className="text-center text-zinc-500 py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                  {t('trapezoidal.emptyPrompt')}
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
      <ClearFab onClear={() => { setDInput(''); setPInput(''); }} />
    </PageLayout>
  );
};

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

export default TrapezoidalThreadPage;
