import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import standardMetricPitches from '@/data/standardMetricPitches';
import { HELICOIL_THREADS, calculateCustomHelicoil, type HelicoilLengthSpec } from '@/data/helicoilThreadsData';
import { sanitizeDecimal, selectOnFocus } from '@/lib/numericInput';
import PageLayout from '@/components/PageLayout';
import usePersistedState from '@/hooks/usePersistedState';
import ClearFab from '@/components/ClearFab';
import { DiameterCard, PitchCard, DrillCard, AuxCard } from '@/components/ThreadResultCards';

interface SavedHelicoilState {
  diameter: string;
  pitch: string;
  manualPitch: string;
  selectedMultiplier: '1.0d' | '1.5d' | '2.0d' | '2.5d' | '3.0d';
}

const INITIAL_STATE: SavedHelicoilState = {
  diameter: '',
  pitch: '',
  manualPitch: '',
  selectedMultiplier: '1.5d',
};

const HelicoilThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  const [saved, setSaved] = usePersistedState<SavedHelicoilState>('helicoil-thread', INITIAL_STATE);
  const diameterInput = saved.diameter;
  const selectedP = saved.pitch;
  const manualPitch = saved.manualPitch;
  const selectedMultiplier = saved.selectedMultiplier;

  const setDiameterInput = (v: string) => setSaved((s) => ({ ...s, diameter: v }));
  const setSelectedP = (v: string) => setSaved((s) => ({ ...s, pitch: v }));
  const setManualPitch = (v: string) => setSaved((s) => ({ ...s, manualPitch: v }));
  const setSelectedMultiplier = (m: '1.0d' | '1.5d' | '2.0d' | '2.5d' | '3.0d') =>
    setSaved((s) => ({ ...s, selectedMultiplier: m }));

  const [showAllLengths, setShowAllLengths] = useState(false);

  const parsedD = useMemo(() => {
    const val = parseFloat(diameterInput.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [diameterInput]);

  const isStandardDiameter = useMemo(() => {
    if (parsedD === null) return false;
    return String(parsedD) in standardMetricPitches;
  }, [parsedD]);

  const availablePitches = useMemo(() => {
    if (parsedD === null || !isStandardDiameter) return [];
    return (standardMetricPitches as Record<string, number[]>)[String(parsedD)] || [];
  }, [parsedD, isStandardDiameter]);

  const prevDiameter = useRef<number | null>(parsedD);

  useEffect(() => {
    if (isStandardDiameter && availablePitches.length > 0) {
      const coarse = String(availablePitches[availablePitches.length - 1]);
      const diameterChanged = prevDiameter.current !== parsedD;
      prevDiameter.current = parsedD;
      const stillValid = availablePitches.some((p) => String(p) === selectedP);

      if (diameterChanged || !stillValid) {
        setSaved((s) => ({
          ...s,
          pitch: coarse,
          manualPitch: diameterChanged ? '' : s.manualPitch,
        }));
      }
    } else {
      prevDiameter.current = parsedD;
      if (selectedP !== '') setSaved((s) => ({ ...s, pitch: '' }));
    }
  }, [parsedD, isStandardDiameter, availablePitches, selectedP, setSaved]);

  const effectivePitch = useMemo(() => {
    if (isStandardDiameter) return selectedP ? parseFloat(selectedP) : null;
    const val = parseFloat(manualPitch.replace(',', '.'));
    return isNaN(val) || val <= 0 ? null : val;
  }, [isStandardDiameter, selectedP, manualPitch]);

  const thread = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    const found = HELICOIL_THREADS.find(
      (item) => item.d === parsedD && Math.abs(item.P - effectivePitch) < 0.001
    );
    if (found) return found;
    return calculateCustomHelicoil(parsedD, effectivePitch);
  }, [parsedD, effectivePitch]);

  const activeLengthSpec = useMemo<HelicoilLengthSpec | null>(() => {
    if (!thread) return null;
    return (
      thread.lengths.find((l) => l.multiplier === selectedMultiplier) ??
      thread.lengths[1] ??
      thread.lengths[0] ??
      null
    );
  }, [thread, selectedMultiplier]);

  const designation = useMemo(() => {
    if (parsedD === null || effectivePitch === null) return null;
    if (thread) return thread.designation;
    return `EG M${parsedD}×${effectivePitch}`;
  }, [parsedD, effectivePitch, thread]);

  return (
    <PageLayout title={t('helicoil.title', { defaultValue: 'Wkładki HeliCoil (EG M)' })} backRoute="/gwinty">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              {t('metric.diameterLabel', { defaultValue: 'Średnica (d) mm' })}
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              onFocus={selectOnFocus}
              placeholder={t('metric.diameterPlaceholder', { defaultValue: 'np. 6' })}
              value={diameterInput}
              onChange={(e) => setDiameterInput(sanitizeDecimal(e.target.value))}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              {t('metric.pitchLabel', { defaultValue: 'Skok (P)' })}{' '}
              {!isStandardDiameter && parsedD !== null && (
                <span className="text-amber-400 text-[10px] normal-case">
                  {t('metric.pitchSpecial', { defaultValue: '— specjalny' })}
                </span>
              )}
            </label>
            {isStandardDiameter ? (
              <Select value={selectedP} onValueChange={setSelectedP}>
                <SelectTrigger className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 text-lg h-auto">
                  <SelectValue placeholder={t('metric.pitchPlaceholder', { defaultValue: 'Wybierz P' })} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 max-h-60">
                  {availablePitches.map((p) => (
                    <SelectItem key={p} value={String(p)} className="text-zinc-100 focus:bg-zinc-800">
                      {p} mm {p === availablePitches[availablePitches.length - 1] ? t('metric.pitchCoarse', { defaultValue: '(zwykły)' }) : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                onFocus={selectOnFocus}
                placeholder={t('metric.pitchManualPlaceholder', { defaultValue: 'np. 1.0' })}
                value={manualPitch}
                onChange={(e) => setManualPitch(sanitizeDecimal(e.target.value))}
                disabled={parsedD === null}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        </div>

        {designation && (
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
              {designation} · Gniazdo HeliCoil
            </span>
          </div>
        )}

        {thread && effectivePitch && (
          <div className="space-y-4">
            {/* Sekcja: Wiertła pod gniazdo */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Wiercenie pod gwintownik HeliCoil
              </h3>
              <DrillCard
                label="Wiertło pod gwintownik STI (B)"
                diameter={thread.tapDrill}
                unit="mm"
                digits={2}
                note="Średnica wiertła krętego pod gwintownik HeliCoil"
              />
              {thread.formDrill !== undefined && (
                <DrillCard
                  label="Wiertło pod wygniatak HeliCoil"
                  diameter={thread.formDrill}
                  unit="mm"
                  digits={2}
                  note="Formowanie bezwiórowe (wygniatak STI)"
                />
              )}
            </div>

            {/* Sekcja: Wymiary gwintu gniazda (EG M) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Wymiary gwintu gniazda (DIN 8140-2 · 6H mod)
              </h3>
              <DiameterCard
                label="Średnica zewn. gwintu gniazda (D_HC)"
                nominal={thread.holdingThread.D.nom}
                limits={{ min: thread.holdingThread.D.min, max: thread.holdingThread.D.nom }}
                unit="mm"
                tolClass="6H mod"
                digits={3}
              />
              <DiameterCard
                label="Średnica podziałowa gwintu gniazda (D2_HC)"
                nominal={thread.holdingThread.D2.nom}
                limits={{ min: thread.holdingThread.D2.min, max: thread.holdingThread.D2.max }}
                unit="mm"
                tolClass="6H mod"
                digits={3}
              />
              <DiameterCard
                label="Średnica wewn. otworu nagwintowanego (D1_HC)"
                nominal={thread.holdingThread.D1.nom}
                limits={{ min: thread.holdingThread.D1.min, max: thread.holdingThread.D1.max }}
                unit="mm"
                tolClass="6H mod"
                digits={3}
              />
              <PitchCard
                label="Skok gwintu (P)"
                pitch={effectivePitch}
                unit="mm"
              />
            </div>

            {/* Sekcja: Długości wkładki i głębokości montażu */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Długość wkładki i głębokości (DIN 8140-1)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAllLengths((v) => !v)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 cursor-pointer"
                >
                  {showAllLengths ? 'Ukryj tabelę' : 'Pokaż wszystkie (1.0d - 3.0d)'}
                </button>
              </div>

              {/* Wybór mnożnika długości */}
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                {(['1.0d', '1.5d', '2.0d', '2.5d', '3.0d'] as const).map((m) => {
                  const isActive = selectedMultiplier === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMultiplier(m)}
                      className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* Karty dla wybranej długości */}
              {activeLengthSpec && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AuxCard
                    label={`Długość wkładki L (${activeLengthSpec.multiplier})`}
                    value={activeLengthSpec.nominalLength}
                    unit="mm"
                    digits={2}
                    note="Długość w stanie zamontowanym"
                  />
                  <AuxCard
                    label="Min. głębokość gwintu (t2)"
                    value={activeLengthSpec.minThreadDepth}
                    unit="mm"
                    digits={2}
                    note="Głębokość naciętego gwintu roboczego"
                  />
                  <AuxCard
                    label="Min. głębokość wiercenia (t1)"
                    value={activeLengthSpec.minDrillDepth}
                    unit="mm"
                    digits={2}
                    note="Głębokość otworu pod gwintownik"
                  />
                </div>
              )}

              {/* Tabela zestawcza dla wszystkich długości */}
              {showAllLengths && (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 mt-3 p-3">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                        <th className="py-2 px-2.5">Oznaczenie</th>
                        <th className="py-2 px-2.5">Długość L</th>
                        <th className="py-2 px-2.5">Min. gwint t₂</th>
                        <th className="py-2 px-2.5">Min. wiercenie t₁</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {thread.lengths.map((len) => (
                        <tr
                          key={len.multiplier}
                          className={len.multiplier === selectedMultiplier ? 'bg-cyan-950/40 text-cyan-300 font-bold' : 'text-zinc-300'}
                        >
                          <td className="py-2 px-2.5 font-mono">{len.multiplier}</td>
                          <td className="py-2 px-2.5">{len.nominalLength.toFixed(2)} mm</td>
                          <td className="py-2 px-2.5">{len.minThreadDepth.toFixed(2)} mm</td>
                          <td className="py-2 px-2.5">{len.minDrillDepth.toFixed(2)} mm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <p className="text-zinc-500 text-xs text-center mt-5 leading-relaxed">
              Wymiary gwintu gniazda wg DIN 8140-2 · Tolerancja 6H mod (STI) · Wymiary montażowe wkładek wg DIN 8140-1 (Böllhoff HELICOIL® Plus).
            </p>
          </div>
        )}

        {(parsedD === null || effectivePitch === null) && (
          <p className="text-center text-zinc-500 py-10">
            {t('helicoil.emptyMessage', { defaultValue: 'Wpisz średnicę nominalną i wybierz skok, aby zobaczyć wymiary gniazda HeliCoil.' })}
          </p>
        )}
      </div>

      <ClearFab onClear={() => setSaved(INITIAL_STATE)} />
    </PageLayout>
  );
};

export default HelicoilThreadPage;
