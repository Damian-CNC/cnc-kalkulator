import { useState, useMemo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { bspThreads, bspSizes } from '@/data/bspThreadsData';
import type { ThreadLimits } from '@/data/bspThreadsData';

const BspThreadCalculator = () => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return bspThreads[selectedSize] ?? null;
  }, [selectedSize]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-zinc-400 text-sm font-medium">Rozmiar gwintu</label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
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
              {selectedSize} — {thread.tpi} TPI / {thread.pitch} mm
            </span>
          </div>

          <Tabs defaultValue="external" className="w-full">
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
                <DimensionCard label="Średnica zewnętrzna (d)" limits={thread.external.d} />
                <DimensionCard label="Średnica podziałowa (d2)" limits={thread.external.d2} />
                <DimensionCard label="Średnica rdzenia (d1)" limits={thread.external.d1} />
                <CamCard label="Wysokość nacinania (h3)" value={thread.h3} />
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="space-y-3 mt-3">
                <DimensionCard label="Średnica zewnętrzna (D)" limits={thread.internal.D} />
                <DimensionCard label="Średnica podziałowa (D2)" limits={thread.internal.D2} />
                <DimensionCard label="Średnica wewnętrzna (D1)" limits={thread.internal.D1} />
                <CamCard label="Wysokość nacinania (h3)" value={thread.h3} />
                <DrillCard tapDrill={thread.internal.drill} />
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
    </div>
  );
};

function DimensionCard({ label, limits }: { label: string; limits: ThreadLimits }) {
  const mid = ((limits.max + limits.min) / 2).toFixed(3);
  const range = limits.max - limits.min;
  const midPct = range > 0 ? 50 : 50;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-zinc-500 text-xs mb-2">Nominalna: {limits.nom} mm</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Max</span>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">{limits.max}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Min</span>
          <p className="text-xl md:text-2xl font-bold text-amber-400">{limits.min}</p>
        </div>
      </div>
      {/* Środek tolerancji */}
      <div className="border-t border-zinc-700/50 pt-3">
        <p className="text-xs text-zinc-500 text-center mb-1">Środek tolerancji (Idealny)</p>
        <p className="text-2xl md:text-3xl font-black text-cyan-400 text-center">{mid} <span className="text-sm font-normal text-zinc-500">mm</span></p>
        {/* Wizualny pasek */}
        <div className="relative mt-3 h-2 rounded-full bg-zinc-700/50">
          <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-amber-500/40 via-cyan-500/40 to-emerald-500/40" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-amber-400 border border-zinc-900" />
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-900" />
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-zinc-900 shadow-lg shadow-cyan-500/30" style={{ left: `${midPct}%`, transform: 'translate(-50%, -50%)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-amber-500/70">MIN</span>
          <span className="text-[10px] text-cyan-400 font-bold">↑ Celuj tutaj</span>
          <span className="text-[10px] text-emerald-500/70">MAX</span>
        </div>
      </div>
    </div>
  );
}

function CamCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{value} mm</p>
      <p className="text-cyan-600 text-xs mt-1.5">(Radialna głębokość profilu gwintu)</p>
    </div>
  );
}

function DrillCard({ tapDrill }: { tapDrill: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-3">Wiertło pod gwintownik</p>
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold text-cyan-400">ø{tapDrill} <span className="text-sm font-normal text-zinc-500">mm</span></p>
      </div>
    </div>
  );
}

export default BspThreadCalculator;
