import { useState, useMemo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { ThreadLimits } from '@/data/bspThreadsData';

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
}

const WhitworthThreadCalculator = ({ threads, sizes, standardLabel, emptyMessage }: WhitworthThreadCalculatorProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return threads[selectedSize] ?? null;
  }, [selectedSize, threads]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-zinc-400 text-sm font-medium">Rozmiar gwintu</label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Wybierz rozmiar" />
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
              {standardLabel}
            </p>
          </Tabs>
        </>
      )}

      {!thread && (
        <p className="text-center text-zinc-500 py-10">
          {emptyMessage ?? 'Wybierz rozmiar gwintu z listy powyżej.'}
        </p>
      )}
    </div>
  );
};

function DimensionCard({ label, limits }: { label: string; limits: ThreadLimits }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-zinc-500 text-xs mb-2">Nominalna: {limits.nom} mm</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Max</span>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">{limits.max}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Min</span>
          <p className="text-xl md:text-2xl font-bold text-amber-400">{limits.min}</p>
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

export default WhitworthThreadCalculator;
