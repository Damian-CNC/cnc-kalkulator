import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { calculateMetricThread } from '@/utils/threadMath';
import threadsData from '@/data/metric_threads.json';

interface ThreadEntry {
  designation: string;
  d: number;
  P: number;
  external_6g: {
    d_max: number;
    d_min: number;
    d2_max: number;
    d2_min: number;
    d3_max: number;
    d3_min: number;
  };
  internal_6H: {
    D1_min: number;
    D1_max: number;
    D2_min: number;
    D2_max: number;
    D_min: number;
    D_max: number;
    tap_drill: number;
  };
}

const threads = threadsData as ThreadEntry[];

const STANDARD_PITCHES = [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.75, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];

const ThreadCalculatorPage = () => {
  const [diameterInput, setDiameterInput] = useState<string>('');
  const [selectedP, setSelectedP] = useState<string>('');

  const parsedD = useMemo(() => {
    const val = parseFloat(diameterInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [diameterInput]);

  const selectedThread = useMemo(() => {
    if (parsedD === null || !selectedP) return null;
    return threads.find((t) => t.d === parsedD && t.P === parseFloat(selectedP)) || null;
  }, [parsedD, selectedP]);

  const nominal = useMemo(() => {
    if (parsedD === null || !selectedP) return null;
    return calculateMetricThread(parsedD, parseFloat(selectedP));
  }, [parsedD, selectedP]);

  const handleDiameterChange = (val: string) => {
    setDiameterInput(val);
    setSelectedP('');
  };

  return (
    <PageLayout title="Gwinty Metryczne">
      <div className="space-y-5">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-sm font-medium">Średnica (d) mm</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="np. 10"
              value={diameterInput}
              onChange={(e) => handleDiameterChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-sm font-medium">Skok (P)</label>
            <Select value={selectedP} onValueChange={setSelectedP}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Wybierz P" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                {STANDARD_PITCHES.map((p) => (
                  <SelectItem key={p} value={String(p)} className="text-zinc-100 focus:bg-zinc-800">
                    {p} mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Designation badge */}
        {selectedThread && (
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {selectedThread.designation}
            </span>
          </div>
        )}

        {/* Results */}
        {nominal && (
          <Tabs defaultValue="external" className="w-full">
            <TabsList className="w-full bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="external" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔩 Śruba (6g)
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50">
                🔧 Nakrętka (6H)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="external">
              <div className="space-y-3 mt-3">
                <DimensionCard
                  label="Średnica zewnętrzna (d)"
                  nominal={nominal.nominalDiameter}
                  max={selectedThread?.external_6g.d_max ?? null}
                  min={selectedThread?.external_6g.d_min ?? null}
                />
                <DimensionCard
                  label="Średnica podziałowa (d2)"
                  nominal={nominal.pitchDiameter}
                  max={selectedThread?.external_6g.d2_max ?? null}
                  min={selectedThread?.external_6g.d2_min ?? null}
                />
                <DimensionCard
                  label="Średnica rdzenia (d3)"
                  nominal={nominal.externalMinorDiameter}
                  max={selectedThread?.external_6g.d3_max ?? null}
                  min={selectedThread?.external_6g.d3_min ?? null}
                />
                <CamCard
                  label="Wysokość nacinania (h3)"
                  value={nominal.externalThreadHeight}
                  note="Użyj w Fusion 360 jako Thread Depth"
                />
              </div>
            </TabsContent>

            <TabsContent value="internal">
              <div className="space-y-3 mt-3">
                <DimensionCard
                  label="Średnica wewnętrzna (D1)"
                  nominal={nominal.internalMinorDiameter}
                  max={selectedThread?.internal_6H.D1_max ?? null}
                  min={selectedThread?.internal_6H.D1_min ?? null}
                />
                <DimensionCard
                  label="Średnica podziałowa (D2)"
                  nominal={nominal.pitchDiameter}
                  max={selectedThread?.internal_6H.D2_max ?? null}
                  min={selectedThread?.internal_6H.D2_min ?? null}
                />
                <DimensionCard
                  label="Średnica zewnętrzna (D)"
                  nominal={null}
                  max={selectedThread?.internal_6H.D_max ?? null}
                  min={selectedThread?.internal_6H.D_min ?? null}
                />
                <DrillCard
                  tapDrill={selectedThread?.internal_6H.tap_drill ?? nominal.tapDrillSize}
                  formTapDrill={nominal.formTapDrillSize}
                />
                <CamCard
                  label="Wysokość profilu (H1)"
                  value={nominal.internalThreadHeight}
                />
              </div>
            </TabsContent>

            <p className="text-zinc-600 text-xs text-center mt-4">
              {selectedThread
                ? 'Tolerancje wg ISO 965-1 · Wysokości dla profilu ISO 60°'
                : 'Wymiary nominalne obliczone ze wzorów · Brak tolerancji w bazie'}
            </p>
          </Tabs>
        )}

        {(parsedD === null || !selectedP) && (
          <p className="text-center text-zinc-500 py-10">Wpisz średnicę i wybierz skok, aby zobaczyć wymiary gwintu.</p>
        )}

        {(parsedD === null || !selectedP) && (
          <p className="text-center text-zinc-500 py-10">Wpisz średnicę i wybierz skok, aby zobaczyć wymiary gwintu.</p>
        )}
      </div>
    </PageLayout>
  );
};

/* ---- Sub-components ---- */

function DimensionCard({ label, nominal, max, min }: { label: string; nominal: number | null; max: number; min: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-2">{label}</p>
      {nominal !== null && (
        <p className="text-zinc-500 text-xs mb-2">Nominalna: {nominal} mm</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Max</span>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">{max}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Min</span>
          <p className="text-xl md:text-2xl font-bold text-amber-400">{min}</p>
        </div>
      </div>
    </div>
  );
}

function DrillCard({ tapDrill, formTapDrill }: { tapDrill: number; formTapDrill: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-3">Wiertła</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <span className="text-xs text-zinc-500">Gwintownik</span>
          <p className="text-xl md:text-2xl font-bold text-cyan-400">{tapDrill} mm</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-zinc-500">Wygniatak</span>
          <p className="text-xl md:text-2xl font-bold text-violet-400">{formTapDrill} mm</p>
        </div>
      </div>
    </div>
  );
}

function CamCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">{value} mm</p>
      {note && (
        <p className="text-cyan-600 text-xs mt-1.5">({note})</p>
      )}
    </div>
  );
}

export default ThreadCalculatorPage;
