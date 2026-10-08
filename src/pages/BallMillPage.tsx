import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, BigResult, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';
import { effectiveDia, rpmFor, scallopHeight, stepoverFor, vcFor } from '@/lib/ballMill';

type State = { d: string; ap: string; vc: string; rpm: string; ae: string; h: string };
const INITIAL: State = { d: '', ap: '', vc: '', rpm: '', ae: '', h: '' };

const BallMillPage = () => {
  const { t } = useTranslation('tools');
  const { u, isImperial, speedConstant } = useUnits();
  const [s, setS, reset] = usePersistedState<State>('ball-mill', INITIAL);
  const set = (k: keyof State) => (e: { target: { value: string } }) => setS((p) => ({ ...p, [k]: e.target.value }));
  const dg = isImperial ? 4 : 3;

  const D = parseDecimal(s.d);
  const ap = parseDecimal(s.ap);
  const vc = parseDecimal(s.vc);
  const rpm = parseDecimal(s.rpm);
  const ae = parseDecimal(s.ae);
  const h = parseDecimal(s.h);

  const De = D && ap ? effectiveDia(D, ap) : null;
  const needRpm = De && vc ? rpmFor(vc, De, speedConstant) : null;
  const nomRpm = D && vc ? rpmFor(vc, D, speedConstant) : null;
  const vcEff = De && rpm ? vcFor(rpm, De, speedConstant) : null;
  const scal = D && ae ? scallopHeight(D, ae) : null;
  const step = D && h ? stepoverFor(D, h) : null;

  return (
    <PageLayout title={t('ball.title')}>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="glass-module">
          <SectionTitle>{t('ball.toolTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('ball.d')} [${u.length}]`} value={s.d} onChange={set('d')} inputMode="decimal" />
            <InputField label={`${t('ball.ap')} [${u.length}]`} value={s.ap} onChange={set('ap')} inputMode="decimal" />
          </div>
          {D && ap && ap > D / 2 && <div className="mt-4"><Banner tone="warn">{t('ball.apBig')}</Banner></div>}
        </div>

        {De !== null && D ? (
          <div className="glass-module">
            <SectionTitle>{t('ball.effTitle')}</SectionTitle>
            <BigResult label={t('ball.de')} value={fmt(De, dg)} unit={u.length} />
            <div className="mt-3">
              <ResultRow label={t('ball.ratio')} value={`${fmt((De / D) * 100, 0)} %`} />
            </div>
          </div>
        ) : null}

        <div className="glass-module">
          <SectionTitle>{t('ball.speedTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('ball.vc')} [${u.speed}]`} value={s.vc} onChange={set('vc')} inputMode="decimal" />
            <InputField label={`${t('ball.rpm')} [1/min]`} value={s.rpm} onChange={set('rpm')} inputMode="decimal" />
          </div>
          <div className="mt-3">
            {needRpm !== null && <ResultRow label={t('ball.needRpm')} value={fmt(needRpm, 0)} unit="1/min" strong />}
            {needRpm !== null && nomRpm !== null && (
              <ResultRow label={t('ball.nomRpm')} value={fmt(nomRpm, 0)} unit="1/min" />
            )}
            {vcEff !== null && <ResultRow label={t('ball.vcEff')} value={fmt(vcEff, 1)} unit={u.speed} strong />}
          </div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('ball.speedHint')}</p>
        </div>

        <div className="glass-module">
          <SectionTitle>{t('ball.scallopTitle')}</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={`${t('ball.ae')} [${u.length}]`} value={s.ae} onChange={set('ae')} inputMode="decimal" />
            <InputField label={`${t('ball.h')} [${u.length}]`} value={s.h} onChange={set('h')} inputMode="decimal" />
          </div>
          <div className="mt-3">
            {scal !== null && <ResultRow label={t('ball.scallop')} value={fmt(scal, isImperial ? 5 : 4)} unit={u.length} strong />}
            {step !== null && <ResultRow label={t('ball.stepover')} value={fmt(step, dg)} unit={u.length} strong />}
            {D && ae && scal === null && <Banner tone="warn">{t('ball.aeBig')}</Banner>}
          </div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('ball.scallopHint')}</p>
        </div>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default BallMillPage;
