import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  ArrowRight,
  X,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Ruler,
} from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type Shape = {
  n: string;
  c: string;
  d: string;
};

const INITIAL: Shape = {
  n: '6',
  c: '',
  d: '',
};

const QUICK_HOLE_COUNTS = [3, 4, 5, 6, 8, 10, 12, 16];

const PcdMeasureCalculator = () => {
  const { t } = useTranslation('milling');
  const { u } = useUnits();
  const navigate = useNavigate();
  const { triggerLight, triggerSuccess } = useHaptics();

  const [inputs, setInputs, reset] = usePersistedState<Shape>('pcd-measure-v1', INITIAL);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showUnzeroedHelper, setShowUnzeroedHelper] = useState(false);
  const [unzeroedLzew, setUnzeroedLzew] = useState('');
  const [unzeroedLwew, setUnzeroedLwew] = useState('');

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((s) => ({ ...s, [k]: e.target.value }));
  };

  const handleQuickN = (count: number) => {
    triggerLight();
    setInputs((s) => ({ ...s, n: String(count) }));
  };

  // Obliczenia matematyczne
  const calculations = useMemo(() => {
    const n = parseDecimal(inputs.n);
    const c = parseDecimal(inputs.c);
    const d = parseDecimal(inputs.d);

    if (!n || n < 3 || n > 200 || !c || c <= 0) {
      return null;
    }

    const count = Math.floor(n);
    const halfAngleDeg = 180 / count;
    const halfAngleRad = (halfAngleDeg * Math.PI) / 180;
    const sinVal = Math.sin(halfAngleRad);

    // Główny wzór: D = C / sin(180° / N)
    const pcd = c / sinVal;
    const radius = pcd / 2;
    const stepAngle = 360 / count;

    // Dodatkowe wymiary zależne od d
    const outerPcd = d !== null && d > 0 ? pcd + d : null;
    const innerPcd = d !== null && d > 0 ? Math.max(0, pcd - d) : null;
    const lzew = d !== null && d > 0 ? c + d : null;
    const lwew = d !== null && d > 0 ? Math.max(0, c - d) : null;

    // Przeciwległe otwory (dla N parzystych) lub maksymalny rozstaw (dla N nieparzystych)
    const isEven = count % 2 === 0;
    const maxSpan = isEven
      ? pcd
      : pcd * Math.sin(((Math.floor(count / 2) * 180) / count) * (Math.PI / 180));

    return {
      n: count,
      c,
      d: d !== null && d > 0 ? d : null,
      pcd,
      radius,
      stepAngle,
      halfAngleDeg,
      sinVal,
      outerPcd,
      innerPcd,
      lzew,
      lwew,
      isEven,
      maxSpan,
    };
  }, [inputs]);

  // Wstawienie wyliczonego C z pomocnika bez zerowania
  const applyUnzeroedC = () => {
    const dVal = parseDecimal(inputs.d);
    const lzewVal = parseDecimal(unzeroedLzew);
    const lwewVal = parseDecimal(unzeroedLwew);

    let calculatedC: number | null = null;
    if (lzewVal !== null && dVal !== null && dVal > 0) {
      calculatedC = lzewVal - dVal;
    } else if (lwewVal !== null && dVal !== null && dVal > 0) {
      calculatedC = lwewVal + dVal;
    }

    if (calculatedC !== null && calculatedC > 0) {
      triggerSuccess();
      setInputs((s) => ({ ...s, c: calculatedC!.toFixed(3) }));
      setShowUnzeroedHelper(false);
    }
  };

  // Nawigacja do kalkulatora współrzędnych PCD
  const handleGoToCoords = () => {
    triggerLight();
    if (calculations) {
      navigate(`/pcd?d=${calculations.pcd.toFixed(3)}&n=${calculations.n}`);
    } else {
      const n = parseDecimal(inputs.n);
      navigate(`/pcd${n ? `?n=${Math.floor(n)}` : ''}`);
    }
  };

  // Wizualizacja SVG
  const R_SVG = 68;
  const svgHoles = useMemo(() => {
    const count = calculations?.n ?? Math.min(Math.max(Math.floor(parseDecimal(inputs.n) ?? 6), 3), 36);
    return Array.from({ length: count }, (_, i) => {
      const angle = -90 + i * (360 / count);
      const rad = (angle * Math.PI) / 180;
      return {
        i: i + 1,
        angle,
        x: R_SVG * Math.cos(rad),
        y: R_SVG * Math.sin(rad),
        isFirst: i === 0,
        isSecond: i === 1,
      };
    });
  }, [calculations?.n, inputs.n]);

  return (
    <>
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start space-y-4 lg:space-y-0">
        {/* LEWA KOLUMNA: Dane wejściowe */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="glass-module space-y-4">
            {/* Przycisk otwierający Instrukcję Pomiaru */}
            <button
              type="button"
              onClick={() => {
                triggerLight();
                setIsGuideOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-semibold text-xs uppercase tracking-wider transition-all hover:bg-cyan-500/20 active:scale-98 group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{t('pcdMeasure.instructionsBtn')}</span>
              </div>
              <span className="text-[11px] bg-cyan-400/20 px-2 py-0.5 rounded-full text-cyan-300 font-mono">
                Krok po kroku
              </span>
            </button>

            {/* Szybki wybór liczby otworów N */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                <span>{t('pcdMeasure.n')}</span>
                <span className="text-[11px] text-zinc-500">{t('pcdMeasure.quickN')}</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-1.5">
                {QUICK_HOLE_COUNTS.map((cnt) => {
                  const isSelected = inputs.n === String(cnt);
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleQuickN(cnt)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/60'
                      }`}
                    >
                      {cnt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pola formularza */}
            <div className="space-y-3 pt-1">
              <InputField
                label={t('pcdMeasure.n')}
                value={inputs.n}
                onChange={set('n')}
                inputMode="numeric"
                placeholder="np. 6"
              />

              <div className="space-y-1">
                <InputField
                  label={`${t('pcdMeasure.c')} [${u.length}]`}
                  value={inputs.c}
                  onChange={set('c')}
                  placeholder="np. 50.00"
                />
                <p className="text-[11px] text-zinc-400 flex items-center gap-1 px-1">
                  <Ruler className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{t('pcdMeasure.cHelp')}</span>
                </p>
              </div>

              <InputField
                label={`${t('pcdMeasure.d')} [${u.length}]`}
                value={inputs.d}
                onChange={set('d')}
                placeholder="np. 10.00"
              />
            </div>

            {/* Pomocnik dla suwmiarki tradycyjnej (bez zerowania) */}
            <div className="pt-1 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => setShowUnzeroedHelper((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 py-1"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80" />
                  {t('pcdMeasure.unzeroedTitle')}
                </span>
                {showUnzeroedHelper ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {showUnzeroedHelper && (
                <div className="mt-2.5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs">
                  <p className="text-zinc-400 leading-relaxed">
                    {t('pcdMeasure.unzeroedDesc')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      label={`${t('pcdMeasure.unzeroedLzew')} [${u.length}]`}
                      value={unzeroedLzew}
                      onChange={(e) => setUnzeroedLzew(e.target.value)}
                      placeholder="Lzew"
                    />
                    <InputField
                      label={`${t('pcdMeasure.unzeroedLwew')} [${u.length}]`}
                      value={unzeroedLwew}
                      onChange={(e) => setUnzeroedLwew(e.target.value)}
                      placeholder="Lwew"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyUnzeroedC}
                    disabled={(!unzeroedLzew && !unzeroedLwew) || !inputs.d}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-cyan-400 text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t('pcdMeasure.applyC')}
                  </button>
                </div>
              )}
            </div>

            {/* Przycisk przejścia do kalkulatora PCD */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToCoords}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-sky-400 active:scale-98 transition-all"
              >
                <span>{t('pcdMeasure.goToCoords')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: Wyniki i wizualizacja */}
        <div className="space-y-4">
          {/* Główna karta wyniku PCD */}
          <div className="glass-module relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-sm uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {t('pcdMeasure.pcd')}
              </h2>
              {calculations && (
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  N = {calculations.n}
                </span>
              )}
            </div>

            <div className="py-4 text-center">
              {calculations ? (
                <div className="space-y-2">
                  <CopyableValue value={calculations.pcd.toFixed(3)}>
                    <div className="inline-flex items-baseline gap-2 cursor-pointer group">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-cyan-400 tracking-tight group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                        {calculations.pcd.toFixed(3)}
                      </span>
                      <span className="text-lg font-bold text-zinc-400 uppercase font-mono">
                        {u.length}
                      </span>
                    </div>
                  </CopyableValue>
                  <p className="text-xs text-zinc-400 font-mono">
                    D = {calculations.c.toFixed(3)} / sin({calculations.halfAngleDeg.toFixed(2)}°)
                  </p>
                </div>
              ) : (
                <div className="py-6 text-zinc-400 text-sm">
                  Wprowadź liczbę otworów N oraz rozstaw C, aby wyznaczyć średnicę PCD
                </div>
              )}
            </div>

            {/* Siatka parametrów pochodnych */}
            {calculations && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-zinc-800/80">
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400">{t('pcdMeasure.radius')} (R)</div>
                  <div className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                    {calculations.radius.toFixed(3)}{' '}
                    <span className="text-xs text-zinc-400">{u.length}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400">{t('pcdMeasure.angle')} (α)</div>
                  <div className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                    {calculations.stepAngle.toFixed(2)}°
                  </div>
                </div>

                {calculations.isEven ? (
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="text-[11px] text-zinc-400">{t('pcdMeasure.oppositeHoles')}</div>
                    <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                      {calculations.pcd.toFixed(3)}{' '}
                      <span className="text-xs text-zinc-400">{u.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <div className="text-[11px] text-zinc-400">{t('pcdMeasure.maxSpan')}</div>
                    <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                      {calculations.maxSpan.toFixed(3)}{' '}
                      <span className="text-xs text-zinc-400">{u.length}</span>
                    </div>
                  </div>
                )}

                {calculations.d && (
                  <>
                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-400">{t('pcdMeasure.outerPcd')}</div>
                      <div className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                        {calculations.outerPcd?.toFixed(3)}{' '}
                        <span className="text-xs text-zinc-400">{u.length}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-400">{t('pcdMeasure.innerPcd')}</div>
                      <div className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                        {calculations.innerPcd?.toFixed(3)}{' '}
                        <span className="text-xs text-zinc-400">{u.length}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] text-zinc-400">Krawędzie zewn. (Lzew)</div>
                      <div className="text-base font-bold text-zinc-200 font-mono mt-0.5">
                        {calculations.lzew?.toFixed(3)}{' '}
                        <span className="text-xs text-zinc-400">{u.length}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interaktywny podgląd graficzny SVG */}
          <div className="glass-module space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                {t('pcd.preview')}
              </h3>
              <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {t('pcdMeasure.measuringPair')}: 1 — 2
              </span>
            </div>

            <div className="p-2 flex items-center justify-center">
              <svg
                viewBox="-100 -100 200 200"
                className="w-full max-w-[280px] sm:max-w-xs mx-auto block select-none"
              >
                {/* Osie środkowe */}
                <line x1="-95" y1="0" x2="95" y2="0" stroke="#27272a" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="0" y1="-95" x2="0" y2="95" stroke="#27272a" strokeWidth="1" strokeDasharray="4 3" />

                {/* Okrąg podziałowy PCD */}
                <circle
                  cx="0"
                  cy="0"
                  r={R_SVG}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.65"
                />

                {/* Cięciwa C między otworem 1 a otworem 2 */}
                {svgHoles.length >= 2 && (
                  <g>
                    <line
                      x1={svgHoles[0].x}
                      y1={svgHoles[0].y}
                      x2={svgHoles[1].x}
                      y2={svgHoles[1].y}
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Etykieta C */}
                    <text
                      x={(svgHoles[0].x + svgHoles[1].x) / 2 + 10}
                      y={(svgHoles[0].y + svgHoles[1].y) / 2 - 6}
                      fill="#f59e0b"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      C
                    </text>
                  </g>
                )}

                {/* Otwory podziałowe */}
                {svgHoles.map((h) => {
                  const isPair = h.isFirst || h.isSecond;
                  return (
                    <g key={h.i}>
                      <circle
                        cx={h.x}
                        cy={h.y}
                        r={isPair ? '7' : '5'}
                        fill={isPair ? '#0e7490' : '#18181b'}
                        stroke={isPair ? '#22d3ee' : '#52525b'}
                        strokeWidth={isPair ? '2' : '1.5'}
                      />
                      <text
                        x={h.x * 1.25}
                        y={h.y * 1.25 + 3}
                        fill={isPair ? '#38bdf8' : '#71717a'}
                        fontSize="8.5"
                        fontWeight={isPair ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {h.i}
                      </text>
                    </g>
                  );
                })}

                {/* Krzyżyk w środku okręgu */}
                <path d="M-6 0 H6 M0 -6 V6" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL INSTRUKCJI POMIARU */}
      {isGuideOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsGuideOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Nagłówek modalu */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">
                      {t('pcdMeasure.instructionsTitle')}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {t('pcdMeasure.instructionsSubtitle')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  aria-label="Zamknij"
                  className="-m-1 rounded-lg p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Rysunek poglądowy techniki pomiaru */}
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-3">
                <svg viewBox="0 0 320 110" className="w-full h-auto mx-auto block">
                  {/* Linia odniesienia osi */}
                  <line x1="20" y1="55" x2="300" y2="55" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 3" />

                  {/* Otwór 1 (lewy, środek w 100, 55, r=22) */}
                  <circle cx="100" cy="55" r="22" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M92 55 H108 M100 47 V63" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Otwór 2 (prawy, środek w 220, 55, r=22) */}
                  <circle cx="220" cy="55" r="22" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M212 55 H228 M220 47 V63" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Wymiar rozstawu środków C */}
                  <line x1="100" y1="55" x2="100" y2="18" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="220" y1="55" x2="220" y2="18" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="100" y1="22" x2="220" y2="22" stroke="#f59e0b" strokeWidth="1.75" />
                  <path d="M106 18.5 L100 22 L106 25.5 M214 18.5 L220 22 L214 25.5" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <text x="160" y="16" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Rozstaw środków C
                  </text>

                  {/* Szczęki suwmiarki na krawędziach zewnętrznych (78 i 242) */}
                  <path d="M78 40 V85 M78 85 H66" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M242 40 V85 M242 85 H254" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="78" y1="92" x2="242" y2="92" stroke="#22d3ee" strokeWidth="1.5" />
                  <path d="M84 88.5 L78 92 L84 95.5 M236 88.5 L242 92 L236 95.5" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <text x="160" y="105" fill="#22d3ee" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                    Pomiar krawędzi zewn. po wyzerowaniu na d = C
                  </text>
                </svg>
              </div>

              {/* 4 Kroki instrukcji */}
              <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-100">
                      {t('pcdMeasure.step1Title')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('pcdMeasure.step1Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-100">
                      {t('pcdMeasure.step2Title')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('pcdMeasure.step2Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-cyan-300">
                      {t('pcdMeasure.step3Title')}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {t('pcdMeasure.step3Desc')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-100">
                      {t('pcdMeasure.step4Title')}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t('pcdMeasure.step4Desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wskazówka warsztatowa */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300/90 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>{t('pcdMeasure.caliperTipTitle')}</span>
                </div>
                <p className="leading-relaxed text-amber-200/80">
                  {t('pcdMeasure.caliperTipDesc')}
                </p>
              </div>

              {/* Przycisk zamknięcia */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
              >
                {t('pcdMeasure.closeGuide')}
              </button>
            </div>
          </div>,
          document.body,
        )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default PcdMeasureCalculator;
