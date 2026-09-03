import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type Shape = { x0: string; y0: string; l: string; n: string; theta: string };

const INITIAL: Shape = { x0: '', y0: '', l: '', n: '', theta: '' };

const LinearHolesCalculator = () => {
  const { t } = useTranslation('milling');
  const { u } = useUnits();
  const { triggerSuccess } = useHaptics();
  const [inputs, setInputs, reset] = usePersistedState<Shape>('linear-holes', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const holes = useMemo(() => {
    const l = parseDecimal(inputs.l);
    const n = parseDecimal(inputs.n);
    if (l === null || !n || n < 1 || n > 200) return [];
    const x0 = parseDecimal(inputs.x0) ?? 0;
    const y0 = parseDecimal(inputs.y0) ?? 0;
    const theta = parseDecimal(inputs.theta) ?? 0;
    const rad = (theta * Math.PI) / 180;
    return Array.from({ length: Math.floor(n) }, (_, i) => ({
      i: i + 1,
      x: x0 + i * l * Math.cos(rad),
      y: y0 + i * l * Math.sin(rad),
    }));
  }, [inputs]);

  const gcode = useMemo(
    () => holes.map((h) => `X${h.x.toFixed(3)} Y${h.y.toFixed(3)}`).join('\n'),
    [holes],
  );

  const copy = async () => {
    if (!gcode) return;
    try {
      await navigator.clipboard.writeText(gcode);
      triggerSuccess();
    } catch {
      /* noop */
    }
  };

  const bounds = useMemo(() => {
    if (!holes.length) return null;
    const xs = holes.map((h) => h.x);
    const ys = holes.map((h) => h.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = Math.max(maxX - minX, maxY - minY, 1);
    return { minX, maxX, minY, maxY, span };
  }, [holes]);

  return (
    <>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-4">
          <InputField label={`X₀ [${u.length}]`} value={inputs.x0} onChange={set('x0')} />
          <InputField label={`Y₀ [${u.length}]`} value={inputs.y0} onChange={set('y0')} />
          <InputField label={`${t('linear.l')} [${u.length}]`} value={inputs.l} onChange={set('l')} />
          <InputField label={t('linear.n')} value={inputs.n} onChange={set('n')} inputMode="numeric" />
          <InputField label={t('linear.theta')} value={inputs.theta} onChange={set('theta')} />
        </div>
      </div>

      {bounds && (
        <div className="glass-module">
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">
            {t('linear.preview')}
          </h2>
          <svg viewBox="-10 -10 220 120" className="w-full max-w-sm mx-auto block">
            {holes.map((h) => {
              const cx = ((h.x - bounds.minX) / bounds.span) * 200;
              const cy = 100 - ((h.y - bounds.minY) / bounds.span) * 100;
              return (
                <circle
                  key={h.i}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#0e7490"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>
      )}

      {holes.length > 0 && (
        <div className="glass-module">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400">{t('common.coords')}</h2>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-cyan-500/20 active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              {t('pcd.copyGcode')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-2">{t('common.no')}</th>
                  <th className="text-right py-2 px-2">X</th>
                  <th className="text-right py-2 pl-2">Y</th>
                </tr>
              </thead>
              <tbody>
                {holes.map((h) => (
                  <tr key={h.i} className="border-t border-zinc-800">
                    <td className="py-2 pr-2 text-zinc-400">{h.i}</td>
                    <td className="py-2 px-2 text-right text-cyan-400 font-bold tabular-nums">
                      {h.x.toFixed(3)}
                    </td>
                    <td className="py-2 pl-2 text-right text-cyan-400 font-bold tabular-nums">
                      {h.y.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default LinearHolesCalculator;
