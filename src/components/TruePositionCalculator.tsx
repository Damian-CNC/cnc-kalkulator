import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
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

const TruePositionCalculator = () => {
  const { t } = useTranslation('milling');
  const { u } = useUnits();
  const [inputs, setInputs, reset] = usePersistedState<Shape>('true-position', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const result = useMemo(() => {
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
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('tp.nominal')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <InputField label={`X nom [${u.length}]`} value={inputs.xNom} onChange={set('xNom')} />
          <InputField label={`Y nom [${u.length}]`} value={inputs.yNom} onChange={set('yNom')} />
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('tp.actual')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <InputField label={`X act [${u.length}]`} value={inputs.xAct} onChange={set('xAct')} />
          <InputField label={`Y act [${u.length}]`} value={inputs.yAct} onChange={set('yAct')} />
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('tp.tolerance')}</h2>
        <InputField label={`⌀ tol [${u.length}]`} value={inputs.tol} onChange={set('tol')} />
        <p className="text-xs text-zinc-500 mt-4 mb-3 uppercase tracking-wider">{t('tp.mmc')}</p>
        <div className="grid grid-cols-2 gap-4">
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

      {result && (
        <div className="glass-module">
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('tp.result')}</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">ΔX</div>
              <div className="text-xl font-bold text-cyan-400 tabular-nums">
                {result.dx.toFixed(4)}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">ΔY</div>
              <div className="text-xl font-bold text-cyan-400 tabular-nums">
                {result.dy.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
              {t('tp.tp')} ⌀
            </div>
            <div className="text-3xl font-bold text-cyan-400 tabular-nums">
              {result.tp.toFixed(4)} {u.length}
            </div>
          </div>

          {result.bonus > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-500">{t('tp.bonus')}</span>
              <span className="text-cyan-400 font-bold tabular-nums">
                +{result.bonus.toFixed(4)} {u.length}
              </span>
            </div>
          )}

          {result.allowed !== null && (
            <>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-zinc-500">{t('tp.allowed')}</span>
                <span className="text-zinc-200 font-bold tabular-nums">
                  {result.allowed.toFixed(4)} {u.length}
                </span>
              </div>

              <div
                className={`flex items-center gap-3 rounded-xl border p-4 ${
                  result.pass
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/40 text-red-400'
                }`}
              >
                {result.pass ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 shrink-0" />
                )}
                <div>
                  <div className="font-black tracking-wider uppercase">
                    {result.pass ? t('tp.pass') : t('tp.fail')}
                  </div>
                  <div className="text-xs opacity-80">
                    {t('tp.margin')}: {result.margin!.toFixed(4)} {u.length}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default TruePositionCalculator;
