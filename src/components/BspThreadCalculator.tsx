import { useMemo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { bspThreads, bspSizes } from '@/data/bspThreadsData';
import useQueryState from '@/hooks/useQueryState';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import ClearFab from '@/components/ClearFab';
import { DiameterCard, PitchCard, DepthCard, DrillCard } from '@/components/ThreadResultCards';

const BspThreadCalculator = () => {
  const L = useLength('mm');
  const [selectedSize, setSelectedSize] = usePersistedState<string>('bsp-size', '');
  const [threadTab, setThreadTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'bsp-tab');

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return bspThreads[selectedSize] ?? null;
  }, [selectedSize]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col">
        <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Rozmiar gwintu</label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
            <SelectValue placeholder="Wybierz rozmiar" />
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
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {selectedSize} — {thread.tpi} TPI / {L.disp(thread.pitch, 4)} {L.unit}
            </span>
          </div>

          <Tabs value={threadTab} onValueChange={(value) => setThreadTab(value as 'external' | 'internal')} className="w-full">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔩 Czop
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔧 Otwór
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external">
              <div className="space-y-3 mt-3">
                <DiameterCard
                  label="Średnica zewnętrzna (d)"
                  limits={{ max: thread.external.d.max, min: thread.external.d.min }}
                  unit="mm"
                  nominal={thread.external.d.nom}
                  tolClass="A"
                  digits={3}
                />
                <DiameterCard
                  label="Średnica podziałowa (d2)"
                  limits={{ max: thread.external.d2.max, min: thread.external.d2.min }}
                  unit="mm"
                  nominal={thread.external.d2.nom}
                  tolClass="A"
                  digits={3}
                />
                <DiameterCard
                  label="Średnica rdzenia (d1)"
                  limits={{ max: thread.external.d1.max, min: thread.external.d1.min }}
                  unit="mm"
                  nominal={thread.external.d1.nom}
                  tolClass="A"
                  digits={3}
                />
                <PitchCard
                  label="Skok gwintu (P)"
                  pitch={thread.pitch}
                  tpi={thread.tpi}
                  unit="mm"
                  digits={4}
                />
                <DepthCard
                  label="Głębokość nacinania (h3)"
                  depth={thread.h3}
                  unit="mm"
                  digits={3}
                  note="Radialna głębokość profilu gwintu"
                />
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="space-y-3 mt-3">
                <DiameterCard
                  label="Średnica zewnętrzna (D)"
                  limits={{ max: thread.internal.D.max, min: thread.internal.D.min }}
                  unit="mm"
                  nominal={thread.internal.D.nom}
                  tolClass="A"
                  digits={3}
                />
                <DiameterCard
                  label="Średnica podziałowa (D2)"
                  limits={{ max: thread.internal.D2.max, min: thread.internal.D2.min }}
                  unit="mm"
                  nominal={thread.internal.D2.nom}
                  tolClass="A"
                  digits={3}
                />
                <DiameterCard
                  label="Średnica wewnętrzna (D1)"
                  limits={{ max: thread.internal.D1.max, min: thread.internal.D1.min }}
                  unit="mm"
                  nominal={thread.internal.D1.nom}
                  tolClass="A"
                  digits={3}
                />
                <PitchCard
                  label="Skok gwintu (P)"
                  pitch={thread.pitch}
                  tpi={thread.tpi}
                  unit="mm"
                  digits={4}
                />
                <DepthCard
                  label="Głębokość nacinania (h3)"
                  depth={thread.h3}
                  unit="mm"
                  digits={3}
                  note="Radialna głębokość profilu gwintu"
                />
                <DrillCard
                  label="Wiertło pod gwintownik"
                  diameter={thread.internal.drill}
                  unit="mm"
                  digits={3}
                  note="Średnica wiercenia"
                />
              </div>
            </TabsContent>

            <p className="text-zinc-600 text-xs text-center mt-4">
              Tolerancje wg ISO 228-1 · Klasa dokładności A · Profil Whitworth 55°
            </p>
          </Tabs>
        </>
      )}

      {!thread && (
        <p className="text-center text-zinc-500 py-10">Wybierz rozmiar gwintu BSP z listy powyżej.</p>
      )}
      <ClearFab onClear={() => setSelectedSize('')} />
    </div>
  );
};

export default BspThreadCalculator;
