import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { useUnits } from '@/contexts/UnitContext';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, BigResult, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';
import { MATERIALS, findMaterial } from '@/lib/materials';
import { REF_C, cToF, fToC, readingAt, readingWithGauge, sizeAt20 } from '@/lib/thermal';

type State = {
  tab: 'part' | 'gauge';
  mat: string; size: string; temp: string;
  gaugeMat: string; gaugeTemp: string; partTemp: string; nominal: string;
};
const INITIAL: State = {
  tab: 'part', mat: 'al6061', size: '', temp: '', gaugeMat: 'c45', gaugeTemp: '20', partTemp: '', nominal: '',
};

const ThermalPage = () => {
  const { t } = useTranslation('tools');
  const { u, isImperial } = useUnits();
  const [s, setS, reset] = usePersistedState<State>('thermal', INITIAL);
  const set = (k: keyof State) => (e: { target: { value: string } }) => setS((p) => ({ ...p, [k]: e.target.value }));
  const dg = isImperial ? 5 : 4;
  const tUnit = isImperial ? '°F' : '°C';
  const toC = (v: number | null) => (v === null ? null : isImperial ? fToC(v) : v);
  const refShown = isImperial ? cToF(REF_C) : REF_C;

  const mat = findMaterial(s.mat);
  const gMat = findMaterial(s.gaugeMat);
  const size = parseDecimal(s.size);
  const temp = toC(parseDecimal(s.temp));
  const nominal = parseDecimal(s.nominal);
  const partT = toC(parseDecimal(s.partTemp));
  const gaugeT = toC(parseDecimal(s.gaugeTemp));

  const matOptions = MATERIALS.map((m) => ({
    value: m.id,
    label: `${m.name} · α ${m.alpha}`,
  }));

  const at20 = mat && size && temp !== null ? sizeAt20(size, temp, mat.alpha) : null;
  const dev = at20 !== null && size ? size - at20 : null;
  const read = mat && nominal && temp !== null ? readingAt(nominal, temp, mat.alpha) : null;

  const gaugeRead =
    mat && gMat && nominal && partT !== null && gaugeT !== null
      ? readingWithGauge(nominal, mat.alpha, partT, gMat.alpha, gaugeT)
      : null;

  return (
    <PageLayout title={t('thermal.title')}>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="grid grid-cols-2 gap-2">
          {(['part', 'gauge'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setS((p) => ({ ...p, tab }))}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                s.tab === tab
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {t(`thermal.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="glass-module">
          <SectionTitle>{t('thermal.partTitle')}</SectionTitle>
          <SelectField label={t('thermal.material')} value={s.mat} onChange={set('mat')} options={matOptions} />
          {mat && (
            <p className="text-xs text-zinc-500 mt-2">
              α = {mat.alpha} µm/(m·K) · {t('thermal.approx')}
            </p>
          )}
        </div>

        {s.tab === 'part' ? (
          <>
            <div className="glass-module">
              <SectionTitle>{t('thermal.measureTitle')}</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <InputField label={`${t('thermal.measured')} [${u.length}]`} value={s.size} onChange={set('size')} inputMode="decimal" />
                <InputField label={`${t('thermal.temp')} [${tUnit}]`} value={s.temp} onChange={set('temp')} inputMode="decimal" />
              </div>
              {at20 !== null && dev !== null && (
                <div className="mt-4 space-y-3">
                  <BigResult label={t('thermal.at20', { t: fmt(refShown, 0), unit: tUnit })} value={fmt(at20, dg)} unit={u.length} />
                  <ResultRow label={t('thermal.diff')} value={`${dev >= 0 ? '+' : ''}${fmt(dev, dg)}`} unit={u.length} />
                </div>
              )}
            </div>

            <div className="glass-module">
              <SectionTitle>{t('thermal.targetTitle')}</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <InputField label={`${t('thermal.nominal', { t: fmt(refShown, 0), unit: tUnit })} [${u.length}]`} value={s.nominal} onChange={set('nominal')} inputMode="decimal" />
                <InputField label={`${t('thermal.temp')} [${tUnit}]`} value={s.temp} onChange={set('temp')} inputMode="decimal" />
              </div>
              {read !== null && (
                <div className="mt-4">
                  <BigResult label={t('thermal.reading')} value={fmt(read, dg)} unit={u.length} />
                  <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('thermal.readingHint')}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="glass-module">
            <SectionTitle>{t('thermal.gaugeTitle')}</SectionTitle>
            <SelectField label={t('thermal.gaugeMat')} value={s.gaugeMat} onChange={set('gaugeMat')} options={matOptions} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <InputField label={`${t('thermal.nominal', { t: fmt(refShown, 0), unit: tUnit })} [${u.length}]`} value={s.nominal} onChange={set('nominal')} inputMode="decimal" />
              <InputField label={`${t('thermal.partTemp')} [${tUnit}]`} value={s.partTemp} onChange={set('partTemp')} inputMode="decimal" />
              <InputField label={`${t('thermal.gaugeTemp')} [${tUnit}]`} value={s.gaugeTemp} onChange={set('gaugeTemp')} inputMode="decimal" />
            </div>
            {gaugeRead !== null && nominal && (
              <div className="mt-4 space-y-3">
                <BigResult label={t('thermal.gaugeReading')} value={fmt(gaugeRead, dg)} unit={u.length} />
                <ResultRow
                  label={t('thermal.gaugeError')}
                  value={`${gaugeRead - nominal >= 0 ? '+' : ''}${fmt(gaugeRead - nominal, dg)}`}
                  unit={u.length}
                  strong
                />
                <Banner tone="warn">{t('thermal.gaugeHint')}</Banner>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-zinc-600 text-center leading-relaxed px-2">{t('thermal.footer')}</p>
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default ThermalPage;
