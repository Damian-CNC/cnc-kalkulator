import { useMemo } from 'react';
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
    <PageLayout title="Gwinty NPT (ANSI/ASME B1.20.1)" backRoute="/gwinty">
      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
            Rozmiar gwintu
          </label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto md:text-sm md:py-2.5 md:px-3 md:h-10 md:rounded-lg">
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
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                NPT {selectedSize} — {result.tpi} TPI / {L.disp(result.pitch, 4)} {L.unit}
              </span>
            </div>

            <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                  🔩 Czop (Zewnętrzny)
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                  🔧 Otwór (Wewnętrzny)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <DiameterCard
                    label="Średnica zewnętrzna na czole (d)"
                    limits={{ max: result.od, min: result.od }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label="Średnica podziałowa na czole (d2)"
                    limits={{ max: result.pitchDia, min: result.pitchDia }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label="Średnica rdzenia (d3)"
                    limits={{ max: result.minor, min: result.minor }}
                    unit="mm"
                    digits={3}
                  />
                  <PitchCard
                    label="Skok gwintu (P)"
                    pitch={result.pitch}
                    unit="mm"
                    tpi={result.tpi}
                    digits={4}
                  />
                  <DepthCard
                    label="Wysokość profilu gwintu (h3)"
                    depth={result.h3}
                    unit="mm"
                    digits={3}
                    note="h3 = 0,8 × P"
                  />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <DiameterCard
                    label="Średnica zewnętrzna na czole (D)"
                    limits={{ max: result.od, min: result.od }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label="Średnica podziałowa na czole (D2)"
                    limits={{ max: result.pitchDia, min: result.pitchDia }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label="Średnica wewnętrzna (D1)"
                    limits={{ max: result.minor, min: result.minor }}
                    unit="mm"
                    digits={3}
                  />
                  <PitchCard
                    label="Skok gwintu (P)"
                    pitch={result.pitch}
                    unit="mm"
                    tpi={result.tpi}
                    digits={4}
                  />
                  <DepthCard
                    label="Wysokość profilu gwintu (h3)"
                    depth={result.h3}
                    unit="mm"
                    digits={3}
                    note="h3 = 0,8 × P"
                  />
                  <DrillCard
                    label="Wiertło pod gwintownik stożkowy"
                    diameter={result.tapDrill}
                    unit="mm"
                    digits={1}
                    note="Standardowe zalecenie"
                  />
                </div>
              </TabsContent>

              <p className="text-zinc-600 text-xs text-center mt-4 px-2">
                Gwint stożkowy o zbieżności 1:16 (kąt 1°47'). Wymiary podano dla płaszczyzny bazowej na czole detalu.
              </p>
            </Tabs>
          </>
        )}

        {!result && (
          <p className="text-center text-zinc-500 py-10">Wybierz rozmiar gwintu NPT z listy powyżej.</p>
        )}
      </div>
      <ClearFab onClear={() => setSelectedSize('')} />
    </PageLayout>
  );
};

export default NptThreadCalculator;
