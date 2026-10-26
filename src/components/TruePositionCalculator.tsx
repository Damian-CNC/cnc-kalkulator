import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Target, Info } from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type Shape = {
  xNom: string;
  yNom: string;
  xAct: string;
  yAct: string;
  tol: string;
  mmcMin: string;
  mmcAct: string;
};

const INITIAL: Shape = {
  xNom: '',
  yNom: '',
  xAct: '',
  yAct: '',
  tol: '',
  mmcMin: '',
  mmcAct: '',
};

interface ResultData {
  dx: number;
  dy: number;
  tp: number;
  bonus: number;
  allowed: number | null;
  pass: boolean | null;
  margin: number | null;
}

const TruePositionPlot = ({
  result,
  unit,
}: {
  result: ResultData | null;
  unit: string;
}) => {
  const { t } = useTranslation('milling');

  // Skalowanie współrzędnych do siatki SVG (promień strefy tolerancji to R=55 w jednostkach SVG)
  const plotData = useMemo(() => {
    if (!result) return null;
    const { dx, dy, tp, allowed } = result;

    // Odniesienie skali: strefa tolerancji (allowed/2) lub promień odchyłki (tp/2)
    const refRadius = Math.max((allowed ?? tp) / 2, tp / 2, 0.001);
    const scale = 55 / refRadius;

    // Współrzędne na płaszczyźnie SVG (-100 do 100), odwrócona oś Y w SVG
    const rawPx = dx * scale;
    const rawPy = -dy * scale;

    // Ograniczenie punktu, aby nie wychodził poza widok tarczy
    const dist = Math.sqrt(rawPx * rawPx + rawPy * rawPy);
    const maxR = 85;
    const clampedPx = dist > maxR ? (rawPx / dist) * maxR : rawPx;
    const clampedPy = dist > maxR ? (rawPy / dist) * maxR : rawPy;

    // Rzeczywisty promień True Position na tarczy
    const tpRadiusOnPlot = (tp / 2) * scale;
    const clampedTpRadius = Math.min(tpRadiusOnPlot, maxR);

    return {
      px: clampedPx,
      py: clampedPy,
      isClamped: dist > maxR,
      tpRadiusOnPlot: clampedTpRadius,
    };
  }, [result]);

  const isPass = result?.pass ?? true;

  return (
    <div className="glass-module flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2 pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            {t('tp.plotTitle', { defaultValue: 'Wizualizacja odchyłki (CMM Target)' })}
          </span>
        </div>
        {result?.allowed !== null && result?.allowed !== undefined && (
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              isPass
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}
          >
            ⌀ Tol: {result.allowed.toFixed(4)} {unit}
          </span>
        )}
      </div>

      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center select-none py-1">
        <svg
          viewBox="-100 -100 200 200"
          className="w-full h-full overflow-visible font-mono"
        >
          {/* Tło tarczy */}
          <circle cx="0" cy="0" r="95" className="fill-zinc-950/80 stroke-zinc-800/80" strokeWidth="1.5" />

          {/* Koncentryczne pierścienie siatki */}
          <circle cx="0" cy="0" r="25" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="0" cy="0" r="50" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="0" cy="0" r="75" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="2 3" />

          {/* Osie współrzędnych X i Y */}
          <line x1="-95" y1="0" x2="95" y2="0" stroke="#3f3f46" strokeWidth="1.25" strokeDasharray="6 3 1.5 3" />
          <line x1="0" y1="-95" x2="0" y2="95" stroke="#3f3f46" strokeWidth="1.25" strokeDasharray="6 3 1.5 3" />

          {/* Etykiety osi */}
          <text x="86" y="-4" fill="#71717a" fontSize="7" fontWeight="bold">+X</text>
          <text x="-94" y="-4" fill="#71717a" fontSize="7" fontWeight="bold">-X</text>
          <text x="4" y="-86" fill="#71717a" fontSize="7" fontWeight="bold">+Y</text>
          <text x="4" y="93" fill="#71717a" fontSize="7" fontWeight="bold">-Y</text>

          {/* Punkt nominalny (0,0) */}
          <circle cx="0" cy="0" r="2" fill="#06b6d4" />
          <text x="3" y="11" fill="#06b6d4" fontSize="6" fontWeight="bold">0,0 (NOM)</text>

          {/* Okrąg strefy tolerancji (R=55) */}
          {result?.allowed !== null && result?.allowed !== undefined ? (
            <g>
              <circle
                cx="0"
                cy="0"
                r="55"
                className={isPass ? 'fill-emerald-500/10 stroke-emerald-400' : 'fill-red-500/10 stroke-red-400'}
                strokeWidth="1.75"
                strokeDasharray="4 2"
              />
            </g>
          ) : (
            <circle cx="0" cy="0" r="55" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          )}

          {/* Wynik: wektor odchyłki i punkt rzeczywisty */}
          {plotData && result && (
            <g>
              {/* Okrąg True Position odchyłki */}
              <circle
                cx="0"
                cy="0"
                r={plotData.tpRadiusOnPlot}
                fill="none"
                stroke={isPass ? '#34d399' : '#f87171'}
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />

              {/* Linia wektora odchyłki od środka (0,0) do punktu (px, py) */}
              <line
                x1="0"
                y1="0"
                x2={plotData.px}
                y2={plotData.py}
                stroke={isPass ? '#34d399' : '#f87171'}
                strokeWidth="1.5"
              />

              {/* Płonący punkt rzeczywisty */}
              <circle
                cx={plotData.px}
                cy={plotData.py}
                r="6"
                className={isPass ? 'fill-emerald-400/30' : 'fill-red-400/30'}
              />
              <circle
                cx={plotData.px}
                cy={plotData.py}
                r="3"
                className={isPass ? 'fill-emerald-400' : 'fill-red-400'}
              />

              {/* Etykieta przy punkcie */}
              <g transform={`translate(${plotData.px + (plotData.px >= 0 ? 5 : -5)}, ${plotData.py + (plotData.py >= 0 ? 10 : -5)})`}>
                <rect
                  x={plotData.px >= 0 ? 0 : -50}
                  y="-8"
                  width="50"
                  height="12"
                  rx="2"
                  className="fill-zinc-900/90 stroke-zinc-700/80"
                  strokeWidth="0.5"
                />
                <text
                  x={plotData.px >= 0 ? 4 : -46}
                  y="0"
                  fill="#f4f4f5"
                  fontSize="5.5"
                  fontWeight="bold"
                >
                  ACT ({result.dx >= 0 ? '+' : ''}{result.dx.toFixed(3)}, {result.dy >= 0 ? '+' : ''}{result.dy.toFixed(3)})
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Informacja w centrum, gdy kalkulator jest pusty */}
        {!result && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/85 backdrop-blur-md rounded-xl border border-zinc-700/60 text-center pointer-events-none shadow-lg">
            <p className="text-xs font-semibold text-zinc-200">
              {t('tp.waitingInputs', { defaultValue: 'Wprowadź współrzędne nominalne i rzeczywiste' })}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              {t('tp.waitingHint', { defaultValue: 'Wektor odchyłki oraz strefa tolerancji pojawią się na tarczy.' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const TruePositionCalculator = () => {
  const { t } = useTranslation('milling');
  const { u } = useUnits();
  const [inputs, setInputs, reset] = usePersistedState<Shape>('true-position', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const result = useMemo<ResultData | null>(() => {
    const xNom = parseDecimal(inputs.xNom);
    const yNom = parseDecimal(inputs.yNom);
    const xAct = parseDecimal(inputs.xAct);
    const yAct = parseDecimal(inputs.yAct);
    if (xNom === null || yNom === null || xAct === null || yAct === null) return null;

    const dx = xAct - xNom;
    const dy = yAct - yNom;
    const tp = 2 * Math.sqrt(dx * dx + dy * dy);

    const tol = parseDecimal(inputs.tol);
    const mmcMin = parseDecimal(inputs.mmcMin);
    const mmcAct = parseDecimal(inputs.mmcAct);
    const bonus =
      mmcMin !== null && mmcAct !== null && mmcAct > mmcMin ? mmcAct - mmcMin : 0;
    const allowed = tol !== null ? tol + bonus : null;

    return {
      dx,
      dy,
      tp,
      bonus,
      allowed,
      pass: allowed !== null ? tp <= allowed : null,
      margin: allowed !== null ? allowed - tp : null,
    };
  }, [inputs]);

  return (
    <>
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 items-start space-y-4 lg:space-y-0 w-full">
        {/* Lewa kolumna: Pola wejściowe */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">{t('tp.nominal')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <InputField label={`X nom [${u.length}]`} value={inputs.xNom} onChange={set('xNom')} />
              <InputField label={`Y nom [${u.length}]`} value={inputs.yNom} onChange={set('yNom')} />
            </div>
          </div>

          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">{t('tp.actual')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <InputField label={`X act [${u.length}]`} value={inputs.xAct} onChange={set('xAct')} />
              <InputField label={`Y act [${u.length}]`} value={inputs.yAct} onChange={set('yAct')} />
            </div>
          </div>

          <div className="glass-module">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">{t('tp.tolerance')}</h2>
            <InputField label={`⌀ tol [${u.length}]`} value={inputs.tol} onChange={set('tol')} />

            <div className="mt-4 pt-3 border-t border-zinc-800/60">
              <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-wider">{t('tp.mmc')}</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label={`${t('tp.mmcMin')} [${u.length}]`}
                  value={inputs.mmcMin}
                  onChange={set('mmcMin')}
                />
                <InputField
                  label={`${t('tp.mmcAct')} [${u.length}]`}
                  value={inputs.mmcAct}
                  onChange={set('mmcAct')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prawa kolumna: Wizualizacja CMM + Wyniki numeryczne */}
        <div className="space-y-4">
          {/* Tarcza CMM Target */}
          <TruePositionPlot result={result} unit={u.length} />

          {/* Szczegółowe wyniki obliczeń */}
          {result ? (
            <div className="glass-module space-y-4">
              <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">{t('tp.result')}</h2>

              {/* Status Zgodności PASS / FAIL */}
              {result.pass !== null && (
                <div
                  className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-all ${
                    result.pass
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}
                >
                  {result.pass ? (
                    <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="w-7 h-7 shrink-0 text-red-400" />
                  )}
                  <div>
                    <div className="font-black text-lg tracking-wider uppercase">
                      {result.pass ? t('tp.pass') : t('tp.fail')}
                    </div>
                    <div className="text-xs opacity-90 font-mono">
                      {t('tp.margin')}: {result.margin! > 0 ? '+' : ''}
                      {result.margin!.toFixed(4)} {u.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Główny wynik True Position */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-inner">
                <div className="text-xs uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                  <span>{t('tp.tp')} ⌀</span>
                  {result.allowed !== null && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      {t('tp.allowed')}: {result.allowed.toFixed(4)} {u.length}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-extrabold text-cyan-400 tabular-nums">
                  {result.tp.toFixed(4)} <span className="text-base font-normal text-zinc-400">{u.length}</span>
                </div>
              </div>

              {/* Odchyłki składowe Delta X i Delta Y */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">ΔX (Act - Nom)</div>
                  <div className="text-xl font-bold text-zinc-200 tabular-nums font-mono">
                    {result.dx >= 0 ? '+' : ''}{result.dx.toFixed(4)}
                  </div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">ΔY (Act - Nom)</div>
                  <div className="text-xl font-bold text-zinc-200 tabular-nums font-mono">
                    {result.dy >= 0 ? '+' : ''}{result.dy.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Premia MMC (Bonus Tolerance) */}
              {result.bonus > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs">
                  <span className="text-cyan-300 font-medium">{t('tp.bonus')} (MMC):</span>
                  <span className="text-cyan-400 font-bold font-mono text-sm">
                    +{result.bonus.toFixed(4)} {u.length}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Moduł pomocy / objaśnień, gdy brak wyników */
            <div className="glass-module text-zinc-400 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold uppercase tracking-wider pb-1.5 border-b border-zinc-800/60">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>{t('tp.formulaInfo', { defaultValue: 'Formuła True Position' })}</span>
              </div>
              <p className="leading-relaxed">
                Pozycja rzeczywista (True Position wg ASME Y14.5 / ISO 1101) definiuje cylindryczną lub kołową strefę tolerancji środka elementu:
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-cyan-300 text-center font-bold">
                TP = 2 × √(ΔX² + ΔY²)
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Gdy uwzględniono warunek maksimum materiału (MMC Ⓜ), do bazowej tolerancji dodawana jest premia bonusowa równa odchyłce wymiaru od stanu MMC.
              </p>
            </div>
          )}
        </div>
      </div>

      <ClearFab onClear={reset} />
    </>
  );
};

export default TruePositionCalculator;
