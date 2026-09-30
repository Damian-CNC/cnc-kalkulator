import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, BigResult, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';

type Shape = { thread: string; d: string; p: string; type: 'cut' | 'form'; pct: string };

const INITIAL: Shape = { thread: 'M8x1.25', d: '', p: '', type: 'cut', pct: '' };

// [średnica nominalna, skok]
const THREADS: [number, number][] = [
  [2, 0.4], [2.5, 0.45], [3, 0.5], [4, 0.7], [5, 0.8], [6, 1], [8, 1.25], [10, 1.5],
  [12, 1.75], [14, 2], [16, 2], [18, 2.5], [20, 2.5], [22, 2.5], [24, 3], [27, 3],
  [30, 3.5], [33, 3.5], [36, 4], [39, 4], [42, 4.5], [48, 5],
  // gwinty drobne
  [6, 0.75], [8, 1], [10, 1], [10, 1.25], [12, 1.25], [12, 1.5], [14, 1.5], [16, 1.5],
  [18, 1.5], [20, 1.5], [22, 1.5], [24, 2], [27, 2], [30, 2], [36, 3],
];

const keyOf = (d: number, p: number) => `M${d}x${p}`;

const OPTIONS = [
  ...THREADS.map(([d, p], i) => ({
    value: keyOf(d, p),
    label: `M${d} × ${p}${i >= 22 ? ' *' : ''}`,
  })),
];

// Współczynniki: średnica otworu = D − k · P · %
const K_CUT = 0.01299; // gwint nacinany (maszynowy / ręczny)
const K_FORM = 0.0068; // gwint wygniatany (roll tap)

const DEFAULT_PCT = { cut: 75, form: 65 } as const;

const TapDrillCalculator = () => {
  const { t } = useTranslation('tools');
  const [inputs, setInputs, reset] = usePersistedState<Shape>('tap-drill', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const isCustom = inputs.thread === 'custom';

  const calc = useMemo(() => {
    let D: number | null;
    let P: number | null;
    if (isCustom) {
      D = parseDecimal(inputs.d);
      P = parseDecimal(inputs.p);
    } else {
      const found = THREADS.find(([d, p]) => keyOf(d, p) === inputs.thread);
      D = found ? found[0] : null;
      P = found ? found[1] : null;
    }
    if (!D || !P || D <= 0 || P <= 0 || P >= D) return null;

    const k = inputs.type === 'cut' ? K_CUT : K_FORM;
    const pct = parseDecimal(inputs.pct) ?? DEFAULT_PCT[inputs.type];
    if (pct <= 0 || pct > 100) return null;

    const theory = D - k * P * pct;
    const drill = Math.round(theory * 10) / 10;
    const actualPct = (D - drill) / (k * P);
    const core = D - 1.082532 * P; // D1 – średnica rdzenia gwintu wewnętrznego (podstawowa)
    return { D, P, pct, theory, drill, actualPct, core };
  }, [inputs, isCustom]);

  const warn = calc
    ? inputs.type === 'cut'
      ? calc.actualPct > 85
        ? 'high'
        : calc.actualPct < 55
          ? 'low'
          : null
      : calc.actualPct > 80
        ? 'high'
        : calc.actualPct < 50
          ? 'low'
          : null
    : null;

  return (
    <>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={t('tapDrill.thread')}
            value={inputs.thread}
            onChange={set('thread')}
            options={[...OPTIONS, { value: 'custom', label: t('tapDrill.custom') }]}
          />
          <SelectField
            label={t('tapDrill.type')}
            value={inputs.type}
            onChange={set('type')}
            options={[
              { value: 'cut', label: t('tapDrill.cut') },
              { value: 'form', label: t('tapDrill.form') },
            ]}
          />
          {isCustom && (
            <>
              <InputField label={`${t('tapDrill.diameter')} [mm]`} value={inputs.d} onChange={set('d')} />
              <InputField label={`${t('tapDrill.pitch')} [mm]`} value={inputs.p} onChange={set('p')} />
            </>
          )}
          <InputField
            label={`${t('tapDrill.engagement')} [%]`}
            value={inputs.pct}
            onChange={set('pct')}
            placeholder={String(DEFAULT_PCT[inputs.type])}
          />
        </div>
        <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
          {t('tapDrill.fineNote')}
        </p>
      </div>

      {calc && (
        <div className="glass-module">
          <SectionTitle>{t('common.result')}</SectionTitle>
          <div className="mb-4">
            <BigResult
              label={t('tapDrill.drill')}
              value={fmt(calc.drill, 1)}
              unit="mm"
              copy={fmt(calc.drill, 1)}
            />
          </div>

          <ResultRow label={t('tapDrill.theory')} value={fmt(calc.theory, 3)} unit="mm" />
          <ResultRow
            label={t('tapDrill.actual')}
            value={`${fmt(calc.actualPct, 0)}`}
            unit="%"
            strong
          />
          {inputs.type === 'cut' && (
            <ResultRow label={t('tapDrill.core')} value={fmt(calc.core, 3)} unit="mm" />
          )}

          {warn && (
            <div className="mt-4">
              <Banner tone="warn">
                {warn === 'high' ? t('tapDrill.warnHigh') : t('tapDrill.warnLow')}
              </Banner>
            </div>
          )}
          <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
            {inputs.type === 'cut' ? t('tapDrill.noteCut') : t('tapDrill.noteForm')}
          </p>
        </div>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default TapDrillCalculator;
