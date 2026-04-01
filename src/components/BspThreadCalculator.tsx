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
          {/* Designation badge */}
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {thread.size}
            </span>
          </div>

          {/* TPI & Pitch */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-zinc-400 text-sm font-medium mb-2">Skok gwintu</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">TPI</span>
                <p className="text-xl md:text-2xl font-bold text-zinc-100">{thread.tpi}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Skok (P)</span>
                <p className="text-xl md:text-2xl font-bold text-zinc-100">{thread.pitch} <span className="text-sm font-normal text-zinc-500">mm</span></p>
              </div>
            </div>
          </div>

          {/* h3 - Thread depth */}
          <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
            <p className="text-cyan-300 text-sm font-medium mb-1">Wysokość nacinania (h3)</p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">{thread.h3} <span className="text-sm font-normal text-cyan-600">mm</span></p>
            <p className="text-cyan-600 text-xs mt-1.5">(Radialna głębokość profilu gwintu)</p>
          </div>

          {/* External thread dimensions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-zinc-300 text-sm font-semibold mb-3">🔩 Gwint zewnętrzny (czop)</p>
            <div className="space-y-3">
              <DimRow label="Śr. zewnętrzna (d)" value={thread.majorDia} color="text-emerald-400" />
              <DimRow label="Śr. podziałowa (d2)" value={thread.pitchDia} color="text-amber-400" />
              <DimRow label="Śr. rdzenia (d1)" value={thread.minorDia} color="text-rose-400" />
            </div>
          </div>

          {/* Internal thread dimensions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-zinc-300 text-sm font-semibold mb-3">🔧 Gwint wewnętrzny (otwór)</p>
            <div className="space-y-3">
              <DimRow label="Śr. zewnętrzna (D)" value={thread.majorDia} color="text-emerald-400" />
              <DimRow label="Śr. podziałowa (D2)" value={thread.pitchDia} color="text-amber-400" />
              <DimRow label="Śr. wewnętrzna (D1)" value={thread.minorDia} color="text-rose-400" />
            </div>
          </div>

          {/* Tap drill */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex items-center justify-between">
            <p className="text-zinc-400 text-sm font-medium">Wiertło pod gwintownik</p>
            <p className="text-xl md:text-2xl font-bold text-cyan-400">
              ø{thread.tapDrill} <span className="text-sm font-normal text-zinc-500">mm</span>
            </p>
          </div>
        </>
      )}

      {!thread && (
        <p className="text-center text-zinc-500 py-10">Wybierz rozmiar gwintu BSP z listy powyżej.</p>
      )}
    </div>
  );
};

function DimRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className={`text-lg md:text-xl font-bold ${color}`}>
        {value} <span className="text-sm font-normal text-zinc-500">mm</span>
      </span>
    </div>
  );
}

export default BspThreadCalculator;
