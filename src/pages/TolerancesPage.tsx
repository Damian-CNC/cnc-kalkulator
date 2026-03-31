import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  calculateTolerance,
  HOLE_TOLERANCES,
  SHAFT_TOLERANCES,
} from '@/utils/isoTolerancesDatabase';

const TolerancesPage = () => {
  const [nominalInput, setNominalInput] = useState('');
  const [isHole, setIsHole] = useState(true);
  const [selectedTolerance, setSelectedTolerance] = useState('H7');

  const parsedNominal = useMemo(() => {
    const val = parseFloat(nominalInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [nominalInput]);

  const toleranceOptions = isHole ? HOLE_TOLERANCES : SHAFT_TOLERANCES;

  const result = useMemo(() => {
    if (parsedNominal === null || !selectedTolerance) return null;
    return calculateTolerance(parsedNominal, isHole, selectedTolerance);
  }, [parsedNominal, isHole, selectedTolerance]);

  const handleTypeChange = (hole: boolean) => {
    setIsHole(hole);
    setSelectedTolerance(hole ? 'H7' : 'h7');
  };

  return (
    <PageLayout title="Tolerancje ISO 286">
      <div className="space-y-5">
        {/* Nominal dimension input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-sm font-medium">Wymiar nominalny (mm)</label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            placeholder="np. 12"
            value={nominalInput}
            onChange={(e) => setNominalInput(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-center font-bold"
          />
        </div>

        {/* Hole / Shaft toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTypeChange(true)}
            className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
              isHole
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}
          >
            🕳️ Otwór
          </button>
          <button
            onClick={() => handleTypeChange(false)}
            className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
              !isHole
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}
          >
            🔩 Wałek
          </button>
        </div>

        {/* Tolerance selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-sm font-medium">Tolerancja</label>
          <Select value={selectedTolerance} onValueChange={setSelectedTolerance}>
            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Wybierz tolerancję" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
              {toleranceOptions.map((t) => (
                <SelectItem key={t} value={t} className="text-zinc-100 focus:bg-zinc-800">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result display */}
        {result && (
          <div className="space-y-3">
            {/* Designation badge */}
            <div className="text-center">
              <span className="inline-block px-5 py-2 rounded-full bg-emerald-500/15 text-emerald-400 font-black text-xl tracking-wider border border-emerald-500/30">
                {result.designation}
              </span>
            </div>

            {/* Range info */}
            <p className="text-center text-zinc-500 text-xs">
              Przedział wymiarowy: {result.rangeLabel} mm
            </p>

            {/* Deviations card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-3">Odchyłki</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Górna</span>
                  <p className="text-2xl font-bold text-emerald-400">
                    {result.upperDeviation_um > 0 ? '+' : ''}{result.upperDeviation_um} <span className="text-sm text-zinc-500">μm</span>
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {result.upperDeviation_mm > 0 ? '+' : ''}{result.upperDeviation_mm.toFixed(3)} mm
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Dolna</span>
                  <p className="text-2xl font-bold text-amber-400">
                    {result.lowerDeviation_um > 0 ? '+' : ''}{result.lowerDeviation_um} <span className="text-sm text-zinc-500">μm</span>
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {result.lowerDeviation_mm > 0 ? '+' : ''}{result.lowerDeviation_mm.toFixed(3)} mm
                  </p>
                </div>
              </div>
            </div>

            {/* Final dimensions card */}
            <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
              <p className="text-cyan-300 text-sm font-medium mb-3">Wymiar końcowy</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Max</span>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-400">{result.dimMax.toFixed(3)}</p>
                  <span className="text-xs text-zinc-500">mm</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Min</span>
                  <p className="text-2xl md:text-3xl font-bold text-amber-400">{result.dimMin.toFixed(3)}</p>
                  <span className="text-xs text-zinc-500">mm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {parsedNominal !== null && !result && (
          <p className="text-center text-amber-400/70 py-6 text-sm">
            Brak danych dla tej kombinacji. Sprawdź wymiar (0–1000 mm) i tolerancję.
          </p>
        )}

        {parsedNominal === null && (
          <p className="text-center text-zinc-500 py-10">
            Wpisz wymiar nominalny, aby obliczyć tolerancje.
          </p>
        )}
      </div>
    </PageLayout>
  );
};

export default TolerancesPage;
