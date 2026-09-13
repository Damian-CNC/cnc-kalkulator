import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import FormulaHelper from '@/components/FormulaHelper';
import { Centerline, Dimension, EngineeringDrawing, Leader, Witness } from '@/components/EngineeringDrawing';
import {
  DIN509_TYPES,
  DIN509_ROWS,
  findDin509,
  uniqueRadii,
  t1OptionsForRadius,
  type Din509Type,
} from '@/data/din509Data';

const TYPES: Din509Type[] = ['E', 'F', 'G', 'H'];

type DinDimension = 'r' | 't1' | 't2' | null;

const Din509Svg = ({ type, active }: { type: Din509Type; active: DinDimension }) => {
  const profileByType: Record<Din509Type, string> = {
    E: 'M20 28 H96 V102 A10 10 0 0 0 106 112 H112 L202 88 H300 V164 H20 Z',
    F: 'M20 28 H96 L106 100 A12 12 0 0 0 118 112 H124 L214 88 H300 V164 H20 Z',
    G: 'M20 28 H96 L104 103 A7 7 0 0 0 111 110 H119 L201 88 H300 V164 H20 Z',
    H: 'M20 28 H96 L108 94 A18 18 0 0 0 126 112 H134 L224 88 H300 V164 H20 Z',
  };
  const isCombined = type !== 'E';
  const shoulderInset = type === 'G' ? 104 : type === 'H' ? 108 : 106;
  const radiusPoint = type === 'E' ? '106,111' : type === 'G' ? '108,109' : type === 'H' ? '119,108' : '113,110';
  const flankStart = type === 'E' ? 112 : type === 'G' ? 119 : type === 'H' ? 134 : 124;
  const flankEnd = type === 'E' ? 202 : type === 'G' ? 201 : type === 'H' ? 224 : 214;

  return (
    <EngineeringDrawing label={`DIN 509 form ${type}`}>
      {({ arrow, hatch }) => (
        <>
          <path d={profileByType[type]} fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" strokeLinejoin="round" />
          <Centerline x1={18} y1={164} x2={302} y2={164} />
          <line x1={96} y1={88} x2={286} y2={88} className="stroke-zinc-500 stroke-[1]" strokeDasharray="5 4" />
          <Witness x1={flankStart - 2} y1={114} x2={274} y2={114} />
          <Witness x1={flankEnd + 2} y1={88} x2={274} y2={88} />
          <Dimension x1={266} y1={92} x2={266} y2={110} label="t₁" arrowId={arrow} active={active === 't1'} labelX={280} labelY={101} rotateLabel />
          <Leader points={`${radiusPoint} 147,67 174,67`} label="r" labelX={180} labelY={70} active={active === 'r'} arrowId={arrow} />
          <line x1={flankEnd - 30} y1={88} x2={flankEnd + 4} y2={88} className="stroke-cyan-400 stroke-[1.2]" />
          <path d={`M${flankEnd - 23} 88 A23 23 0 0 1 ${flankEnd - 24} 94`} className="stroke-cyan-400 stroke-[1.2]" />
          <text x={flankEnd - 47} y="82" className="fill-cyan-300 font-mono text-[11px] font-bold">15°</text>
          {isCombined && (
            <>
              <Witness x1={96} y1={30} x2={96} y2={13} />
              <Witness x1={shoulderInset} y1={88} x2={shoulderInset} y2={13} />
              <Dimension x1={99} y1={17} x2={shoulderInset - 3} y2={17} label="t₂" arrowId={arrow} active={active === 't2'} labelX={102} labelY={8} />
              <line x1={96} y1={55} x2={96} y2={82} className="stroke-cyan-400 stroke-[1.2]" />
              <path d={`M96 72 A22 22 0 0 1 ${shoulderInset - 1} 70`} className="stroke-cyan-400 stroke-[1.2]" />
              <text x="70" y="70" className="fill-cyan-300 font-mono text-[11px] font-bold">8°</text>
            </>
          )}
          <text x="22" y="174" className="fill-zinc-500 font-mono text-[9px]">ISO 128 · DIN 509-{type}</text>
        </>
      )}
    </EngineeringDrawing>
  );
};

