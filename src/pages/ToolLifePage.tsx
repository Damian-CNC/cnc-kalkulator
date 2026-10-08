import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';
import { TYPICAL_N, lifeAt, speedFor, taylorC, taylorN } from '@/lib/toolLife';

type State = {
  v1: string; t1: string; nMode: string; nCustom: string; v2: string; t2: string; vNew: string; tTarget: string;
};
const INITIAL: State = { v1: '', t1: '', nMode: 'carbide', nCustom: '', v2: '', t2: '', vNew: '', tTarget: '' };

const ToolLifePage = () => {
  const { t } = useTranslation('tools');
  const { u } = useUnits();
  const [s, setS, reset] = usePersistedState<State>('tool-life', INITIAL);
  const set = (k: keyof State) => (e: { target: { value: string } }) => setS((p) => ({ ...p, [k]: e.target.value }));

  const v1 = parseDecimal(s.v1);
  const t1 = parseDecimal(s.t1);
  const v2 = parseDecimal(s.v2);
  const t2 = parseDecimal(s.t2);
  const vNew = parseDecimal(s.vNew);
  const tTarget = parseDecimal(s.tTarget);

  let n: number | null = null;
  if (s.nMode === 'test') n = v1 && t1 && v2 && t2 ? taylorN(v1, t1, v2, t2) : null;
  else if (s.nMode === 'custom') {
    const c = parseDecimal(s.nCustom);
    n = c && c > 0 ? c : null;
  } else n = TYPICAL_N.find((x) => x.id === s.nMode)?.n ?? null;

  const C = n && v1 && t1 ? taylorC(v1, t1, n) : null;
  const life = C && n && vNew ? lifeAt(C, n, vNew) : null;
  const speed = C && n && tTarget ? speedFor(C, n, tTarget) : null;
  const testBad = s.nMode === 'test' && v1 && t1 && v2 && t2 && n === null;

  return (
    <PageLayout title={t('life.title')}>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="glass-module">
          <SectionTitle>{t('life.refTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('life.v1')} [${u.speed}]`} value={s.v1} onChange={set('v1')} inputMode="decimal" />
            <InputField label={`${t('life.t1')} [min]`} value={s.t1} onChange={set('t1')} inputMode="decimal" />
          </div>
        </div>

        <div className="glass-module">
          <SectionTitle>{t('life.nTitle')}</SectionTitle>
          <SelectField
            label={t('life.nSource')}
            value={s.nMode}
            onChange={set('nMode')}
            options={[
              ...TYPICAL_N.map((x) => ({ value: x.id, label: `${t(`life.typical.${x.id}`)} (n ≈ ${x.n})` })),
              { value: 'custom', label: t('life.custom') },
              { value: 'test', label: t('life.fromTest') },
            ]}
          />
          {s.nMode === 'custom' && (
            <div className="mt-4">
              <InputField label="n" value={s.nCustom} onChange={set('nCustom')} inputMode="decimal" />
            </div>
          )}
          {s.nMode === 'test' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <InputField label={`${t('life.v2')} [${u.speed}]`} value={s.v2} onChange={set('v2')} inputMode="decimal" />
              <InputField label={`${t('life.t2')} [min]`} value={s.t2} onChange={set('t2')} inputMode="decimal" />
            </div>
          )}
          {testBad && <div className="mt-4"><Banner tone="warn">{t('life.testBad')}</Banner></div>}
          {n !== null && (
            <div className="mt-3">
              <ResultRow label="n" value={fmt(n, 3)} strong />
              {C !== null && <ResultRow label="C" value={fmt(C, 1)} />}
            </div>
          )}
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('life.nHint')}</p>
        </div>

        <div className="glass-module">
          <SectionTitle>{t('life.forecastTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('life.vNew')} [${u.speed}]`} value={s.vNew} onChange={set('vNew')} inputMode="decimal" />
            <InputField label={`${t('life.tTarget')} [min]`} value={s.tTarget} onChange={set('tTarget')} inputMode="decimal" />
          </div>
          <div className="mt-3">
            {life !== null && <ResultRow label={t('life.lifeAt')} value={fmt(life, 1)} unit="min" strong />}
            {speed !== null && <ResultRow label={t('life.speedFor')} value={fmt(speed, 1)} unit={u.speed} strong />}
          </div>
        </div>

        {C !== null && n !== null && v1 && t1 ? (
          <div className="glass-module">
            <SectionTitle>{t('life.sensTitle')}</SectionTitle>
            {[-20, -10, 10, 20].map((p) => {
              const v = v1 * (1 + p / 100);
              const tt = lifeAt(C, n, v);
              return (
                <ResultRow
                  key={p}
                  label={`${p > 0 ? '+' : ''}${p} % ${t('life.speedWord')} (${fmt(v, 0)} ${u.speed})`}
                  value={`${fmt(tt, 1)} min (${tt / t1 >= 1 ? '+' : ''}${fmt((tt / t1 - 1) * 100, 0)} %)`}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default ToolLifePage;
