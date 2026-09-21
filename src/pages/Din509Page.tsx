import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import FormulaHelper from '@/components/FormulaHelper';
import useQueryState from '@/hooks/useQueryState';
import {
  DIN509_TYPES,
  findDin509,
  rowsForType,
  uniqueRadiiForType,
  t1OptionsForRadius,
  type Din509Type,
} from '@/data/din509Data';

const TYPES: Din509Type[] = ['E', 'F', 'G', 'H'];

const imageForType = (type: Din509Type) => `${import.meta.env.BASE_URL}din509/form-${type.toLowerCase()}.jpg`;

const Din509Page = () => {
  const { t } = useTranslation(['din509', 'translation']);
  const { t: th } = useTranslation('app');
  const [type, setType] = useQueryState<Din509Type>('type', 'E', TYPES);
  const [rValue, setRValue] = useState<string>('');
  const [t1Value, setT1Value] = useState<string>('');

  const r = parseFloat(rValue.replace(',', '.'));
  const t1 = parseFloat(t1Value.replace(',', '.'));
  const result = useMemo(() => {
    if (isNaN(r) || isNaN(t1)) return null;
    return findDin509(type, r, t1);
  }, [type, r, t1]);

  const info = DIN509_TYPES[type];
  const typeRows = rowsForType(type);
  const uniqueRadii = uniqueRadiiForType(type);
  const t1Options = !isNaN(r) ? t1OptionsForRadius(type, r) : [];

  return (
    <PageLayout title={t('translation:pages.din509')} favoriteTitle={`${t('translation:pages.din509')} — ${t('din509:type', { type })}`}>
      <div className="space-y-4">
        {/* Type tabs */}
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((ty) => (
            <button
              key={ty}
              onClick={() => { setType(ty); setRValue(''); setT1Value(''); }}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                type === ty
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {t('din509:type', { type: ty })}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-start gap-1">
            <p className="text-sm text-zinc-300 flex-1">{t(`din509:descriptions.${type}`)}</p>
            <FormulaHelper
              title={th('formulas.din509.title')}
              formula={type === 'E' ? 'r + t₁ → f, d₁' : 'r + t₁ → t₂, f, g, d₁'}
              note={th('formulas.din509.note')}
              label={th('formulas.help')}
              params={[
                { symbol: 'r', desc: th('formulas.din509.p.r') },
                { symbol: 't1', desc: th('formulas.din509.p.t1') },
                { symbol: 'f', desc: th('formulas.din509.p.f') },
              ]}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-zinc-500">
            {info.approachAngle !== null && (
              <span>{t('din509:entryAngle')} <span className="text-cyan-400 font-bold">{info.approachAngle}°</span></span>
            )}
            <span>{t('din509:exitAngle')} <span className="text-cyan-400 font-bold">{info.exitAngle}°</span></span>
          </div>
        </div>

        <div className="w-full flex items-center justify-center p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl min-h-[220px]">
          <img
            src={imageForType(type)}
            alt={t('din509:drawingAlt', { type })}
            className="max-h-56 w-auto max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Inputs */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-500 mb-2">
                {t('din509:radiusR')}
              </label>
              <select
                value={rValue}
                title={t('din509:radiusTolerance')}
                onChange={(e) => { setRValue(e.target.value); setT1Value(''); }}
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="">{t('din509:select')}</option>
                {uniqueRadii.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-zinc-500 mb-2">
                {t('din509:depthT1')}
              </label>
              <select
                value={t1Value}
                title={t('din509:depthT1Tolerance')}
                onChange={(e) => setT1Value(e.target.value)}
                disabled={!t1Options.length}
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer disabled:opacity-50"
              >
                <option value="">{t('din509:select')}</option>
                {t1Options.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{t('din509:dimensionsTitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label={t('din509:widthF')} value={`${result.f} mm`} note={t('din509:widthFTolerance')} />
              {result.g !== null && <ResultCard label={t('din509:offsetG')} value={`${result.g} mm`} note={t('din509:offsetGNote')} />}
              {result.t2 !== null && <ResultCard label={t('din509:depthT2')} value={`${result.t2} mm`} note={t('din509:depthT2Tolerance')} />}
              <ResultCard label={t('din509:diameterD1')} value={result.dRange} note={`${t('din509:diameterNote')} · ${t(`din509:loads.${result.load}`)}`} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{t('din509:drawingMark')}</p>
              <p className="text-cyan-400 font-bold text-lg">
                DIN 509 — {type} {result.r} × {result.t1}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-500 text-sm">
            {t('din509:chooseHintPrefix')} <span className="text-cyan-400 font-bold">r</span> {t('din509:chooseHintMiddle')} <span className="text-cyan-400 font-bold">t₁</span>{t('din509:chooseHintSuffix')}
          </div>
        )}

        {/* Full table */}
        <details className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            {t('din509:dimensionsTable')}
          </summary>
          <div className="mt-3 overflow-x-auto cv-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="py-2 px-2 text-left" title={t('din509:radiusTolerance')}>r</th>
                  <th className="py-2 px-2 text-left" title={t('din509:depthT1Tolerance')}>t₁</th>
                  {type !== 'E' && <th className="py-2 px-2 text-left" title={t('din509:depthT2Tolerance')}>t₂</th>}
                  <th className="py-2 px-2 text-left" title={t('din509:widthFTolerance')}>f</th>
                  {type !== 'E' && <th className="py-2 px-2 text-left" title={t('din509:offsetGNote')}>g</th>}
                  <th className="py-2 px-2 text-left">d₁</th>
                </tr>
              </thead>
              <tbody>
                {typeRows.map((row) => {
                  const selected = result?.r === row.r && result?.t1 === row.t1;
                  return <tr key={`${row.type}-${row.r}-${row.t1}`} className={`border-t border-zinc-800/60 ${selected ? 'bg-cyan-500/10 text-zinc-100' : 'text-zinc-300'}`}>
                    <td className="py-2 px-2">{row.r}</td>
                    <td className="py-2 px-2">{row.t1}</td>
                    {type !== 'E' && <td className="py-2 px-2 text-cyan-400 font-bold">{row.t2 ?? '—'}</td>}
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.f}</td>
                    {type !== 'E' && <td className="py-2 px-2 text-cyan-400 font-bold">{row.g ?? '—'}</td>}
                    <td className="py-2 px-2 text-zinc-500 text-xs">{row.dRange}<span className="block text-[10px]">{t(`din509:loads.${row.load}`)}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </PageLayout>
  );
};

const ResultCard = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 text-center" title={note}>
    <p className="text-xs font-semibold tracking-wider text-zinc-500 mb-1">{label}</p>
    <p className="text-cyan-400 font-bold text-xl">{value}</p>
    <p className="text-[10px] leading-snug text-zinc-600 mt-1">{note}</p>
  </div>
);

export default Din509Page;
