import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import ClearFab from '@/components/ClearFab';
import {
  DiameterCard,
  PitchCard,
  DepthCard,
  DrillCard,
} from '@/components/ThreadResultCards';

interface NptData {
  tpi: number;
  pitch: number;
  od: number;       // major diameter at end of pipe (mm)
  pitchDia: number; // pitch diameter E0 at end of external thread (mm)
  tapDrill: number; // tap drill size for taper tap (mm)
}

const nptThreads: Record<string, NptData> = {
  '1/16"':   { tpi: 27,   pitch: 0.941, od: 7.938,  pitchDia: 6.888,  tapDrill: 6.4 },
  '1/8"':    { tpi: 27,   pitch: 0.941, od: 10.287, pitchDia: 9.233,  tapDrill: 8.6 },
  '1/4"':    { tpi: 18,   pitch: 1.411, od: 13.716, pitchDia: 12.126, tapDrill: 11.1 },
  '3/8"':    { tpi: 18,   pitch: 1.411, od: 17.145, pitchDia: 15.545, tapDrill: 14.5 },
  '1/2"':    { tpi: 14,   pitch: 1.814, od: 21.336, pitchDia: 19.264, tapDrill: 17.5 },
  '3/4"':    { tpi: 14,   pitch: 1.814, od: 26.670, pitchDia: 24.579, tapDrill: 22.9 },
  '1"':      { tpi: 11.5, pitch: 2.209, od: 33.401, pitchDia: 30.826, tapDrill: 28.6 },
  '1-1/4"':  { tpi: 11.5, pitch: 2.209, od: 42.164, pitchDia: 39.551, tapDrill: 37.3 },
  '1-1/2"':  { tpi: 11.5, pitch: 2.209, od: 48.260, pitchDia: 45.621, tapDrill: 43.5 },
  '2"':      { tpi: 11.5, pitch: 2.209, od: 60.325, pitchDia: 57.633, tapDrill: 55.6 },
};

const nptSizes = Object.keys(nptThreads);
const round = (v: number, n = 3) => Number(v.toFixed(n));

const NptThreadCalculator = () => {
  const { t } = useTranslation('threadsCalc');
  const L = useLength('mm');
  const [selectedSize, setSelectedSize] = usePersistedState<string>('npt-size', '');
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'npt-tab');

  const result = useMemo(() => {
    if (!selectedSize) return null;
    const t = nptThreads[selectedSize];
    if (!t) return null;
    const h3 = 0.8 * t.pitch;
    const minor = t.od - 2 * h3;
    return {
      ...t,
      h3: round(h3),
      minor: round(minor),
      pitchDia: round(t.pitchDia),
      od: round(t.od),
    };
  }, [selectedSize]);

  return (
    <PageLayout title="Gwinty NPT (ANSI/ASME B1.20.1)" backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
            {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
            <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Rozmiar gwintu
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-100 text-base md:text-sm md:py-2 md:px-3 md:h-9 md:rounded-lg">
                    <SelectValue placeholder="Wybierz rozmiar" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                    {nptSizes.map((s) => (
                      <SelectItem key={s} value={s} className="text-zinc-100 focus:bg-zinc-800">
                        NPT {s} — {nptThreads[s].tpi} TPI
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {result && (
                <>
                  <div className="text-center pt-1 border-t border-zinc-800/60">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                      NPT {selectedSize} — {result.tpi} TPI / {L.disp(result.pitch, 4)} {L.unit}
                    </span>
                  </div>

                  <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                      🔩 {t('threads.bolt')}
                    </TabsTrigger>
                    <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm">
                      🔧 {t('threads.internalTab')}
                    </TabsTrigger>
                  </TabsList>

                  <p className="text-zinc-500 text-[11px] text-center pt-2 border-t border-zinc-800/60 leading-relaxed">
                    {t('npt.conicalNote')}
                  </p>
                </>
              )}
            </div>

            {/* Prawa kolumna: karty wyników */}
            <div className="min-w-0">
              {result ? (
                <>
                  <TabsContent value="external" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('npt.majorDiaFaceExternal')}
                        limits={{ max: result.od, min: result.od }}
                        unit="mm"
                        digits={3}
                      />
                      <DiameterCard
                        label={t('npt.pitchDiaFaceExternal')}
                        limits={{ max: result.pitchDia, min: result.pitchDia }}
                        unit="mm"
                        digits={3}
                      />
                      <DiameterCard
                        label={t('npt.minorDiaFaceExternal')}
                        limits={{ max: result.minor, min: result.minor }}
                        unit="mm"
                        digits={3}
                      />
                      <PitchCard
                        label={t('threads.pitch')}
                        pitch={result.pitch}
                        unit="mm"
                        tpi={result.tpi}
                        digits={4}
                      />
                      <div className="md:col-span-2">
                        <DepthCard
                          label={t('npt.threadHeightH3')}
                          depth={result.h3}
                          unit="mm"
                          digits={3}
                          note="h3 = 0,8 × P"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="internal" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DiameterCard
                        label={t('npt.majorDiaFaceInternal')}
                        limits={{ max: result.od, min: result.od }}
                        unit="mm"
                        digits={3}
                      />
                      <DiameterCard
                        label={t('npt.pitchDiaFaceInternal')}
                        limits={{ max: result.pitchDia, min: result.pitchDia }}
                        unit="mm"
                        digits={3}
                      />
                      <DiameterCard
                        label={t('npt.minorDiaFaceInternal')}
                        limits={{ max: result.minor, min: result.minor }}
                        unit="mm"
                        digits={3}
                      />
                      <PitchCard
                        label={t('threads.pitch')}
                        pitch={result.pitch}
                        unit="mm"
                        tpi={result.tpi}
                        digits={4}
                      />
                      <DepthCard
                        label={t('npt.threadHeightH3')}
                        depth={result.h3}
                        unit="mm"
                        digits={3}
                        note="h3 = 0,8 × P"
                      />
                      <DrillCard
                        label={t('npt.taperTapDrill')}
                        diameter={result.tapDrill}
                        unit="mm"
                        digits={1}
                        note="Standard"
                      />
                    </div>
                  </TabsContent>
                </>
              ) : (
                <div className="text-center text-zinc-500 py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                  Wybierz rozmiar gwintu NPT z listy po lewej stronie.
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
      <ClearFab onClear={() => setSelectedSize('')} />
    </PageLayout>
  );
};

export default NptThreadCalculator;
