import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
} from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type ThreadProfileType = 'metric' | 'trapezoidal' | 'acme' | 'whitworth' | 'custom';
type ThreadDirection = 'rh' | 'lh';
type FeedDirection = 'toChuck' | 'fromChuck';
type OperationType = 'external' | 'internal';

type Shape = {
  profile: ThreadProfileType;
  d: string;
  p: string;
  tpi: string;
  z: string;
  direction: ThreadDirection;
  feedDir: FeedDirection;
  operation: OperationType;
  pitchUnit: 'mm' | 'tpi';
};

const INITIAL: Shape = {
  profile: 'metric',
  d: '16',
  p: '2',
  tpi: '',
  z: '1',
  direction: 'rh',
  feedDir: 'toChuck',
  operation: 'external',
  pitchUnit: 'mm',
};

type QuickPreset = {
  label: string;
  profile: ThreadProfileType;
  d: string;
  p: string;
  z: string;
  pitchUnit: 'mm' | 'tpi';
  tpi?: string;
};

const QUICK_PRESETS: QuickPreset[] = [
  { label: 'M16×2', profile: 'metric', d: '16', p: '2', z: '1', pitchUnit: 'mm' },
  { label: 'M30×3.5', profile: 'metric', d: '30', p: '3.5', z: '1', pitchUnit: 'mm' },
  { label: 'Tr 20×4', profile: 'trapezoidal', d: '20', p: '4', z: '1', pitchUnit: 'mm' },
  { label: 'Tr 30×6', profile: 'trapezoidal', d: '30', p: '6', z: '1', pitchUnit: 'mm' },
  { label: 'Tr 40×14 (P7 2-zw.)', profile: 'trapezoidal', d: '40', p: '7', z: '2', pitchUnit: 'mm' },
  { label: '1"-8 UNC', profile: 'metric', d: '25.4', p: '', z: '1', pitchUnit: 'tpi', tpi: '8' },
  { label: 'G 1/2"', profile: 'whitworth', d: '20.95', p: '', z: '1', pitchUnit: 'tpi', tpi: '14' },
];

