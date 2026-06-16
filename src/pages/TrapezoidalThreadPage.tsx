import { useMemo, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const round = (v: number, n = 3) => Number.isFinite(v) ? Number(v.toFixed(n)) : null;

const getCrestClearance = (P: number): number => {
  if (P <= 1.5) return 0.15;
  if (P <= 5) return 0.25;
  if (P <= 12) return 0.5;
  return 1.0;
};

const TrapezoidalThreadPage = () => {
  const [dInput, setDInput] = useState('');
  const [pInput, setPInput] = useState('');

  const parsedD = useMemo(() => {
    const v = parseFloat(dInput.replace(',', '.'));
    return isNaN(v) || v <= 0 ? null : v;
  }, [dInput]);

  const parsedP = useMemo(() => {
    const v = parseFloat(pInput.replace(',', '.'));
    return isNaN(v) || v <= 0 ? null : v;
  }, [pInput]);

  const nominal = useMemo(() => {
    if (parsedD === null || parsedP === null) return null;
    const d = parsedD;
    const P = parsedP;
    const ac = getCrestClearance(P);
    const d2 = d - 0.5 * P;
    const d3 = d - P - 2 * ac;
    const D4 = d + 2 * ac;
    const D1 = d - P;
    const h3 = 0.5 * P + ac;
    return {
      ac: round(ac),
      d: round(d),
      d2: round(d2),
      d3: round(d3),
      D4: round(D4),
      D1: round(D1),
      h3: round(h3),
    };
  }, [parsedD, parsedP]);

  const designation = parsedD !== null && parsedP !== null ? `Tr ${parsedD} × ${parsedP}` : null;

  return (
    <PageLayout title="Gwinty Trapezowe (Tr)" backRoute="/gwinty">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              Średnica (d) mm
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={dInput}
              onChange={(e) => setDInput(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-lg"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              Skok (P) mm
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={pInput}
              onChange={(e) => setPInput(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-lg"
            />
          </div>
        </div>

        {designation && nominal && (
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {designation}
            </span>
            <p className="text-zinc-500 text-xs mt-2">Luz wierzchołkowy ac = {nominal.ac} mm</p>
          </div>
        )}

        {nominal && (
          <Tabs defaultValue="external" className="w-full">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔩 Śruba (Czop)
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔧 Nakrętka (Otwór)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external">
              <div className="space-y-3 mt-3">
                <NominalCard label="Średnica zewnętrzna (d)" value={nominal.d} />
                <NominalCard label="Średnica podziałowa (d2)" value={nominal.d2} />
                <NominalCard label="Średnica rdzenia (d3)" value={nominal.d3} />
                <CamCard label="Wysokość profilu gwintu (h3)" value={nominal.h3} note="Głębokość nacinania" />
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="space-y-3 mt-3">
                <NominalCard label="Średnica wewnętrzna (D1)" value={nominal.D1} />
                <NominalCard label="Średnica podziałowa (D2)" value={nominal.d2} />
                <NominalCard label="Średnica zewn. w bruzdach (D4)" value={nominal.D4} />
                <CamCard label="Średnica wiercenia" value={nominal.D1} note="Równa D1" />
              </div>
            </TabsContent>

            <p className="text-zinc-600 text-xs text-center mt-4">
              Wymiary nominalne wg DIN 103 · Profil trapezowy symetryczny 30°
            </p>
          </Tabs>
        )}

        {(parsedD === null || parsedP === null) && (
          <p className="text-center text-zinc-500 py-10">
            Wpisz średnicę nominalną i skok, aby zobaczyć wymiary gwintu.
          </p>
        )}
      </div>
    </PageLayout>
  );
};

function NominalCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-zinc-100">{value ?? '—'} <span className="text-base text-zinc-500 font-normal">mm</span></p>
      <p className="text-zinc-600 text-xs mt-1">Wymiar nominalny</p>
    </div>
  );
}

function CamCard({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{value} mm</p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

export default TrapezoidalThreadPage;
