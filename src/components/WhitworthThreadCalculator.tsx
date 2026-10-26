import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ThreadLimits } from '@/data/bspThreadsData';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import ClearFab from '@/components/ClearFab';
import { DiameterCard, PitchCard, DepthCard, DrillCard } from '@/components/ThreadResultCards';

interface ThreadData {
  tpi: number;
  pitch: number;
  h3: number;
  external: { d: ThreadLimits; d2: ThreadLimits; d1: ThreadLimits };
  internal: { D: ThreadLimits; D2: ThreadLimits; D1: ThreadLimits; drill: number };
}

interface WhitworthThreadCalculatorProps {
  threads: Record<string, ThreadData>;
  sizes: string[];
  standardLabel: string;
  emptyMessage?: string;
  /** Unikalna nazwa do zapamiętywania wyboru (osobna dla BSW i BSF). */
  storageKey?: string;
}

const WhitworthThreadCalculator = ({ threads, sizes, standardLabel, emptyMessage, storageKey = 'whitworth' }: WhitworthThreadCalculatorProps) => {
  const L = useLength('mm');
  const { t } = useTranslation('threadsCalc');
  const [selectedSize, setSelectedSize] = usePersistedState<string>(`${storageKey}-size`, '');
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, `${storageKey}-tab`);

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return threads[selectedSize] ?? null;
  }, [selectedSize, threads]);

  return (
    <div className="space-y-5">
      <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
          {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
          <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">{t('whitworth.sizeLabel')}</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 text-base md:text-sm md:py-2 md:px-3 md:h-9 md:rounded-lg">
                  <SelectValue placeholder={t('whitworth.sizePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-zinc-100 focus:bg-zinc-800">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {thread && (
              <>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                    {selectedSize} — {thread.tpi} TPI / {L.disp(thread.pitch, 4)} {L.unit}
                  </span>
                </div>

                <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                  <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                    {t('whitworth.tabExternal')}
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                    {t('whitworth.tabInternal')}
                  </TabsTrigger>
                </TabsList>

                <p className="text-zinc-500 text-[11px] text-center pt-1 border-t border-zinc-800/60">
                  {standardLabel}
                </p>
              </>
            )}
          </div>

          {/* Prawa kolumna: karty wyników w 2 kolumnach na PC */}
          <div className="min-w-0">
            {thread ? (
              <>
                <TabsContent value="external" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DiameterCard
                      label={t('whitworth.extDiameter')}
                      limits={{ max: thread.external.d.max, min: thread.external.d.min }}
                      unit="mm"
                      nominal={thread.external.d.nom}
                      digits={3}
                    />
                    <DiameterCard
                      label={t('whitworth.extPitchDiameter')}
                      limits={{ max: thread.external.d2.max, min: thread.external.d2.min }}
                      unit="mm"
                      nominal={thread.external.d2.nom}
                      digits={3}
                    />
                    <DiameterCard
                      label={t('whitworth.extCoreDiameter')}
                      limits={{ max: thread.external.d1.max, min: thread.external.d1.min }}
                      unit="mm"
                      nominal={thread.external.d1.nom}
                      digits={3}
                    />
                    <PitchCard
                      label="Skok gwintu (P)"
                      pitch={thread.pitch}
                      unit="mm"
                      tpi={thread.tpi}
                      digits={4}
                    />
                    <div className="md:col-span-2">
                      <DepthCard
                        label={t('whitworth.profileHeight')}
                        depth={thread.h3}
                        unit="mm"
                        digits={3}
                        note={t('whitworth.profileHeightNote')}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="internal" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DiameterCard
                      label={t('whitworth.intDiameter')}
                      limits={{ max: thread.internal.D.max, min: thread.internal.D.min }}
                      unit="mm"
                      nominal={thread.internal.D.nom}
                      digits={3}
                    />
                    <DiameterCard
                      label={t('whitworth.intPitchDiameter')}
                      limits={{ max: thread.internal.D2.max, min: thread.internal.D2.min }}
                      unit="mm"
                      nominal={thread.internal.D2.nom}
                      digits={3}
                    />
                    <DiameterCard
                      label={t('whitworth.intCoreDiameter')}
                      limits={{ max: thread.internal.D1.max, min: thread.internal.D1.min }}
                      unit="mm"
                      nominal={thread.internal.D1.nom}
                      digits={3}
                    />
                    <PitchCard
                      label="Skok gwintu (P)"
                      pitch={thread.pitch}
                      unit="mm"
                      tpi={thread.tpi}
                      digits={4}
                    />
                    <DepthCard
                      label={t('whitworth.profileHeight')}
                      depth={thread.h3}
                      unit="mm"
                      digits={3}
                      note={t('whitworth.profileHeightNote')}
                    />
                    <DrillCard
                      label={t('whitworth.tapDrill')}
                      diameter={thread.internal.drill}
                      unit="mm"
                      digits={3}
                      note=""
                    />
                  </div>
                </TabsContent>
              </>
            ) : (
              <div className="text-center text-zinc-500 py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                {emptyMessage ?? t('whitworth.defaultEmptyMessage')}
              </div>
            )}
          </div>
        </div>
      </Tabs>

      <ClearFab onClear={() => setSelectedSize('')} />
    </div>
  );
};

export default WhitworthThreadCalculator;
