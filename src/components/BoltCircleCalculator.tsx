import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import useHaptics from '@/hooks/useHaptics';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';

type Shape = { d: string; n: string; a0: string; x0: string; y0: string };

const INITIAL: Shape = { d: '', n: '', a0: '', x0: '', y0: '' };

const BoltCircleCalculator = () => {
  const { t } = useTranslation('milling');
  const { u } = useUnits();
  const { triggerSuccess } = useHaptics();
  const [inputs, setInputs, reset] = usePersistedState<Shape>('pcd', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const holes = useMemo(() => {
    const d = parseDecimal(inputs.d);
    const n = parseDecimal(inputs.n);
    if (!d || !n || n < 1 || n > 200) return [];
    const a0 = parseDecimal(inputs.a0) ?? 0;
    const x0 = parseDecimal(inputs.x0) ?? 0;
    const y0 = parseDecimal(inputs.y0) ?? 0;
    const count = Math.floor(n);
    const r = d / 2;
    return Array.from({ length: count }, (_, i) => {
      const angle = a0 + i * (360 / count);
      const rad = (angle * Math.PI) / 180;
      return {
        i: i + 1,
        angle,
        x: x0 + r * Math.cos(rad),
        y: y0 + r * Math.sin(rad),
      };
    });
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

  // SVG geometry (unit circle scaled to viewBox)
  const R = 70;

  return (
    <>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-4">
          <InputField label={`${t('pcd.d')} [${u.length}]`} value={inputs.d} onChange={set('d')} />
          <InputField label={t('pcd.n')} value={inputs.n} onChange={set('n')} inputMode="numeric" />
          <InputField label={t('pcd.a0')} value={inputs.a0} onChange={set('a0')} />
          <div className="hidden sm:block" />
          <InputField label={`${t('pcd.x0')} [${u.length}]`} value={inputs.x0} onChange={set('x0')} />
          <InputField label={`${t('pcd.y0')} [${u.length}]`} value={inputs.y0} onChange={set('y0')} />
        </div>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('pcd.preview')}</h2>
        <svg viewBox="-100 -100 200 200" className="w-full max-w-xs mx-auto block">
          <line x1="-95" y1="0" x2="95" y2="0" stroke="#3f3f46" strokeWidth="1" />
          <line x1="0" y1="-95" x2="0" y2="95" stroke="#3f3f46" strokeWidth="1" />
          <circle
            cx="0"
            cy="0"
            r={R}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.7"
          />
          {holes.map((h) => {
            const rad = (h.angle * Math.PI) / 180;
            const cx = R * Math.cos(rad);
            const cy = -R * Math.sin(rad);
            return (
              <g key={h.i}>
                <circle cx={cx} cy={cy} r="6" fill="#0e7490" stroke="#22d3ee" strokeWidth="1.5" />
                <text
                  x={cx * 1.28}
                  y={cy * 1.28 + 3}
                  fill="#a1a1aa"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {h.i}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

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
                  <th className="text-right py-2 px-2">{t('common.angle')}</th>
                  <th className="text-right py-2 px-2">X</th>
                  <th className="text-right py-2 pl-2">Y</th>
                </tr>
              </thead>
              <tbody>
                {holes.map((h) => (
                  <tr key={h.i} className="border-t border-zinc-800">
                    <td className="py-2 pr-2 text-zinc-400">{h.i}</td>
                    <td className="py-2 px-2 text-right text-zinc-400 tabular-nums">
                      {h.angle.toFixed(2)}°
                    </td>
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

export default BoltCircleCalculator;
