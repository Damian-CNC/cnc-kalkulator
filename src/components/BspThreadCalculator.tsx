import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { bspThreads, bspSizes } from '@/data/bspThreadsData';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import ClearFab from '@/components/ClearFab';
import { DiameterCard, PitchCard, DepthCard, DrillCard } from '@/components/ThreadResultCards';

const BspThreadCalculator = () => {
  const { t } = useTranslation('threadsCalc');
  const L = useLength('mm');
  const [selectedSize, setSelectedSize] = usePersistedState<string>('bsp-size', '');
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'bsp-tab');

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return bspThreads[selectedSize] ?? null;
  }, [selectedSize]);

  return (
    <div className="w-full">
      <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
        <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start">
          {/* LEWA KOLUMNA: Wybór rozmiaru, Oznaczenie, Wybór Czop / Otwór */}
          <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 p-3.5 sm:p-4 border border-zinc-800/80 rounded-2xl">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                {t('common.threadSize', { defaultValue: 'Rozmiar gwintu (G)' })}
              </label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto md:text-sm md:py-2.5 md:px-3 md:h-10 md:rounded-lg">
                  <SelectValue placeholder={t('common.selectSize', { defaultValue: 'Wybierz rozmiar' })} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                  {bspSizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-zinc-100 focus:bg-zinc-800">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {thread && (
              <>
                <div className="text-center pt-0.5">
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-base md:text-sm tracking-wide border border-emerald-500/30">
                    {selectedSize} — {thread.tpi} TPI / {L.disp(thread.pitch, 4)} {L.unit}
                  </span>
                </div>

                <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
                  <TabsTrigger value="external" className="flex-1 text-xs md:text-xs py-1.5 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                    🔩 {t('threads.bolt')}
                  </TabsTrigger>
                  <TabsTrigger value="internal" className="flex-1 text-xs md:text-xs py-1.5 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                    🔧 {t('threads.internalTab')}
                  </TabsTrigger>
                </TabsList>
              </>
            )}
          </div>

          {/* PRAWA KOLUMNA: Karty wyników */}
          <div className="flex-1 min-w-0">
            {thread ? (
              <>
                <TabsContent value="external" className="mt-0">
                  <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                    <DiameterCard
                      label={t('threads.majorDiameterD')}
                      limits={{ max: thread.external.d.max, min: thread.external.d.min }}
                      unit="mm"
                      nominal={thread.external.d.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <DiameterCard
                      label={t('threads.pitchDiameterD2')}
                      limits={{ max: thread.external.d2.max, min: thread.external.d2.min }}
                      unit="mm"
                      nominal={thread.external.d2.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <DiameterCard
                      label={t('threads.minorDiameterD1')}
                      limits={{ max: thread.external.d1.max, min: thread.external.d1.min }}
                      unit="mm"
                      nominal={thread.external.d1.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <PitchCard
                      label={t('threads.pitch')}
                      pitch={thread.pitch}
                      tpi={thread.tpi}
                      unit="mm"
                      digits={4}
                    />
                    <DepthCard
                      label={t('threads.threadDepthH3')}
                      depth={thread.h3}
                      unit="mm"
                      digits={3}
                      note={t('threads.radialDepthNote')}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="internal" className="mt-0">
                  <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                    <DiameterCard
                      label={t('threads.majorDiameterInternal')}
                      limits={{ max: thread.internal.D.max, min: thread.internal.D.min }}
                      unit="mm"
                      nominal={thread.internal.D.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <DiameterCard
                      label={t('threads.pitchDiameterInternal')}
                      limits={{ max: thread.internal.D2.max, min: thread.internal.D2.min }}
                      unit="mm"
                      nominal={thread.internal.D2.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <DiameterCard
                      label={t('threads.minorDiameterInternal')}
                      limits={{ max: thread.internal.D1.max, min: thread.internal.D1.min }}
                      unit="mm"
                      nominal={thread.internal.D1.nom}
                      tolClass="A"
                      digits={3}
                    />
                    <PitchCard
                      label={t('threads.pitch')}
                      pitch={thread.pitch}
                      tpi={thread.tpi}
                      unit="mm"
                      digits={4}
                    />
                    <DepthCard
                      label={t('threads.threadDepthH3')}
                      depth={thread.h3}
                      unit="mm"
                      digits={3}
                      note={t('threads.radialDepthNote')}
                    />
                    <DrillCard
                      label={t('threads.tapDrill')}
                      diameter={thread.internal.drill}
                      unit="mm"
                      digits={2}
                      note={t('threads.drillDiameterNote')}
                    />
                    <DrillCard
                      label={t('threads.rollTapDrill')}
                      diameter={thread.internal.formDrill}
                      unit="mm"
                      digits={2}
                      note={t('threads.rollTapNote')}
                    />
                  </div>
                </TabsContent>

                <p className="text-zinc-600 text-xs text-center mt-3">
                  {t('bsp.standards')}
                </p>
              </>
            ) : (
              <p className="text-center text-zinc-500 py-10">{t('bsp.selectPrompt')}</p>
            )}
          </div>
        </div>
      </Tabs>

      <ClearFab onClear={() => setSelectedSize('')} />
    </div>
  );
};

export default BspThreadCalculator;
