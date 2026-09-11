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
    E: 'M24 36 H116 V104 H132 Q140 104 146 96 Q158 83 184 80 H296 V160 H24 Z',
    F: 'M24 36 H116 V91 Q116 104 129 104 H144 Q151 104 157 97 Q169 84 190 80 H296 V160 H24 Z',
    G: 'M24 36 H116 V83 L101 101 Q104 104 113 104 H145 Q152 104 158 97 Q170 84 191 80 H296 V160 H24 Z',
    H: 'M24 36 H116 V78 L98 101 Q101 104 109 104 H145 Q152 104 158 97 Q170 84 191 80 H296 V160 H24 Z',
  };
  const t2Start = type === 'F' ? 116 : type === 'G' ? 101 : 98;

  return (
    <EngineeringDrawing label={`DIN 509 form ${type}`}>
      {({ arrow, hatch }) => (
        <>
          <path d={profileByType[type]} fill={`url(#${hatch})`} className="stroke-zinc-200 stroke-[2]" strokeLinejoin="round" />
          <Centerline x1={18} y1={160} x2={302} y2={160} />
          <Witness x1={180} y1={78} x2={278} y2={78} />
          <Witness x1={180} y1={106} x2={278} y2={106} />
          <Dimension x1={268} y1={80} x2={268} y2={104} label="t₁" arrowId={arrow} active={active === 't1'} labelX={282} labelY={92} rotateLabel />
          <Leader points="145,97 164,62 197,62" label="r" labelX={201} labelY={65} active={active === 'r'} />
          <Leader points="176,86 202,54 233,54" label="15°" labelX={237} labelY={57} />
          {type !== 'E' && (
            <>
              <Witness x1={t2Start} y1={34} x2={t2Start} y2={18} />
              <Witness x1={116} y1={34} x2={116} y2={18} />
              <Dimension x1={t2Start + 3} y1={22} x2={113} y2={22} label="t₂" arrowId={arrow} active={active === 't2'} labelY={11} />
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
              onClick={() => setType(ty)}
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
