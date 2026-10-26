import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
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
  type UnSeries,
} from '@/lib/unThread';
import {
  DiameterCard,
  PitchCard,
  DepthCard,
  DrillCard,
} from '@/components/ThreadResultCards';

const SERIES: UnSeries[] = ['UNC', 'UNF', 'UNEF'];

type State = { series: UnSeries; size: string; extCls: ExtClass; intCls: IntClass };
const INITIAL: State = { series: 'UNC', size: '1/4', extCls: '2A', intCls: '2B' };


const UnThreadPage = () => {
  const { t } = useTranslation('tools');
  const L = useLength('in');
  const [s, setS, reset] = usePersistedState<State>('un-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'un-tab');

  const sizes = useMemo(() => sizesForSeries(s.series), [s.series]);
  const size = sizes.find((z) => z.id === s.size) ?? sizes[0];

  const res = useMemo(
    () => (size ? calcUn(size, s.series, s.extCls, s.intCls) : null),
    [size, s.series, s.extCls, s.intCls],
  );

  // Compute metric drill for internal tab
  const metricDrill = useMemo(() => {
    if (!res) return null;
    const min = res.int.minor.min;
    const max = res.int.minor.max;
    if (max === null) return null;
    const mid = (min + max) / 2;
    let metric: number | null = null;
    for (let d = Math.ceil(min * MM * 10) / 10; d <= max * MM + 1e-9; d += 0.1) {
      if (metric === null || Math.abs(d - mid * MM) < Math.abs(metric - mid * MM)) {
        metric = Math.round(d * 10) / 10;
      }
    }
    return metric;
  }, [res]);

  return (
    <PageLayout title={t('un.title')} backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
          <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
            {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
            <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-2">
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
                  <div className="text-center pt-1 border-t border-zinc-800/60">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                      {res.designation}
                    </span>
                    <p className="text-zinc-500 text-xs mt-1.5">
                      {t('un.basicInfo', { d: L.fmt(res.D, 4, 2), p: L.fmt(res.P, 4, 3) })}
                    </p>
                  </div>

                  <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                    <TabsTrigger
                      value="external"
                      className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm"
                    >
                      🔩 {t('un.bolt')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="internal"
                      className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm"
                    >
                      🔧 {t('un.nut')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Klasa tolerancji dopasowana do wybranej zakładki */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    {tab === 'external' ? (
                      <ClassPicker
                        title={t('un.classBolt')}
                        options={EXT_CLASSES}
                        value={s.extCls}
                        onChange={(v) => setS((p) => ({ ...p, extCls: v as ExtClass }))}
                      />
                    ) : (
                      <ClassPicker
                        title={t('un.classNut')}
                        options={INT_CLASSES}
                        value={s.intCls}
                        onChange={(v) => setS((p) => ({ ...p, intCls: v as IntClass }))}
                      />
                    )}
                  </div>

                  <p className="text-zinc-500 text-[11px] text-center pt-2 border-t border-zinc-800/60 leading-relaxed">
                    {t('un.footer')}
                  </p>
                </>
              )}
            </div>

            {/* Prawa kolumna: karty wyników w 2 kolumnach na PC */}
            <div className="min-w-0">
              {res && (
                <>
                  <TabsContent value="external" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('un.major')}
                        limits={res.ext.major}
                        unit="in"
                        digits={4}
                        tolClass={s.extCls}
                      />
                      <DiameterCard
                        label={t('un.pitch')}
                        limits={res.ext.pitch}
                        unit="in"
                        digits={4}
                        tolClass={s.extCls}
                      />
                      <DiameterCard
                        label={t('un.minorRef')}
                        limits={{ max: res.ext.minorRef, min: res.ext.minorRef }}
                        unit="in"
                        note={t('un.minorRefNote')}
                        digits={4}
                      />
                      <PitchCard
                        label="Skok gwintu (P)"
                        pitch={res.P}
                        unit="in"
                        digits={4}
                      />
                      <div className="md:col-span-2">
                        <DepthCard
                          label={t('un.depthExt')}
                          depth={res.depthExt}
                          unit="in"
                          note={`${t('un.depthNote')} · ${t('un.depthExtNote')}`}
                          digits={4}
                        />
                      </div>
                      {res.ext.allowance > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-zinc-500 text-center py-1">
                            {t('un.allowance', { a: L.fmt(res.ext.allowance) })}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="internal" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('un.majorNut')}
                        limits={{ max: res.int.majorMin, min: res.int.majorMin }}
                        unit="in"
                        note="min wg normy"
                        digits={4}
                      />
                      <DiameterCard
                        label={t('un.pitchNut')}
                        limits={res.int.pitch}
                        unit="in"
                        digits={4}
                        tolClass={s.intCls}
                      />
                      <DiameterCard
                        label={t('un.minorNut')}
                        limits={{
                          max: res.int.minor.max ?? res.int.minor.min,
                          min: res.int.minor.min,
                          tol: res.int.minor.tol ?? 0,
                        }}
                        unit="in"
                        digits={4}
                        tolClass={s.intCls}
                      />
                      <PitchCard
                        label="Skok gwintu (P)"
                        pitch={res.P}
                        unit="in"
                        digits={4}
                      />
                      <DepthCard
                        label={t('un.depthInt')}
                        depth={res.depthInt}
                        unit="in"
                        note={t('un.depthNote')}
                        digits={4}
                      />
                      <DrillCard
                        label={t('un.drill')}
                        diameter={(res.int.minor.min + (res.int.minor.max ?? res.int.minor.min)) / 2}
                        unit="in"
                        note={t('un.drillNote')}
                        metricDrill={metricDrill}
                        digits={3}
                      />
                      {res.int.minor.max === null && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-amber-500/80 text-center py-1">{t('un.minorNoMax')}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </div>
        </Tabs>
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

export default UnThreadPage;
