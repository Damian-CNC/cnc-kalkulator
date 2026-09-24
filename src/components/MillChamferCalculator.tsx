import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import ChamferDiagram from '@/components/ChamferDiagram';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type Inputs = { holeD: string; chamfer: string; toolD: string; angle: string; safety: string };

const INITIAL: Inputs = { holeD: '', chamfer: '', toolD: '', angle: '45', safety: '' };

const ANGLE_PRESETS = [30, 45, 60];

const fmt = (n: number) => n.toFixed(3);

const MillChamferCalculator = () => {
  const { t } = useTranslation('chamfer');
  const { u, isImperial } = useUnits();
  const { triggerLight } = useHaptics();
  const [inputs, setInputs, reset] = usePersistedState<Inputs>('mill-chamfer', INITIAL);

  const defaultSafety = isImperial ? 0.02 : 0.5;

  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const angleValue = parseDecimal(inputs.angle);
  const angleInvalid = inputs.angle.trim() !== '' && (angleValue === null || angleValue <= 0 || angleValue >= 90);

  const calc = useMemo(() => {
    const D = parseDecimal(inputs.holeD);
    const c = parseDecimal(inputs.chamfer);
    const alpha = parseDecimal(inputs.angle);
    if (!D || D <= 0 || !c || c <= 0 || !alpha || alpha <= 0 || alpha >= 90) return null;

    const s = Math.max(0, parseDecimal(inputs.safety) ?? defaultSafety);
    const toolD = parseDecimal(inputs.toolD);

    const tanA = Math.tan((alpha * Math.PI) / 180);
    const R = D / 2;
    const h = c / tanA; // głębokość samej fazy (pionowo)
    const Z = h + s; // zejście czubka narzędzia
    const eRaw = R - s * tanA; // promień toru osi narzędzia
    const e = Math.max(0, eRaw);
    const requiredToolD = 2 * (c + s * tanA); // średnica robocza narzędzia na poziomie powierzchni
    const maxChamfer = toolD ? toolD / 2 - s * tanA : null;
    const toolTooSmall = toolD !== null && toolD > 0 && toolD + 1e-9 < requiredToolD;
    const safetyMax = R / tanA;

    return {
      D, c, alpha, s, toolD, R, h, Z, e,
      requiredToolD,
      maxChamfer,
      toolTooSmall,
      safetyTooBig: eRaw < 0,
      safetyMax,
      topDia: D + 2 * c,
    };
  }, [inputs, defaultSafety]);

  const unit = u.length;
  const withUnit = (n: number) => `${fmt(n)} ${unit}`;

  return (
    <>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-4">
          <InputField label={`${t('inputs.holeD')} [${unit}]`} value={inputs.holeD} onChange={set('holeD')} />
          <InputField label={`${t('inputs.chamfer')} [${unit}]`} value={inputs.chamfer} onChange={set('chamfer')} />
          <InputField label={`${t('inputs.toolD')} [${unit}]`} value={inputs.toolD} onChange={set('toolD')} />
          <InputField
            label={`${t('inputs.safety')} [${unit}]`}
            value={inputs.safety}
            onChange={set('safety')}
            placeholder={String(defaultSafety)}
          />
        </div>

        <div className="mt-4">
          <InputField label={`${t('inputs.angle')} [°]`} value={inputs.angle} onChange={set('angle')} />
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ANGLE_PRESETS.map((a) => {
              const active = angleValue === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    triggerLight();
                    setInputs((s) => ({ ...s, angle: String(a) }));
                  }}
                  aria-pressed={active}
                  className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-colors active:scale-95 ${
                    active
                      ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {a}° <span className="text-xs font-normal text-zinc-500">({a * 2}°)</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500">{t('inputs.angleHint')}</p>
          {angleInvalid && (
            <p role="alert" className="mt-2 text-xs text-amber-400">{t('warnings.invalidAngle')}</p>
          )}
        </div>
      </div>

      {calc ? (
        <>
          {calc.toolTooSmall && calc.maxChamfer !== null && (
            <div role="alert" className="glass-module border-amber-500/40 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-200">
                  {t('warnings.toolTooSmall', {
                    required: withUnit(calc.requiredToolD),
                    tool: withUnit(calc.toolD ?? 0),
                    max: withUnit(Math.max(0, calc.maxChamfer)),
                  })}
                </p>
              </div>
            </div>
          )}

          {calc.safetyTooBig && (
            <div role="alert" className="glass-module border-amber-500/40 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-200">
                  {t('warnings.safetyTooBig', { max: withUnit(calc.safetyMax) })}
                </p>
              </div>
            </div>
          )}

          <div className="glass-module">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-400">{t('results.title')}</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/15 text-xs font-bold text-amber-300">Z</span>
                  <p className="text-sm font-medium text-cyan-300">{t('results.depth')}</p>
                </div>
                <p className="text-3xl font-black text-cyan-400">
                  <CopyableValue value={`-${fmt(calc.Z)}`}>−{fmt(calc.Z)}</CopyableValue>{' '}
                  <span className="text-sm font-normal text-zinc-500">{unit}</span>
                </p>
                <p className="mt-1.5 text-xs text-cyan-600">
                  {t('results.depthNote', { h: fmt(calc.h), s: fmt(calc.s) })}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/15 text-xs font-bold text-amber-300">e</span>
                  <p className="text-sm font-medium text-cyan-300">{t('results.offset')}</p>
                </div>
                <p className="text-3xl font-black text-cyan-400">
                  <CopyableValue value={fmt(calc.e)}>{fmt(calc.e)}</CopyableValue>{' '}
                  <span className="text-sm font-normal text-zinc-500">{unit}</span>
                </p>
                <p className="mt-1.5 text-xs text-cyan-600">
                  {t('results.offsetNote', { d: withUnit(calc.e * 2) })}
                </p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-zinc-800 text-sm">
              <div className="flex items-center justify-between py-2">
                <dt className="text-zinc-400">{t('results.topDia')}</dt>
                <dd className="font-bold tabular-nums text-zinc-100">
                  <CopyableValue value={fmt(calc.topDia)}>{fmt(calc.topDia)}</CopyableValue> {unit}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-zinc-400">{t('results.chamferDepth')}</dt>
                <dd className="font-bold tabular-nums text-zinc-100">
                  <CopyableValue value={fmt(calc.h)}>{fmt(calc.h)}</CopyableValue> {unit}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-zinc-400">{t('results.reqTool')}</dt>
                <dd className={`font-bold tabular-nums ${calc.toolTooSmall ? 'text-amber-400' : 'text-zinc-100'}`}>
                  <CopyableValue value={fmt(calc.requiredToolD)}>{fmt(calc.requiredToolD)}</CopyableValue> {unit}
                </dd>
              </div>
            </dl>

            {calc.toolD && !calc.toolTooSmall && (
              <p className="mt-3 flex items-start gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {t('status.toolOk', { used: withUnit(calc.requiredToolD), tool: withUnit(calc.toolD) })}
              </p>
            )}
            {!calc.toolD && (
              <p className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {t('status.toolMissing')}
              </p>
            )}
          </div>

          <div className="glass-module">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-400">{t('diagramTitle')}</h2>
            <ChamferDiagram
              R={calc.R}
              w={calc.c}
              h={calc.h}
              Z={calc.Z}
              e={calc.e}
              alpha={calc.alpha}
              warn={calc.toolTooSmall}
            />
          </div>

          <p className="px-2 text-center text-xs text-zinc-600">{t('note')}</p>
        </>
      ) : (
        <p className="py-10 text-center text-zinc-500">{t('empty')}</p>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default MillChamferCalculator;