const ThreadHelixCalculator = () => {
  const { t } = useTranslation('threadsCalc');
  const { u } = useUnits();
  const { triggerLight, triggerSuccess } = useHaptics();

  const [inputs, setInputs, reset] = usePersistedState<Shape>('helix-calculator-v1', INITIAL);
  const [showTableGuide, setShowTableGuide] = useState(false);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInputs((s) => ({ ...s, [k]: e.target.value }));
  };

  const setProfile = (profile: ThreadProfileType) => {
    triggerLight();
    setInputs((s) => ({ ...s, profile }));
  };

  const setPitchUnit = (pitchUnit: 'mm' | 'tpi') => {
    triggerLight();
    setInputs((s) => ({ ...s, pitchUnit }));
  };

  const applyPreset = (preset: QuickPreset) => {
    triggerSuccess();
    setInputs((s) => ({
      ...s,
      profile: preset.profile,
      d: preset.d,
      p: preset.p,
      tpi: preset.tpi ?? '',
      z: preset.z,
      pitchUnit: preset.pitchUnit,
    }));
  };

  // Obliczenia parametrów linii śrubowej i płytki podporowej
  const result = useMemo(() => {
    const dVal = parseDecimal(inputs.d);
    if (!dVal || dVal <= 0) return null;

    let pVal = 0;
    if (inputs.pitchUnit === 'tpi') {
      const tpiVal = parseDecimal(inputs.tpi);
      if (!tpiVal || tpiVal <= 0) return null;
      pVal = 25.4 / tpiVal;
    } else {
      const parsedP = parseDecimal(inputs.p);
      if (!parsedP || parsedP <= 0) return null;
      pVal = parsedP;
    }

    const zVal = Math.max(1, Math.floor(parseDecimal(inputs.z) ?? 1));
    const lead = pVal * zVal;

    // Profil gwintu i kąt przyłożenia
    let profileAngle = 60;
    let d2 = dVal - 0.649519 * pVal;
    let d1 = dVal - 1.082532 * pVal;

    if (inputs.profile === 'trapezoidal') {
      profileAngle = 30;
      d2 = dVal - 0.5 * pVal;
      d1 = dVal - pVal - 0.5;
    } else if (inputs.profile === 'acme') {
      profileAngle = 29;
      d2 = dVal - 0.5 * pVal;
      d1 = dVal - pVal;
    } else if (inputs.profile === 'whitworth') {
      profileAngle = 55;
      d2 = dVal - 0.640327 * pVal;
      d1 = dVal - 1.280654 * pVal;
    }

    if (d2 <= 0) return null;

    // Obwód na średnicy podziałowej i kąt wzniosu (Lead Angle)
    const circumferenceD2 = Math.PI * d2;
    const tanLambda = lead / circumferenceD2;
    const lambdaDeg = (Math.atan(tanLambda) * 180) / Math.PI;

    const degPart = Math.floor(lambdaDeg);
    const minPart = Math.round((lambdaDeg - degPart) * 60);

    // Kąty na średnicy zewnętrznej i rdzenia
    const lambdaExt = (Math.atan(lead / (Math.PI * dVal)) * 180) / Math.PI;
    const lambdaCore = d1 > 0 ? (Math.atan(lead / (Math.PI * d1)) * 180) / Math.PI : null;

    // Znak kąta w zależności od kierunku gwintu i posuwu
    // Standard: RH, toChuck -> dodatni (+)
    // LH, toChuck -> ujemny (-)
    // RH, fromChuck -> ujemny (-)
    // LH, fromChuck -> dodatni (+)
    const isRh = inputs.direction === 'rh';
    const isToChuck = inputs.feedDir === 'toChuck';
    const isPositive = (isRh && isToChuck) || (!isRh && !isToChuck);
    const effectiveAngle = isPositive ? lambdaDeg : -lambdaDeg;

    // Uniwersalny dobór płytki podporowej (Shim Angle)
    let recommendedShim = 1.5;
    let shimDescription = '+1.5°';
    let isStandardFactoryOk = false;

    if (isPositive) {
      if (lambdaDeg < 0.5) {
        recommendedShim = 0.5;
        shimDescription = '+0.5°';
      } else if (lambdaDeg <= 1.8) {
        recommendedShim = 1.5;
        shimDescription = '+1.5° (Standard)';
        isStandardFactoryOk = true;
      } else if (lambdaDeg <= 2.5) {
        recommendedShim = 2.0;
        shimDescription = '+2.0° / +2.5°';
      } else if (lambdaDeg <= 3.5) {
        recommendedShim = 3.0;
        shimDescription = '+3.0° / +3.5°';
      } else if (lambdaDeg <= 4.5) {
        recommendedShim = 4.0;
        shimDescription = '+4.0° / +4.5°';
      } else {
        recommendedShim = 4.5;
        shimDescription = '+4.5° lub +5.0° (Duży wznios)';
      }
    } else {
      if (Math.abs(effectiveAngle) <= 1.0) {
        recommendedShim = -0.5;
        shimDescription = '-0.5°';
      } else if (Math.abs(effectiveAngle) <= 2.0) {
        recommendedShim = -1.5;
        shimDescription = '-1.5°';
      } else {
        recommendedShim = -2.5;
        shimDescription = '-2.5° / -3.0°';
      }
    }

    // Odchyłka od standardowej podkładki +1.5°
    const deltaFromStandard = Math.abs(effectiveAngle - 1.5);
    const flankDeviation = Math.abs(effectiveAngle - recommendedShim);

    // Kąty przyłożenia krawędzi płytki (profil half-angle)
    const halfProfile = profileAngle / 2;
    const nominalInsertClearance = 3.0; // standardowy luz krawędzi
    const leadingFlankClearance = Math.max(0, nominalInsertClearance - flankDeviation);
    const trailingFlankClearance = nominalInsertClearance + flankDeviation;

    const isFlankRisk = deltaFromStandard > 1.8;

    return {
      d: dVal,
      d2,
      d1,
      p: pVal,
      z: zVal,
      lead,
      circumferenceD2,
      lambdaDeg,
      degPart,
      minPart,
      lambdaExt,
      lambdaCore,
      effectiveAngle,
      isPositive,
      recommendedShim,
      shimDescription,
      isStandardFactoryOk,
      profileAngle,
      leadingFlankClearance,
      trailingFlankClearance,
      isFlankRisk,
    };
  }, [inputs]);

  return (
    <>
      <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start space-y-4 lg:space-y-0">
        {/* LEWA KOLUMNA: Formularz parametrów */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="glass-module space-y-4">
            {/* Szybkie presety popularnych gwintów */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">
                {t('helix.quickPresets')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((pst) => (
                  <button
                    key={pst.label}
                    type="button"
                    onClick={() => applyPreset(pst)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-xs font-mono text-zinc-300 border border-zinc-700/60 transition-colors"
                  >
                    {pst.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wybór profilu gwintu */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">
                {t('helix.threadType')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setProfile('metric')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    inputs.profile === 'metric'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                  }`}
                >
                  60° (M / UN)
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('trapezoidal')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    inputs.profile === 'trapezoidal'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                  }`}
                >
                  30° (Tr ISO)
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('acme')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    inputs.profile === 'acme'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                  }`}
                >
                  29° (ACME)
                </button>
                <button
                  type="button"
                  onClick={() => setProfile('whitworth')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    inputs.profile === 'whitworth'
                      ? 'bg-cyan-500 text-zinc-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                  }`}
                >
                  55° (Whitworth / G)
                </button>
              </div>
            </div>

            {/* Pola wejściowe: d, skok, krotność */}
            <div className="space-y-3 pt-1 border-t border-zinc-800/60">
              <InputField
                label={`${t('helix.diameterD')} [${u.length}]`}
                value={inputs.d}
                onChange={set('d')}
                placeholder="np. 30"
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400 font-medium">
                    {inputs.pitchUnit === 'mm' ? t('helix.pitchUnitMm') : t('helix.pitchUnitTpi')}
                  </label>
                  <div className="inline-flex rounded-lg bg-zinc-800/80 p-0.5 border border-zinc-700/60">
                    <button
                      type="button"
                      onClick={() => setPitchUnit('mm')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        inputs.pitchUnit === 'mm' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      mm
                    </button>
                    <button
                      type="button"
                      onClick={() => setPitchUnit('tpi')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        inputs.pitchUnit === 'tpi' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      TPI
                    </button>
                  </div>
                </div>

                {inputs.pitchUnit === 'mm' ? (
                  <InputField
                    label={t('helix.pitchP')}
                    value={inputs.p}
                    onChange={set('p')}
                    placeholder="np. 6"
                  />
                ) : (
                  <InputField
                    label={t('helix.pitchUnitTpi')}
                    value={inputs.tpi}
                    onChange={set('tpi')}
                    placeholder="np. 8"
                  />
                )}
              </div>

              {/* Krotność gwintu z */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium flex items-center justify-between">
                  <span>{t('helix.startsCount')}</span>
                  <span className="text-[11px] text-zinc-500">{t('helix.startsCountHelp')}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1', '2', '3', '4'].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setInputs((s) => ({ ...s, z: cnt }));
                      }}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                        inputs.z === cnt
                          ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                      }`}
                    >
                      {cnt === '1' ? '1 (Jednozwojny)' : `${cnt} (Wielozw.)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Opcje kierunku toczenia */}
            <div className="space-y-2.5 pt-1 border-t border-zinc-800/60 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 mb-1 block">{t('helix.direction')}</label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setInputs((s) => ({ ...s, direction: 'rh' }));
                      }}
                      className={`py-1 rounded text-center font-bold text-xs ${
                        inputs.direction === 'rh' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      RH (Prawy)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setInputs((s) => ({ ...s, direction: 'lh' }));
                      }}
                      className={`py-1 rounded text-center font-bold text-xs ${
                        inputs.direction === 'lh' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      LH (Lewy)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 mb-1 block">{t('helix.feedDir')}</label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setInputs((s) => ({ ...s, feedDir: 'toChuck' }));
                      }}
                      className={`py-1 rounded text-center font-bold text-xs ${
                        inputs.feedDir === 'toChuck' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      Do uchwytu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerLight();
                        setInputs((s) => ({ ...s, feedDir: 'fromChuck' }));
                      }}
                      className={`py-1 rounded text-center font-bold text-xs ${
                        inputs.feedDir === 'fromChuck' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      Od uchwytu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA: Wyniki i wizualizacja */}
        <div className="space-y-4">
          {/* Główna karta: Kąt wzniosu linii śrubowej */}
          <div className="glass-module relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-sm uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {t('helix.leadAngle')}
              </h2>
              {result && (
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  d₂ = {result.d2.toFixed(3)} mm
                </span>
              )}
            </div>

            <div className="py-4 text-center">
              {result ? (
                <div className="space-y-2">
                  <CopyableValue value={result.lambdaDeg.toFixed(2)}>
                    <div className="inline-flex items-baseline gap-2 cursor-pointer group">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-cyan-400 tracking-tight group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                        {result.lambdaDeg.toFixed(2)}°
                      </span>
                      <span className="text-lg font-bold text-zinc-400 font-mono">
                        ({result.degPart}° {result.minPart}')
                      </span>
                    </div>
                  </CopyableValue>
                  <p className="text-xs text-zinc-400 font-mono">
                    L = {result.lead.toFixed(3)} mm (skok wzniosu) · π·d₂ = {result.circumferenceD2.toFixed(2)} mm
                  </p>
                </div>
              ) : (
                <div className="py-6 text-zinc-400 text-sm">
                  Wprowadź średnicę d oraz skok P, aby obliczyć kąt linii śrubowej
                </div>
              )}
            </div>

            {/* Karta statusu płytki podporowej */}
            {result && (
              <div className="mt-3 p-3.5 rounded-xl border transition-all space-y-2 text-xs bg-zinc-900/90 border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.isStandardFactoryOk ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm text-zinc-100">
                        {t('helix.recommendedShim')}:{' '}
                        <span className="text-cyan-400 font-mono text-base ml-1">
                          {result.shimDescription}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      result.isStandardFactoryOk
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {result.isStandardFactoryOk ? 'Standard OK' : 'Wymiana zalecana'}
                  </span>
                </div>

                <p className="text-zinc-400 leading-relaxed text-xs">
                  {result.isStandardFactoryOk
                    ? t('helix.standardShimOkDesc')
                    : t('helix.shimChangeDesc')}
                </p>

                {/* Luzy przyłożenia boków profilu */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 block">{t('helix.leadingFlank')}</span>
                    <span
                      className={`text-sm font-bold font-mono mt-0.5 block ${
                        result.leadingFlankClearance < 1.0 ? 'text-rose-400' : 'text-zinc-200'
                      }`}
                    >
                      ~{result.leadingFlankClearance.toFixed(1)}° luzu
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400 block">{t('helix.trailingFlank')}</span>
                    <span className="text-sm font-bold font-mono text-zinc-200 mt-0.5 block">
                      ~{result.trailingFlankClearance.toFixed(1)}° luzu
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rysunek schematyczny rozwinięcia linii śrubowej SVG */}
          <div className="glass-module space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <span>Schemat geometryczny wzniosu</span>
              {result && (
                <span className="text-cyan-400 font-mono text-[11px]">
                  λ = {result.lambdaDeg.toFixed(2)}°
                </span>
              )}
            </h3>

            <div className="p-2">
              <svg viewBox="0 0 340 120" className="w-full h-auto mx-auto block select-none">
                {/* Linia odniesienia pozioma (obwód pi * d2) */}
                <line x1="30" y1="95" x2="310" y2="95" stroke="#3f3f46" strokeWidth="1.5" />
                <path d="M30 90 V100 M310 90 V100" stroke="#71717a" strokeWidth="1.5" />
                <text x="170" y="112" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  Obwód π · d₂ = {result ? result.circumferenceD2.toFixed(1) : 'π·d₂'} mm
                </text>

                {/* Linia pionowa (skok linii śrubowej L) */}
                <line x1="310" y1="95" x2="310" y2="25" stroke="#f59e0b" strokeWidth="2" />
                <path d="M305 25 H315" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="318" y="60" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  L = {result ? result.lead.toFixed(1) : 'L'}
                </text>

                {/* Przeciwprostokątna (linia śrubowa) */}
                <line x1="30" y1="95" x2="310" y2="25" stroke="#22d3ee" strokeWidth="2.5" />

                {/* Łuk kąta wzniosu lambda */}
                <path d="M90 95 A60 60 0 0 0 86 81" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                <text x="100" y="86" fill="#22d3ee" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  λ
                </text>

                {/* Wypełnienie trójkąta */}
                <polygon points="30,95 310,95 310,25" fill="#06b6d4" fillOpacity="0.08" />
              </svg>
            </div>
          </div>

          {/* Uniwersalna tabela doboru podkładek */}
          <div className="glass-module space-y-2">
            <button
              type="button"
              onClick={() => setShowTableGuide((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs text-zinc-300 font-semibold hover:text-white py-1"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                {t('helix.universalShimGuide')}
              </span>
              {showTableGuide ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {showTableGuide && (
              <div className="pt-2 text-xs text-zinc-400 space-y-2.5 border-t border-zinc-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider">
                        <th className="py-1.5 pr-2">Kąt wzniosu (λ)</th>
                        <th className="py-1.5 px-2">Podkładka</th>
                        <th className="py-1.5 pl-2">Zastosowanie / Opis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">&gt; 4.5°</td>
                        <td className="py-1.5 px-2 text-amber-400 font-bold">+4.5°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Bardzo strome gwinty, ślimaki, wielokrotne
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">3.5° – 4.5°</td>
                        <td className="py-1.5 px-2 text-amber-400 font-bold">+3.5° / +4.0°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Grube skoki trapezowe na średnich średnicach
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">2.5° – 3.5°</td>
                        <td className="py-1.5 px-2 text-cyan-300 font-bold">+2.5° / +3.0°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Śruby pociągowe Tr, skoki &gt; 4 mm
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">1.8° – 2.5°</td>
                        <td className="py-1.5 px-2 text-cyan-300 font-bold">+2.0°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Podwyższony wznios
                        </td>
                      </tr>
                      <tr className="bg-cyan-950/20 text-cyan-300">
                        <td className="py-1.5 pr-2 font-bold">0.8° – 1.8°</td>
                        <td className="py-1.5 px-2 font-bold">+1.5° (Fabryczna)</td>
                        <td className="py-1.5 pl-2 font-sans font-medium">
                          Standard w większości oprawek tokarskich
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">&lt; 0.8°</td>
                        <td className="py-1.5 px-2 text-zinc-200 font-bold">+0.5°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Drobne skoki na dużych średnicach
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 text-zinc-300">Kąt ujemny (-)</td>
                        <td className="py-1.5 px-2 text-rose-400 font-bold">-0.5° do -2.5°</td>
                        <td className="py-1.5 pl-2 text-zinc-400 font-sans">
                          Gwinty lewe lub toczenie od wrzeciona
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ClearFab onClear={reset} />
    </>
  );
};

export default ThreadHelixCalculator;