const Din509Page = () => {
  const { t } = useTranslation(['din509', 'translation']);
  const { t: th } = useTranslation('app');
  const [type, setType] = useState<Din509Type>('E');
  const [rValue, setRValue] = useState<string>('');
  const [t1Value, setT1Value] = useState<string>('');
  const [activeDimension, setActiveDimension] = useState<DinDimension>(null);

  const r = parseFloat(rValue.replace(',', '.'));
  const t1 = parseFloat(t1Value.replace(',', '.'));
  const result = useMemo(() => {
    if (isNaN(r) || isNaN(t1)) return null;
    return findDin509(r, t1);
  }, [r, t1]);

  const info = DIN509_TYPES[type];
  const t1Options = !isNaN(r) ? t1OptionsForRadius(r) : [];

  return (
    <PageLayout title={t('translation:pages.din509')}>
      <div className="space-y-4">
        {/* Type tabs */}
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map((ty) => (
            <button
              key={ty}
              onClick={() => { setType(ty); setActiveDimension(null); }}
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
            <p className="text-sm text-zinc-300 flex-1">{info.description}</p>
            <FormulaHelper
              title={th('formulas.din509.title')}
              formula="r + t1 → f, g, t2 (DIN 509)"
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

        {/* SVG */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 flex justify-center">
          <Din509Svg type={type} active={activeDimension} />
        </div>

        {/* Inputs */}
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                {t('din509:radiusR')}
              </label>
              <select
                value={rValue}
                onFocus={() => setActiveDimension('r')}
                onBlur={() => setActiveDimension(null)}
                onChange={(e) => { setActiveDimension('r'); setRValue(e.target.value); setT1Value(''); }}
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="">{t('din509:select')}</option>
                {uniqueRadii.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                {t('din509:depthT1')}
              </label>
              <select
                value={t1Value}
                onFocus={() => setActiveDimension('t1')}
                onBlur={() => setActiveDimension(null)}
                onChange={(e) => { setActiveDimension('t1'); setT1Value(e.target.value); }}
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
            <div className={`grid gap-3 ${type === 'E' ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <ResultCard label={t('din509:widthF')} value={`${result.f} mm`} />
              {type !== 'E' && <ResultCard label={t('din509:offsetG')} value={`${result.g} mm`} />}
              {type !== 'E' && <ResultCard label={t('din509:depthT2')} value={`${result.t2} mm`} onFocus={() => setActiveDimension('t2')} onBlur={() => setActiveDimension(null)} />}
            </div>
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{t('din509:drawingMark')}</p>
              <p className="text-cyan-400 font-bold text-lg">
                DIN 509 — {type} {result.r} × {result.t1}
              </p>
              <p className="text-zinc-500 text-xs mt-1">{t('din509:range', { range: result.dRange })}</p>
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
            {t('din509:fullTable')}
          </summary>
          <div className="mt-3 overflow-x-auto cv-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="py-2 px-2 text-left">r</th>
                  <th className="py-2 px-2 text-left">t₁</th>
                  <th className="py-2 px-2 text-left">f</th>
                  <th className="py-2 px-2 text-left">g</th>
                  <th className="py-2 px-2 text-left">t₂</th>
                  <th className="py-2 px-2 text-left">{t('din509:diameter')}</th>
                </tr>
              </thead>
              <tbody>
                {DIN509_ROWS.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-800/60 text-zinc-300">
                    <td className="py-2 px-2">{row.r}</td>
                    <td className="py-2 px-2">{row.t1}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.f}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.g}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold">{row.t2}</td>
                    <td className="py-2 px-2 text-zinc-500 text-xs">{row.dRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </PageLayout>
  );
};

const ResultCard = ({ label, value, onFocus, onBlur }: { label: string; value: string; onFocus?: () => void; onBlur?: () => void }) => (
  <div tabIndex={onFocus ? 0 : undefined} onFocus={onFocus} onBlur={onBlur} onClick={onFocus} className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 text-center focus:outline-none focus:border-cyan-500/60">
    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
    <p className="text-cyan-400 font-bold text-xl">{value}</p>
  </div>
);

export default Din509Page;
