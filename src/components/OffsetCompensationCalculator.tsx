import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { parseDecimal } from '@/lib/numericInput';
import { useUnits } from '@/contexts/UnitContext';
import { Banner, BigResult, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';

type Shape = {
  feature: 'outer' | 'inner';
  sides: '2' | '1';
  nominal: string;
  measured: string;
  min: string;
  max: string;
  current: string;
  offsetMode: 'radius' | 'diameter';
  convention: 'more' | 'less';
};

const INITIAL: Shape = {
  feature: 'outer',
  sides: '2',
  nominal: '',
  measured: '',
  min: '',
  max: '',
  current: '',
  offsetMode: 'radius',
  convention: 'more',
};

const OffsetCompensationCalculator = () => {
  const { t } = useTranslation('tools');
  const { u } = useUnits();
  const [inputs, setInputs, reset] = usePersistedState<Shape>('offset-comp', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInputs((s) => ({ ...s, [k]: e.target.value }));

  const calc = useMemo(() => {
    const nominal = parseDecimal(inputs.nominal);
    const measured = parseDecimal(inputs.measured);
    if (nominal === null || measured === null) return null;

    const min = parseDecimal(inputs.min);
    const max = parseDecimal(inputs.max);
    const hasTol = min !== null && max !== null && max >= min;

    // Celujemy w środek pola tolerancji (jeśli podano), inaczej w wymiar zadany
    const target = hasTol ? (min + max) / 2 : nominal;
    const error = measured - target;

    // Ile materiału trzeba jeszcze zdjąć z mierzonego wymiaru (ujemne = za dużo zdjęto)
    const remove = inputs.feature === 'outer' ? error : -error;
    const sides = inputs.sides === '2' ? 2 : 1;
    const perSide = remove / sides;

    const useDiameter = inputs.offsetMode === 'diameter' && sides === 2;
    const magnitude = useDiameter ? remove : perSide;
    const delta = inputs.convention === 'more' ? magnitude : -magnitude;

    const current = parseDecimal(inputs.current);
    const inTol = hasTol ? measured >= min && measured <= max : null;

    return { target, error, remove, perSide, delta, useDiameter, newOffset: current !== null ? current + delta : null, hasTol, inTol };
  }, [inputs]);

  const sign = (v: number) => (v > 0 ? '+' : '');
  const EPS = 0.0005;

  return (
    <>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={t('comp.feature')}
            value={inputs.feature}
            onChange={set('feature')}
            options={[
              { value: 'outer', label: t('comp.outer') },
              { value: 'inner', label: t('comp.inner') },
            ]}
          />
          <SelectField
            label={t('comp.sides')}
            value={inputs.sides}
            onChange={set('sides')}
            options={[
              { value: '2', label: t('comp.sides2') },
              { value: '1', label: t('comp.sides1') },
            ]}
          />
          <InputField label={`${t('comp.nominal')} [${u.length}]`} value={inputs.nominal} onChange={set('nominal')} />
          <InputField label={`${t('comp.measured')} [${u.length}]`} value={inputs.measured} onChange={set('measured')} />
          <InputField label={`${t('comp.min')} [${u.length}]`} value={inputs.min} onChange={set('min')} />
          <InputField label={`${t('comp.max')} [${u.length}]`} value={inputs.max} onChange={set('max')} />
        </div>
        <p className="text-xs text-zinc-500 mt-4 leading-relaxed">{t('comp.tolHint')}</p>
      </div>

      <div className="glass-module">
        <SectionTitle>{t('comp.offsetTitle')}</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label={`${t('comp.current')} [${u.length}]`}
            value={inputs.current}
            onChange={set('current')}
            inputMode="text"
          />
          <SelectField
            label={t('comp.offsetMode')}
            value={inputs.offsetMode}
            onChange={set('offsetMode')}
            options={[
              { value: 'radius', label: t('comp.radius') },
              { value: 'diameter', label: t('comp.diameter') },
            ]}
          />
          <div className="col-span-2">
            <SelectField
              label={t('comp.convention')}
              value={inputs.convention}
              onChange={set('convention')}
              options={[
                { value: 'more', label: t('comp.convMore') },
                { value: 'less', label: t('comp.convLess') },
              ]}
            />
          </div>
        </div>
      </div>

      {calc && (
        <div className="glass-module">
          <SectionTitle>{t('common.result')}</SectionTitle>

          <div className="mb-4">
            <BigResult
              label={t('comp.delta')}
              value={`${sign(calc.delta)}${fmt(calc.delta, 3)}`}
              unit={u.length}
              copy={fmt(calc.delta, 3)}
            />
          </div>

          <div className="mb-4">
            {Math.abs(calc.remove) < EPS ? (
              <Banner tone="ok">{t('comp.noChange')}</Banner>
            ) : calc.remove > 0 ? (
              <Banner tone="warn">
                {t('comp.removeMore', { v: fmt(Math.abs(calc.remove), 3), u: u.length })}
              </Banner>
            ) : (
              <Banner tone="warn">
                {t('comp.removeLess', { v: fmt(Math.abs(calc.remove), 3), u: u.length })}
              </Banner>
            )}
          </div>

          <ResultRow label={t('comp.target')} value={fmt(calc.target, 3)} unit={u.length} />
          <ResultRow label={t('comp.error')} value={`${sign(calc.error)}${fmt(calc.error, 3)}`} unit={u.length} />
          <ResultRow
            label={t('comp.perSide')}
            value={`${sign(calc.perSide)}${fmt(calc.perSide, 3)}`}
            unit={u.length}
          />
          <ResultRow
            label={t('comp.safe')}
            value={`${sign(calc.delta)}${fmt(calc.delta * 0.8, 3)}`}
            unit={u.length}
          />
          {calc.newOffset !== null && (
            <ResultRow label={t('comp.newOffset')} value={fmt(calc.newOffset, 3)} unit={u.length} strong />
          )}

          {calc.hasTol && calc.inTol !== null && (
            <div className="mt-4">
              <Banner tone={calc.inTol ? 'ok' : 'bad'}>
                {calc.inTol ? t('comp.inTol') : t('comp.outTol')}
              </Banner>
            </div>
          )}

          <p className="text-xs text-zinc-500 mt-4 leading-relaxed">{t('comp.note')}</p>
        </div>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default OffsetCompensationCalculator;
