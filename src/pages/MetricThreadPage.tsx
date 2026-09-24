import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { calculateMetricThread } from '@/utils/threadMath';
import threadsData from '@/data/metric_threads.json';
import standardMetricPitches from '@/data/standardMetricPitches';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import PageLayout from '@/components/PageLayout';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';

interface ThreadEntry {
  designation: string;
  d: number;
  P: number;
  external_6g: {
    d_max: number; d_min: number;
    d2_max: number; d2_min: number;
    d3_max: number; d3_min: number;
  };
  internal_6H: {
    D1_min: number; D1_max: number;
    D2_min: number; D2_max: number;
    D_min: number; D_max: number;
    tap_drill: number;
  };
}

const threads = threadsData as ThreadEntry[];

type ThreadTab = 'external' | 'internal';

interface SavedMetricState {
  diameter: string;
  pitch: string;
  manualPitch: string;
  tab: ThreadTab;
}

const INITIAL_STATE: SavedMetricState = {
  diameter: '',
  pitch: '',
  manualPitch: '',
  tab: 'external',
};

const MetricThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  // Ostatnio wybrany gwint jest zapamiętany (localStorage) i wraca po powrocie do zakładki
  const [saved, setSaved] = usePersistedState<SavedMetricState>('metric-thread', INITIAL_STATE);
  const diameterInput = saved.diameter;
  const selectedP = saved.pitch;
  const manualPitch = saved.manualPitch;

  const setDiameterInput = (v: string) => setSaved((s) => ({ ...s, diameter: v }));
  const setSelectedP = (v: string) => setSaved((s) => ({ ...s, pitch: v }));
  const setManualPitch = (v: string) => setSaved((s) => ({ ...s, manualPitch: v }));

  const [initialTab] = useState<ThreadTab>(() => (saved.tab === 'internal' ? 'internal' : 'external'));
  const [threadTab, setThreadTab] = useQueryState<ThreadTab>('tab', initialTab, ['external', 'internal']);

  useEffect(() => {
    setSaved((s) => (s.tab === threadTab ? s : { ...s, tab: threadTab }));
  }, [threadTab, setSaved]);

  const parsedD = useMemo(() => {
    const val = parseFloat(diameterInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [diameterInput]);

  const isStandardDiameter = useMemo(() => {
    if (parsedD === null) return false;
    return String(parsedD) in standardMetricPitches;
  }, [parsedD]);

  const availablePitches = useMemo(() => {
    if (parsedD === null || !isStandardDiameter) return [];
    return standardMetricPitches[String(parsedD)] || [];
  }, [parsedD, isStandardDiameter]);

  // Przy zmianie średnicy wybieramy skok zgrubny. Przy powrocie do zakładki
  // (średnica bez zmian) zostaje zapamiętany skok, o ile jest poprawny.
  const prevDiameter = useRef<number | null>(parsedD);

  useEffect(() => {
    if (isStandardDiameter && availablePitches.length > 0) {
      const coarse = String(availablePitches[availablePitches.length - 1]);
      const diameterChanged = prevDiameter.current !== parsedD;
      prevDiameter.current = parsedD;
      const stillValid = availablePitches.some((p) => String(p) === selectedP);

      if (diameterChanged || !stillValid) {
        setSaved((s) => ({
          ...s,
          pitch: coarse,
          manualPitch: diameterChanged ? '' : s.manualPitch,
        }));
      }
    } else {
      prevDiameter.current = parsedD;
      if (selectedP !== '') setSaved((s) => ({ ...s, pitch: '' }));
    }
  }, [parsedD, isStandardDiameter, availablePitches, selectedP, setSaved]);

  const effectivePitch = useMemo(() => {
    if (isStandardDiameter) return selectedP ? parseFloat(selectedP) : null;
    const val = parseFloat(manualPitch.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [isStandardDiameter, selectedP, manualPitch]);

  const selectedThread = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    return threads.find((t) => t.d === parsedD && t.P === effectivePitch) || null;
  }, [parsedD, effectivePitch]);

  const nominal = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    return calculateMetricThread(parsedD, effectivePitch);
  }, [parsedD, effectivePitch]);

  const designation = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    if (selectedThread) return selectedThread.designation;
    return `M${parsedD}×${effectivePitch}`;
  }, [parsedD, effectivePitch, selectedThread]);

  return (
    <PageLayout title={t('metric.title')} backRoute="/gwinty">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">{t('metric.diameterLabel')}</label>
              <input
                type="text"
                inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
                placeholder={t('metric.diameterPlaceholder')}
                value={diameterInput}
                onChange={(e) => setDiameterInput(sanitizeDecimal(e.target.value))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-lg"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                {t('metric.pitchLabel')} {!isStandardDiameter && parsedD !== null && <span className="text-amber-400 text-[10px] normal-case">{t('metric.pitchSpecial')}</span>}
              </label>
              {isStandardDiameter ? (
                <Select value={selectedP} onValueChange={setSelectedP}>
                  <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
                    <SelectValue placeholder={t('metric.pitchPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                    {availablePitches.map((p) => (
                      <SelectItem key={p} value={String(p)} className="text-zinc-100 focus:bg-zinc-800">
                        {p} mm {p === availablePitches[availablePitches.length - 1] ? t('metric.pitchCoarse') : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  type="text"
                  inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
                  placeholder={t('metric.pitchManualPlaceholder')}
                  value={manualPitch}
                  onChange={(e) => setManualPitch(sanitizeDecimal(e.target.value))}
                  disabled={parsedD === null}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {designation && (
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {designation}
              </span>
            </div>
          )}

          {nominal && (
            <Tabs value={threadTab} onValueChange={(v) => setThreadTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="external" type="button" className="flex-1 touch-manipulation data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                  {t('metric.tabExternal')}
                </TabsTrigger>
                <TabsTrigger value="internal" type="button" className="flex-1 touch-manipulation data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                  {t('metric.tabInternal')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <DimensionCard label={t('metric.extDiameter')} nominal={nominal.nominalDiameter} max={selectedThread?.external_6g.d_max ?? null} min={selectedThread?.external_6g.d_min ?? null} />
                  <DimensionCard label={t('metric.extPitchDiameter')} nominal={nominal.pitchDiameter} max={selectedThread?.external_6g.d2_max ?? null} min={selectedThread?.external_6g.d2_min ?? null} />
                  <DimensionCard label={t('metric.extCoreDiameter')} nominal={nominal.externalMinorDiameter} max={selectedThread?.external_6g.d3_max ?? null} min={selectedThread?.external_6g.d3_min ?? null} />
                  <CamCard label={t('metric.extThreadHeight')} value={nominal.externalThreadHeight} note={t('metric.extThreadHeightNote')} />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <DimensionCard label={t('metric.intDiameter')} nominal={nominal.internalMinorDiameter} max={selectedThread?.internal_6H.D1_max ?? null} min={selectedThread?.internal_6H.D1_min ?? null} />
                  <DimensionCard label={t('metric.intPitchDiameter')} nominal={nominal.pitchDiameter} max={selectedThread?.internal_6H.D2_max ?? null} min={selectedThread?.internal_6H.D2_min ?? null} />
                  <DimensionCard label={t('metric.intExtDiameter')} nominal={null} max={selectedThread?.internal_6H.D_max ?? null} min={selectedThread?.internal_6H.D_min ?? null} />
                  <DrillCard tapDrill={selectedThread?.internal_6H.tap_drill ?? nominal.tapDrillSize} formTapDrill={nominal.formTapDrillSize} />
                  <CamCard label={t('metric.intProfileHeight')} value={nominal.internalThreadHeight} />
                </div>
              </TabsContent>

              <p className="text-zinc-600 text-xs text-center mt-4">
                {selectedThread
                  ? t('metric.footnoteWithData')
                  : t('metric.footnoteNoData')}
              </p>
            </Tabs>
          )}

          {(parsedD === null || effectivePitch === null) && (
            <p className="text-center text-zinc-500 py-10">{t('metric.emptyMessage')}</p>
          )}
        </div>
    </PageLayout>
  );
};

/* ---- Sub-components ---- */

function DimensionCard({ label, nominal, max, min }: { label: string; nominal: number | null; max: number | null; min: number | null }) {
  const { t } = useTranslation('threadsCalc');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      {nominal !== null && <p className="text-zinc-500 text-xs mb-2">{t('bsp.nominal', { value: nominal })}</p>}
      {(max !== null || min !== null) ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('metric.max', { defaultValue: 'Max' })}</span>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">{max ?? '—'}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t('metric.min', { defaultValue: 'Min' })}</span>
            <p className="text-xl md:text-2xl font-bold text-amber-400">{min ?? '—'}</p>
          </div>
        </div>
      ) : (
        <p className="text-zinc-600 text-xs italic">{t('metric.footnoteNoData')}</p>
      )}
    </div>
  );
}

function DrillCard({ tapDrill, formTapDrill }: { tapDrill: number; formTapDrill: number }) {
  const { t } = useTranslation('threadsCalc');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-3">{t('metric.tapDrills', { defaultValue: 'Wiertła' })}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500">{t('metric.tapDrillLabel', { defaultValue: 'Gwintownik' })}</span>
          <p className="text-xl md:text-2xl font-bold text-cyan-400">{tapDrill} mm</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500">{t('metric.formTapDrillLabel', { defaultValue: 'Wygniatak' })}</span>
          <p className="text-xl md:text-2xl font-bold text-violet-400">{formTapDrill} mm</p>
        </div>
      </div>
    </div>
  );
}

function CamCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{value} mm</p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

export default MetricThreadPage;
