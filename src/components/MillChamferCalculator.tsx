import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import ChamferDiagram from '@/components/ChamferDiagram';
import InfoPopover from '@/components/InfoPopover';
import { Switch } from '@/components/ui/switch';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type ToolMode = 'chamfer' | 'endmill';
type PathMode = 'center' | 'comp';

type Inputs = {
  holeD: string;
  chamfer: string;
  toolD: string;
  angle: string;
  safety: string;
  toolMode: ToolMode;
  pathMode: PathMode;
  tableDia: string;
};

const INITIAL: Inputs = {
  holeD: '',
  chamfer: '',
  toolD: '',
  angle: '45',
  safety: '',
  toolMode: 'chamfer',
  pathMode: 'center',
  tableDia: '',
};

const ANGLE_PRESETS = [30, 45, 60];

const fmt = (n: number) => n.toFixed(3);
const fmtSigned = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(3)}`;

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

  const isEndmill = inputs.toolMode === 'endmill';
  const isComp = inputs.pathMode === 'comp';

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
    const eRaw = R - s * tanA; // promień toru osi narzędzia / aktywny promień kompensacji
    const e = Math.max(0, eRaw);
    const requiredToolD = 2 * (c + s * tanA); // średnica robocza narzędzia na poziomie powierzchni
    const maxChamfer = toolD ? toolD / 2 - s * tanA : null;
    const toolTooSmall = toolD !== null && toolD > 0 && toolD + 1e-9 < requiredToolD;
    const safetyMax = R / tanA;

    // Tabela narzędzia jako "frez": promień korekty (DR / offset / OFFN) = e - R0
    const tableD = parseDecimal(inputs.tableDia);
    const R0 = tableD ? tableD / 2 : null;
    const dr = R0 !== null ? e - R0 : null;

    return {
      D, c, alpha, s, toolD, R, h, Z, e,
      requiredToolD,
      maxChamfer,
      toolTooSmall,
      safetyTooBig: eRaw < 0,
      safetyMax,
      topDia: D + 2 * c,
      R0,
      dr,
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

      <div className="glass-module">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-zinc-400">{t('program.title')}</h2>

        <div className="flex items-start justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-200">{t('program.toolModeLabel')}</span>
              <InfoPopover title={t('program.toolModeInfoTitle')}>
                <p>{t('program.toolModeInfoChamfer')}</p>
                <p>{t('program.toolModeInfoEndmill')}</p>
              </InfoPopover>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {isEndmill ? t('program.toolModeEndmill') : t('program.toolModeChamfer')}
            </p>
          </div>
          <Switch
            checked={isEndmill}
            onCheckedChange={(v) => {
              triggerLight();
              setInputs((s) => ({ ...s, toolMode: v ? 'endmill' : 'chamfer' }));
            }}
            aria-label={t('program.toolModeLabel')}
          />
        </div>

        {isEndmill && (
          <div className="pb-1 pt-1">
            <InputField
              label={`${t('program.tableDia')} [${unit}]`}
              value={inputs.tableDia}
              onChange={set('tableDia')}
            />
          </div>
        )}

        <div className="mt-1 flex items-start justify-between gap-3 border-t border-zinc-800 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-200">{t('program.pathModeLabel')}</span>
              <InfoPopover title={t('program.pathModeInfoTitle')}>
                <p>{t('program.pathModeInfoCenter')}</p>
                <p>{t('program.pathModeInfoComp')}</p>
              </InfoPopover>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {isComp ? t('program.pathModeComp') : t('program.pathModeCenter')}
            </p>
          </div>
          <Switch
            checked={isComp}
            onCheckedChange={(v) => {
              triggerLight();
              setInputs((s) => ({ ...s, pathMode: v ? 'comp' : 'center' }));
            }}
            aria-label={t('program.pathModeLabel')}
          />
        </div>

        {!isComp && (
          <p className="mt-2 flex items-start gap-2 text-xs text-zinc-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t('program.toolModeIrrelevant')}
          </p>
        )}
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
                  <p className="text-sm font-medium text-cyan-300">
                    {isComp ? t('results.activeRadius') : t('results.offset')}
                  </p>
                </div>
                <p className="text-3xl font-black text-cyan-400">
                  <CopyableValue value={fmt(calc.e)}>{fmt(calc.e)}</CopyableValue>{' '}
                  <span className="text-sm font-normal text-zinc-500">{unit}</span>
                </p>
                <p className="mt-1.5 text-xs text-cyan-600">
                  {isComp
                    ? t('results.activeRadiusNote', { d: withUnit(calc.e * 2) })
                    : t('results.offsetNote', { d: withUnit(calc.e * 2) })}
                </p>
              </div>
            </div>

            {isComp && (
              <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-sm font-medium text-zinc-200">{t('results.contourRadius')}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
                  <CopyableValue value={fmt(calc.R)}>{fmt(calc.R)}</CopyableValue> {unit}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{t('results.contourRadiusNote')}</p>

                {isEndmill && (
                  <div className="mt-3 border-t border-zinc-800 pt-3">
                    {calc.dr !== null ? (
                      <>
                        <p className="text-sm font-medium text-zinc-200">{t('results.drLabel')}</p>
                        <p
                          className={`mt-1 text-xl font-bold tabular-nums ${
                            calc.dr > 0 ? 'text-amber-400' : 'text-zinc-100'
                          }`}
                        >
                          <CopyableValue value={fmtSigned(calc.dr)}>{fmtSigned(calc.dr)}</CopyableValue> {unit}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {t('results.drNote', { r0: withUnit(calc.R0 ?? 0) })}
                        </p>
                        {calc.dr > 0 && (
                          <p className="mt-2 flex items-start gap-2 text-xs text-amber-400">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {t('warnings.drPositive')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="flex items-start gap-2 text-xs text-zinc-500">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {t('results.drMissing')}
                      </p>
                    )}
                  </div>
                )}

                {!isEndmill && (
                  <p className="mt-3 flex items-start gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t('results.chamferNoDr', { e: withUnit(calc.e) })}
                  </p>
                )}
              </div>
            )}

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
          <p className="px-2 text-center text-xs text-zinc-600">{t('verifyNote')}</p>
        </>
      ) : (
        <p className="py-10 text-center text-zinc-500">{t('empty')}</p>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default MillChamferCalculator;
