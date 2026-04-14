import { useState, useMemo } from 'react';
import PageLayout from '@/components/PageLayout';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  calculateTolerance,
  HOLE_LETTERS,
  SHAFT_LETTERS,
  IT_GRADES,
} from '@/utils/isoMathCalculator';

const TolerancesPage = () => {
  const [nominalInput, setNominalInput] = useState('');
  const [isHole, setIsHole] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState('H');
  const [selectedIT, setSelectedIT] = useState('7');

  const parsedNominal = useMemo(() => {
    const val = parseFloat(nominalInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [nominalInput]);

  const letters = isHole ? HOLE_LETTERS : SHAFT_LETTERS;

  const result = useMemo(() => {
    if (parsedNominal === null || !selectedLetter || !selectedIT) return null;
    return calculateTolerance(parsedNominal, isHole, selectedLetter, parseInt(selectedIT));
  }, [parsedNominal, isHole, selectedLetter, selectedIT]);

  const handleTypeChange = (hole: boolean) => {
    setIsHole(hole);
    setSelectedLetter(hole ? 'H' : 'h');
    setSelectedIT('7');
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
            placeholder="np. 25"
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
            🕳️ Otwór (A–ZC)
          </button>
          <button
            onClick={() => handleTypeChange(false)}
            className={`py-3 rounded-xl text-sm font-bold transition-colors border ${
              !isHole
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}
          >
            🔩 Wałek (a–zc)
          </button>
        </div>

        {/* Letter + IT grade selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-sm font-medium">Litera tolerancji</label>
            <Select value={selectedLetter} onValueChange={setSelectedLetter}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Litera" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                {letters.map((l) => (
                  <SelectItem key={l} value={l} className="text-zinc-100 focus:bg-zinc-800">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 text-sm font-medium">Klasa IT</label>
            <Select value={selectedIT} onValueChange={setSelectedIT}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="IT" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                {IT_GRADES.map((g) => (
                  <SelectItem key={g} value={String(g)} className="text-zinc-100 focus:bg-zinc-800">
                    IT{g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              Przedział: {result.rangeLabel} mm · IT{selectedIT} = {result.itValue} μm
            </p>

            {/* Deviations card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
              <p className="text-zinc-400 text-sm font-medium mb-3">Odchyłki</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Górna (ES/es)</span>
                  <p className="text-2xl font-bold text-emerald-400">
                    {result.upperDeviation_um > 0 ? '+' : ''}{result.upperDeviation_um} <span className="text-sm text-zinc-500">μm</span>
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {result.upperDeviation_mm > 0 ? '+' : ''}{result.upperDeviation_mm.toFixed(3)} mm
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Dolna (EI/ei)</span>
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
              {/* Środek tolerancji */}
              <div className="border-t border-cyan-800/30 mt-4 pt-3">
                <p className="text-xs text-zinc-500 text-center mb-1">Środek tolerancji (Idealny)</p>
                <p className="text-3xl md:text-4xl font-black text-cyan-400 text-center">
                  {((result.dimMax + result.dimMin) / 2).toFixed(3)} <span className="text-sm font-normal text-zinc-500">mm</span>
                </p>
                <div className="relative mt-3 h-2 rounded-full bg-zinc-700/50">
                  <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-amber-500/40 via-cyan-500/40 to-emerald-500/40" />
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-amber-400 border border-zinc-900" />
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-900" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-400 border-2 border-zinc-900 shadow-lg shadow-cyan-500/30" style={{ left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-amber-500/70">MIN</span>
                  <span className="text-[10px] text-cyan-400 font-bold">↑ Celuj tutaj</span>
                  <span className="text-[10px] text-emerald-500/70">MAX</span>
                </div>
              </div>
            </div>

            <p className="text-zinc-600 text-xs text-center">
              Obliczenia wg algorytmu ISO 286-1 · Profil jednostki tolerancji i = 0.45·D¹ᐟ³ + 0.001·D
            </p>
          </div>
        )}

        {parsedNominal !== null && !result && (
          <p className="text-center text-amber-400/70 py-6 text-sm">
            Brak danych dla tej kombinacji. Sprawdź wymiar (0–3150 mm).
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
