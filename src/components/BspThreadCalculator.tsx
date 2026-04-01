import { useState, useMemo } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { bspThreads } from '@/data/bspThreadsData';

const BspThreadCalculator = () => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const thread = useMemo(() => {
    if (!selectedSize) return null;
    return bspThreads.find((t) => t.size === selectedSize) ?? null;
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
            {bspThreads.map((t) => (
              <SelectItem key={t.size} value={t.size} className="text-zinc-100 focus:bg-zinc-800">
                {t.size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {thread && (
        <>
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {thread.size}
            </span>
          </div>

          <div className="space-y-3">
            <ValueCard label="TPI (zwojów na cal)" value={thread.tpi} unit="" />
            <ValueCard label="Skok (P)" value={thread.pitch} unit="mm" />
            <ValueCard label="Średnica zewnętrzna" value={thread.majorDia} unit="mm" color="text-emerald-400" />
            <ValueCard label="Średnica podziałowa" value={thread.pitchDia} unit="mm" color="text-amber-400" />
            <ValueCard label="Średnica rdzenia" value={thread.minorDia} unit="mm" color="text-rose-400" />
            <ValueCard label="Wiertło pod gwintownik" value={thread.tapDrill} unit="mm" color="text-cyan-400" />
          </div>
        </>
      )}

      {!thread && (
        <p className="text-center text-zinc-500 py-10">Wybierz rozmiar gwintu BSP z listy powyżej.</p>
      )}
    </div>
  );
};

function ValueCard({ label, value, unit, color = 'text-zinc-100' }: { label: string; value: number; unit: string; color?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex items-center justify-between">
      <p className="text-zinc-400 text-sm font-medium">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>
        {value} {unit && <span className="text-sm font-normal text-zinc-500">{unit}</span>}
      </p>
    </div>
  );
}

export default BspThreadCalculator;
