import { useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  const [selectedSize, setSelectedSize] = useState<string>('');

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
            <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
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
                NPT {selectedSize} — {result.tpi} TPI / {result.pitch} mm
              </span>
            </div>

            <Tabs defaultValue="external" className="w-full">
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
                  <NominalCard label="Średnica zewnętrzna na czole (d)" value={result.od} />
                  <NominalCard label="Średnica podziałowa na czole (d2)" value={result.pitchDia} />
                  <NominalCard label="Średnica rdzenia (d3)" value={result.minor} />
                  <CamCard label="Wysokość profilu gwintu (h3)" value={result.h3} note="h3 = 0.8 × P" />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <NominalCard label="Średnica zewnętrzna na czole (D)" value={result.od} />
                  <NominalCard label="Średnica podziałowa na czole (D2)" value={result.pitchDia} />
                  <NominalCard label="Średnica wewnętrzna (D1)" value={result.minor} />
                  <CamCard label="Wysokość profilu gwintu (h3)" value={result.h3} note="h3 = 0.8 × P" />
                  <CamCard label="Wiertło pod gwintownik stożkowy" value={result.tapDrill} note="Standardowe zalecenie" />
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
    </PageLayout>
  );
};

function NominalCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-zinc-100">
        {value} <span className="text-base text-zinc-500 font-normal">mm</span>
      </p>
      <p className="text-zinc-600 text-xs mt-1">Wymiar nominalny na płaszczyźnie bazowej</p>
    </div>
  );
}

function CamCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{value} mm</p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

export default NptThreadCalculator;
