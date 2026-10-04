import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import {
  EXT_CLASSES,
  INT_CLASSES,
  MM,
  UN_SIZES,
  calcUn,
  sizesForSeries,
  type ExtClass,
  type IntClass,
  type Range,
  type UnSeries,
} from '@/lib/unThread';

const SERIES: UnSeries[] = ['UNC', 'UNF', 'UNEF'];

type State = { series: UnSeries; size: string; extCls: ExtClass; intCls: IntClass };
const INITIAL: State = { series: 'UNC', size: '1/4', extCls: '2A', intCls: '2B' };

const inch = (v: number, d = 4) => v.toFixed(d);
const mm = (v: number, d = 3) => (v * MM).toFixed(d);

const UnThreadPage = () => {
  const { t } = useTranslation('tools');
  const [s, setS, reset] = usePersistedState<State>('un-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'un-tab');

  const sizes = useMemo(() => sizesForSeries(s.series), [s.series]);
  const size = sizes.find((z) => z.id === s.size) ?? sizes[0];

  const res = useMemo(
    () => (size ? calcUn(size, s.series, s.extCls, s.intCls) : null),
    [size, s.series, s.extCls, s.intCls],
  );

  return (
    <PageLayout title={t('un.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={t('un.series')}
            value={s.series}
            onChange={(e) => {
              const series = e.target.value as UnSeries;
              const list = sizesForSeries(series);
              setS((p) => ({
                ...p,
                series,
                size: list.some((z) => z.id === p.size) ? p.size : list[0].id,
              }));
            }}
            options={SERIES.map((x) => ({ value: x, label: t(`un.seriesNames.${x}`) }))}
          />
          <SelectField
            label={t('un.size')}
            value={size?.id ?? ''}
            onChange={(e) => setS((p) => ({ ...p, size: e.target.value }))}
            options={sizes.map((z) => ({
              value: z.id,
              label: `${z.id.startsWith('#') ? z.id : `${z.id}″`}-${z.tpi[s.series]}`,
            }))}
          />
        </div>

        {res && (
          <>
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {res.designation}
              </span>
              <p className="text-zinc-500 text-xs mt-2">
                {t('un.basicInfo', {
                  d: inch(res.D),
                  dmm: mm(res.D, 2),
                  p: inch(res.P, 4),
                  pmm: mm(res.P, 3),
                })}
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔩 {t('un.bolt')}
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔧 {t('un.nut')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <ClassPicker
                    title={t('un.classBolt')}
                    options={EXT_CLASSES}
                    value={s.extCls}
                    onChange={(v) => setS((p) => ({ ...p, extCls: v as ExtClass }))}
                  />
                  <LimitCard label={t('un.major')} lim={res.ext.major} />
                  <LimitCard label={t('un.pitch')} lim={res.ext.pitch} />
                  <ValueCard
                    label={t('un.minorRef')}
                    inches={res.ext.minorRef}
                    note={t('un.minorRefNote')}
                  />
                  <CamCard
                    label={t('un.depthExt')}
                    inches={res.depthExt}
                    note={`${t('un.depthNote')} · ${t('un.depthExtNote')}`}
                  />
                  {res.ext.allowance > 0 && (
                    <p className="text-xs text-zinc-500 text-center">
                      {t('un.allowance', { a: inch(res.ext.allowance), amm: mm(res.ext.allowance, 3) })}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <ClassPicker
                    title={t('un.classNut')}
                    options={INT_CLASSES}
                    value={s.intCls}
                    onChange={(v) => setS((p) => ({ ...p, intCls: v as IntClass }))}
                  />
                  <LimitCard
                    label={t('un.minorNut')}
                    lim={
                      res.int.minor.max !== null
                        ? { max: res.int.minor.max, min: res.int.minor.min, tol: res.int.minor.tol ?? 0 }
                        : null
                    }
                    fallback={res.int.minor.min}
                    fallbackNote={t('un.minorNoMax')}
                    digits={3}
                  />
                  <LimitCard label={t('un.pitchNut')} lim={res.int.pitch} />
                  <ValueCard label={t('un.majorNut')} inches={res.int.majorMin} prefix="min" />
                  <CamCard
                    label={t('un.depthInt')}
                    inches={res.depthInt}
                    note={t('un.depthNote')}
                  />
                  <DrillCard
                    label={t('un.drill')}
                    min={res.int.minor.min}
                    max={res.int.minor.max}
                    note={t('un.drillNote')}
                  />
                </div>
              </TabsContent>

              <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('un.footer')}</p>
            </Tabs>
          </>
        )}
      </div>
      <ClearFab onClear={reset} />
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
    <div>
      <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">{title}</p>
      <div className="grid grid-cols-3 gap-2">
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

function LimitCard({
  label,
  lim,
  fallback,
  fallbackNote,
  digits = 4,
}: {
  label: string;
  lim: Range | null;
  fallback?: number;
  fallbackNote?: string;
  digits?: number;
}) {
  const { t } = useTranslation('tools');
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-medium mb-2">{label}</p>
      {lim ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(['max', 'min'] as const).map((k) => (
              <div key={k}>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">{k}</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-400">
                  <CopyableValue value={lim[k]}>{inch(lim[k], digits)}</CopyableValue>
                  <span className="text-xs text-zinc-500 font-normal ml-1">in</span>
                </p>
                <p className="text-xs text-zinc-500">{mm(lim[k])} mm</p>
              </div>
            ))}
          </div>
          <p className="text-emerald-700 text-xs mt-2">
            {t('un.tolerance')} {inch(lim.tol, digits)} in · {mm(lim.tol)} mm
          </p>
        </>
      ) : (
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">min</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">
            {fallback !== undefined ? inch(fallback, digits) : '—'}
            <span className="text-xs text-zinc-500 font-normal ml-1">in</span>
          </p>
          <p className="text-xs text-zinc-500">{fallback !== undefined ? mm(fallback) : ''} mm</p>
          {fallbackNote && <p className="text-amber-500/80 text-xs mt-2">{fallbackNote}</p>}
        </div>
      )}
    </div>
  );
}

function ValueCard({
  label,
  inches,
  note,
  prefix,
}: {
  label: string;
  inches: number;
  note?: string;
  prefix?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-100">
        {prefix ? `${prefix} ` : ''}
        <CopyableValue value={inches}>{inch(inches)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">in</span>
        <span className="text-sm text-zinc-500 font-normal ml-3">{mm(inches)} mm</span>
      </p>
      {note && <p className="text-zinc-600 text-xs mt-1">{note}</p>}
    </div>
  );
}

function CamCard({ label, inches, note }: { label: string; inches: number; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={inches}>{inch(inches)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">in</span>
      </p>
      <p className="text-cyan-500 text-sm">{mm(inches)} mm</p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

function DrillCard({
  label,
  min,
  max,
  note,
}: {
  label: string;
  min: number;
  max: number | null;
  note: string;
}) {
  const mid = max !== null ? (min + max) / 2 : min;
  // najbliższe wiertło metryczne co 0,1 mm mieszczące się w tolerancji
  let metric: number | null = null;
  if (max !== null) {
    for (let d = Math.ceil(min * MM * 10) / 10; d <= max * MM + 1e-9; d += 0.1) {
      if (metric === null || Math.abs(d - mid * MM) < Math.abs(metric - mid * MM)) metric = Math.round(d * 10) / 10;
    }
  }
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={Number(mid.toFixed(3))}>{mid.toFixed(3)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">in</span>
      </p>
      <p className="text-cyan-500 text-sm">
        {(mid * MM).toFixed(2)} mm
        {metric !== null && ` · Ø${metric.toFixed(1)} mm`}
      </p>
      <p className="text-cyan-600 text-xs mt-1.5">({note})</p>
    </div>
  );
}

export default UnThreadPage;
