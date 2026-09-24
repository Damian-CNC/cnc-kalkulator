import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calculateMetricThread } from '@/utils/threadMath';
import threadsData from '@/data/metric_threads.json';
import standardMetricPitches from '@/data/standardMetricPitches';
import PageLayout from '@/components/PageLayout';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import { useUnits, mmToIn } from '@/contexts/UnitContext';

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

type ToDisplay = (valMm: number) => string;

const MetricThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  const { isImperial, u } = useUnits();

  // Persisted state for diameter and pitch selection
  const [diameterInput, setDiameterInput] = usePersistedState<string>('cnc_metric_diameter', '10');
  const [pitchInput, setPitchInput] = usePersistedState<string>('cnc_metric_pitch', '1.5');

  // Tab state via query param (favorites deep-linking)
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const);

  const parsedD = useMemo(() => {
    const val = parseFloat(diameterInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [diameterInput]);

  // Unique diameters from JSON data, sorted ascending
  const availableDiameters = useMemo(() => {
    const set = new Set<number>();
    threads.forEach((entry) => set.add(entry.d));
    return Array.from(set).sort((a, b) => a - b);
  }, []);

  // Available pitches for selected diameter from JSON data
  const availablePitches = useMemo(() => {
    if (parsedD === null) return [];
    return threads
      .filter((entry) => entry.d === parsedD)
      .map((entry) => entry.P)
      .sort((a, b) => a - b);
  }, [parsedD]);

  // Coarse pitch from standardMetricPitches (last element = largest = coarse)
  const coarsePitch = useMemo(() => {
    if (parsedD === null) return null;
    const pitches = standardMetricPitches[String(parsedD)];
    return pitches ? pitches[pitches.length - 1] : null;
  }, [parsedD]);

  // Auto-adjust pitch when diameter changes and current pitch is unavailable
  useEffect(() => {
    if (parsedD !== null && availablePitches.length > 0) {
      const currentPitch = parseFloat(pitchInput.replace(',', '.'));
      if (!availablePitches.includes(currentPitch)) {
        const coarse = coarsePitch ?? availablePitches[availablePitches.length - 1];
        setPitchInput(String(coarse));
      }
    }
  }, [parsedD, availablePitches, coarsePitch, pitchInput, setPitchInput]);

  const effectivePitch = useMemo(() => {
    const val = parseFloat(pitchInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [pitchInput]);

  // Selected thread entry with tolerance data
  const selectedThread = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    return threads.find((entry) => entry.d === parsedD && entry.P === effectivePitch) || null;
  }, [parsedD, effectivePitch]);

  // Nominal dimensions from formulas
  const nominal = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    return calculateMetricThread(parsedD, effectivePitch);
  }, [parsedD, effectivePitch]);

  // Designation string
  const designation = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    if (selectedThread) return selectedThread.designation;
    return `M${parsedD}×${effectivePitch}`;
  }, [parsedD, effectivePitch, selectedThread]);

  // Unit-aware display: converts mm → inch when imperial
  const toDisplay: ToDisplay = (valMm: number) => {
    if (isImperial) {
      return `${mmToIn(valMm).toFixed(4)} ${u.length}`;
    }
    return `${valMm.toFixed(3)} ${u.length}`;
  };

  return (
    <PageLayout title={t('metric.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <Tabs value={threadTab} onValueChange={(v) => setThreadTab(v as 'external' | 'internal')} className="w-full">
          {/* Gender toggle */}
          <TabsList className="w-full bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="external" type="button" className="flex-1 touch-manipulation data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
              {t('metric.tabExternal')}
            </TabsTrigger>
            <TabsTrigger value="internal" type="button" className="flex-1 touch-manipulation data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
              {t('metric.tabInternal')}
            </TabsTrigger>
          </TabsList>

          {/* Form: diameter + pitch selects — always visible */}
          <Card className="bg-zinc-900/50 border-zinc-800 mt-3">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <Label className="text-xs font-semibold text-zinc-500 mb-2 tracking-wider">
                    {t('metric.diameterLabel')}
                  </Label>
                  <Select value={diameterInput} onValueChange={setDiameterInput}>
                    <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                      {availableDiameters.map((d) => (
                        <SelectItem key={d} value={String(d)} className="text-zinc-100 focus:bg-zinc-800">
                          M{d} ({d} mm)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col">
                  <Label className="text-xs font-semibold text-zinc-500 mb-2 tracking-wider">
                    {t('metric.pitchLabel')}
                  </Label>
                  <Select value={pitchInput} onValueChange={setPitchInput}>
                    <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                      {availablePitches.map((p) => (
                        <SelectItem key={p} value={String(p)} className="text-zinc-100 focus:bg-zinc-800">
                          {p} mm {p === coarsePitch ? t('metric.pitchCoarse') : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Designation badge */}
          {designation && (
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {designation}
              </span>
            </div>
          )}

          {/* Dimension results */}
          {nominal && (
            <>
              <TabsContent value="external" className="space-y-3 mt-0">
                <DimensionCard label={t('metric.extDiameter')} nominal={nominal.nominalDiameter} max={selectedThread?.external_6g.d_max ?? null} min={selectedThread?.external_6g.d_min ?? null} toDisplay={toDisplay} />
                <DimensionCard label={t('metric.extPitchDiameter')} nominal={nominal.pitchDiameter} max={selectedThread?.external_6g.d2_max ?? null} min={selectedThread?.external_6g.d2_min ?? null} toDisplay={toDisplay} />
                <DimensionCard label={t('metric.extCoreDiameter')} nominal={nominal.externalMinorDiameter} max={selectedThread?.external_6g.d3_max ?? null} min={selectedThread?.external_6g.d3_min ?? null} toDisplay={toDisplay} />
                <CamCard label={t('metric.extThreadHeight')} value={nominal.externalThreadHeight} note={t('metric.extThreadHeightNote')} toDisplay={toDisplay} />
              </TabsContent>

              <TabsContent value="internal" className="space-y-3 mt-0">
                <DimensionCard label={t('metric.intDiameter')} nominal={nominal.internalMinorDiameter} max={selectedThread?.internal_6H.D1_max ?? null} min={selectedThread?.internal_6H.D1_min ?? null} toDisplay={toDisplay} />
                <DimensionCard label={t('metric.intPitchDiameter')} nominal={nominal.pitchDiameter} max={selectedThread?.internal_6H.D2_max ?? null} min={selectedThread?.internal_6H.D2_min ?? null} toDisplay={toDisplay} />
                <DimensionCard label={t('metric.intExtDiameter')} nominal={null} max={selectedThread?.internal_6H.D_max ?? null} min={selectedThread?.internal_6H.D_min ?? null} toDisplay={toDisplay} />
                <DrillCard tapDrill={selectedThread?.internal_6H.tap_drill ?? nominal.tapDrillSize} formTapDrill={nominal.formTapDrillSize} toDisplay={toDisplay} />
                <CamCard label={t('metric.intProfileHeight')} value={nominal.internalThreadHeight} toDisplay={toDisplay} />
              </TabsContent>

              <p className="text-zinc-600 text-xs text-center mt-4">
                {selectedThread ? t('metric.footnoteWithData') : t('metric.footnoteNoData')}
              </p>
            </>
          )}
        </Tabs>

        {(parsedD === null || effectivePitch === null) && (
          <p className="text-center text-zinc-500 py-10">{t('metric.emptyMessage')}</p>
        )}
      </div>
    </PageLayout>
  );
};

/* ---- Sub-components ---- */

function DimensionCard({
  label,
  nominal,
  max,
  min,
  toDisplay,
}: {
  label: string;
  nominal: number | null;
  max: number | null;
  min: number | null;
  toDisplay: ToDisplay;
}) {
  const { t } = useTranslation('threadsCalc');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      {nominal !== null && (
        <p className="text-zinc-500 text-xs mb-2">
          {t('metric.nominalLabel', { defaultValue: 'Nominalna' })}: {toDisplay(nominal)}
        </p>
      )}
      {(max !== null || min !== null) ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Max</span>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              {max !== null ? toDisplay(max) : '—'}
            </p>
          </div>
          <div className="text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Min</span>
            <p className="text-xl md:text-2xl font-bold text-amber-400">
              {min !== null ? toDisplay(min) : '—'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-zinc-600 text-xs italic">{t('metric.footnoteNoData')}</p>
      )}
    </div>
  );
}

function DrillCard({
  tapDrill,
  formTapDrill,
  toDisplay,
}: {
  tapDrill: number;
  formTapDrill: number;
  toDisplay: ToDisplay;
}) {
  const { t } = useTranslation('threadsCalc');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-3">{t('metric.tapDrills', { defaultValue: 'Wiertła' })}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500">{t('metric.tapDrillLabel', { defaultValue: 'Gwintownik' })}</span>
          <p className="text-xl md:text-2xl font-bold text-cyan-400">{toDisplay(tapDrill)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500">{t('metric.formTapDrillLabel', { defaultValue: 'Wygniatak' })}</span>
          <p className="text-xl md:text-2xl font-bold text-violet-400">{toDisplay(formTapDrill)}</p>
        </div>
      </div>
    </div>
  );
}

function CamCard({
  label,
  value,
  note,
  toDisplay,
}: {
  label: string;
  value: number;
  note?: string;
  toDisplay: ToDisplay;
}) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{toDisplay(value)}</p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

export default MetricThreadPage;
