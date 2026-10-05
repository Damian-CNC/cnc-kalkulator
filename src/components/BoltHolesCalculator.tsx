import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import { parseDecimal } from '@/lib/numericInput';
import { Banner, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';
import {
  HEAD_IDS,
  SIZES,
  calcHoles,
  headAvailable,
  seriesGrade,
  type Fit,
  type HeadId,
  type HolesResult,
  type Mode,
  type Series,
} from '@/lib/boltHoles';

type State = {
  tab: 'basic' | 'advanced';
  unit: 'mm' | 'in';
  size: string;
  head: HeadId;
  series: Series;
  fit: Fit;
  mode: Mode;
  washer: 'none' | 'w7089' | 'w7093' | 'custom';
  washerOd: string;
  washerTh: string;
  customShape: 'round' | 'hex';
  customA: string;
  customK: string;
  recess: string;
  spotDepth: string;
  angle: string;
  plate: string;
  material: 'steel' | 'cast' | 'alu';
};

const INITIAL: State = {
  tab: 'basic',
  unit: 'mm',
  size: '6',
  head: 'socket',
  series: 'medium',
  fit: 'normal',
  mode: 'cbore',
  washer: 'none',
  washerOd: '',
  washerTh: '',
  customShape: 'round',
  customA: '',
  customK: '',
  recess: '0.5',
  spotDepth: '1',
  angle: '90',
  plate: '',
  material: 'steel',
};

const num = (v: string): number | undefined => {
  const n = parseDecimal(v);
  return n === null || !Number.isFinite(n) ? undefined : n;
};

/** Przekrój schematyczny: proporcje poziome według wyniku, głębokość ograniczona do rysunku. */
const CrossSection = ({ r }: { r: HolesResult }) => {
  const Lc = useLength('mm');
  const fmtL = (v: number, d = 2) => (Lc.isImperial ? fmt(v / 25.4, 4) : fmt(v, d));
  const cx = 170;
  const top = 52;
  const bottom = 150;
  const left = 30;
  const right = 310;

  const holeDia = r.hole.nominal;
  const bigDia = r.big?.dia ?? r.csk?.dia ?? holeDia * 1.8;
  const s = 70 / (bigDia / 2);
  const hw = Math.max(8, (holeDia / 2) * s);
  const cw = r.big ? (r.big.dia / 2) * s : r.csk ? (r.csk.dia / 2) * s : hw;
  const depthMm = r.big?.depth ?? r.csk?.depth ?? 0;
  const dpx = Math.min(Math.max(depthMm * s, 5), bottom - top - 12);

  let leftPath: string;
  let rightPath: string;
  if (r.kind === 'csk') {
    leftPath = `M${left},${top} L${cx - cw},${top} L${cx - hw},${top + dpx} L${cx - hw},${bottom} L${left},${bottom} Z`;
    rightPath = `M${right},${top} L${cx + cw},${top} L${cx + hw},${top + dpx} L${cx + hw},${bottom} L${right},${bottom} Z`;
  } else if (r.kind === 'none') {
    leftPath = `M${left},${top} L${cx - hw},${top} L${cx - hw},${bottom} L${left},${bottom} Z`;
    rightPath = `M${right},${top} L${cx + hw},${top} L${cx + hw},${bottom} L${right},${bottom} Z`;
  } else {
    leftPath = `M${left},${top} L${cx - cw},${top} L${cx - cw},${top + dpx} L${cx - hw},${top + dpx} L${cx - hw},${bottom} L${left},${bottom} Z`;
    rightPath = `M${right},${top} L${cx + cw},${top} L${cx + cw},${top + dpx} L${cx + hw},${top + dpx} L${cx + hw},${bottom} L${right},${bottom} Z`;
  }

  const style = { fill: 'rgba(6,182,212,0.12)', stroke: '#06b6d4', strokeWidth: 1.5, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 340 200" className="w-full max-w-[380px] mx-auto block" role="img">
      <path d={leftPath} {...style} />
      <path d={rightPath} {...style} />
      <line x1={cx} y1={top - 10} x2={cx} y2={bottom + 10} stroke="#52525b" strokeWidth="1" strokeDasharray="7 3 1.5 3" />
      {r.kind !== 'none' && (
        <>
          <line x1={cx - cw} y1={top - 8} x2={cx + cw} y2={top - 8} stroke="#a1a1aa" strokeWidth="1" />
          <text x={cx} y={top - 13} fill="#22d3ee" fontSize="11" textAnchor="middle" fontWeight="600">
            Ø{fmtL(r.big?.dia ?? r.csk?.dia ?? 0, 2)}
          </text>
        </>
      )}
      <line x1={cx - hw} y1={bottom + 12} x2={cx + hw} y2={bottom + 12} stroke="#a1a1aa" strokeWidth="1" />
      <text x={cx} y={bottom + 27} fill="#f4f4f5" fontSize="11" textAnchor="middle" fontWeight="600">
        Ø{fmtL(r.hole.nominal, 2)}
      </text>
      {r.kind !== 'none' && depthMm > 0 && (
        <>
          <line x1={cx + cw + 12} y1={top} x2={cx + cw + 12} y2={top + dpx} stroke="#a1a1aa" strokeWidth="1" />
          <text x={cx + cw + 18} y={top + dpx / 2 + 4} fill="#22d3ee" fontSize="11" fontWeight="600">
            {fmtL(depthMm, 2)}
          </text>
        </>
      )}
    </svg>
  );
};

const BoltHolesCalculator = () => {
  const { t } = useTranslation('tools');
  const L = useLength('mm');
  const [s, setS, reset] = usePersistedState<State>('bolt-holes', INITIAL);
  const fmtL = (v: number, d = 2) => (L.isImperial ? fmt(v / 25.4, 4) : fmt(v, d));
  const u = (txt: string) => txt.replace(/\[mm\]/g, `[${L.unit}]`);

  // po zmianie systemu jednostek przeliczamy wpisane wymiary (mm <-> in)
  useEffect(() => {
    const target: 'mm' | 'in' = L.isImperial ? 'in' : 'mm';
    if (s.unit === target) return;
    const k = target === 'in' ? 1 / 25.4 : 25.4;
    const conv = (v: string) => {
      const n = parseDecimal(v);
      return n === null ? v : String(Math.round(n * k * 10000) / 10000);
    };
    setS((p) => ({
      ...p,
      unit: target,
      customA: conv(p.customA),
      customK: conv(p.customK),
      washerOd: conv(p.washerOd),
      washerTh: conv(p.washerTh),
      recess: conv(p.recess),
      spotDepth: conv(p.spotDepth),
      plate: conv(p.plate),
    }));
  }, [L.isImperial, s.unit, setS]);
  const set =
    <K extends keyof State>(k: K) =>
    (e: { target: { value: string } }) =>
      setS((p) => ({ ...p, [k]: e.target.value as State[K] }));

  const adv = s.tab === 'advanced';
  // W trybie podstawowym: bez własnych wymiarów, luz normalny, wytoczenie bez podkładki
  const head: HeadId = !adv && s.head === 'custom' ? 'socket' : s.head;
  const available = headAvailable(head, s.size);
  const imp = L.isImperial;
  const numMm = (v: string) => {
    const n = num(v);
    return n === undefined ? undefined : imp ? n * 25.4 : n;
  };

  const res = useMemo(() => {
    if (!available) return null;
    if (!adv) {
      return calcHoles({
        size: s.size,
        head,
        series: s.series,
        fit: 'normal',
        mode: 'cbore',
        washer: 'none',
        customShape: 'round',
        recess: 0,
        spotDepth: 0,
        angle: 90,
        material: 'steel',
      });
    }
    return calcHoles({
      size: s.size,
      head,
      series: s.series,
      fit: s.fit,
      mode: head === 'csk' ? 'cbore' : s.mode,
      washer: s.washer,
      washerOd: numMm(s.washerOd),
      washerTh: numMm(s.washerTh),
      customShape: s.customShape,
      customA: numMm(s.customA),
      customK: numMm(s.customK),
      recess: numMm(s.recess) ?? 0,
      spotDepth: numMm(s.spotDepth) ?? 0,
      angle: Number(s.angle),
      plate: numMm(s.plate),
      material: s.material,
    });
  }, [s, available, adv, head, imp]);

  const isCsk = head === 'csk';
  const isNut = head === 'nut';
  const headName = (id: HeadId) => t(`holes.heads.${id}`);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        {(['basic', 'advanced'] as const).map((tab) => (
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
            {t(`holes.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className="glass-module">
        <SectionTitle>{t('holes.screwTitle')}</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={t('holes.thread')}
            value={s.size}
            onChange={set('size')}
            options={SIZES.map((z) => ({ value: z, label: `M${z}` }))}
          />
          <SelectField
            label={t('holes.series')}
            value={s.series}
            onChange={set('series')}
            options={(['fine', 'medium', 'coarse'] as Series[]).map((x) => ({
              value: x,
              label: `${t(`holes.seriesNames.${x}`)} (${seriesGrade(x)})`,
            }))}
          />
        </div>
        <div className="mt-4">
          <SelectField
            label={t('holes.head')}
            value={head}
            onChange={set('head')}
            options={HEAD_IDS.filter((id) => adv || id !== 'custom').map((id) => ({
              value: id,
              label: headName(id),
            }))}
          />
        </div>
        {!available && (
          <div className="mt-4">
            <Banner tone="warn">{t('holes.noHeadSize', { head: headName(head), size: `M${s.size}` })}</Banner>
          </div>
        )}
        {adv && head === 'custom' && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <SelectField
              label={t('holes.shape')}
              value={s.customShape}
              onChange={set('customShape')}
              options={[
                { value: 'round', label: t('holes.shapeRound') },
                { value: 'hex', label: t('holes.shapeHex') },
              ]}
            />
            <InputField
              label={`${s.customShape === 'hex' ? 's' : 'Ø'} [${L.unit}]`}
              value={s.customA}
              onChange={set('customA')}
              inputMode="decimal"
            />
            <InputField label={`k [${L.unit}]`} value={s.customK} onChange={set('customK')} inputMode="decimal" />
          </div>
        )}
      </div>

      {adv && (
      <div className="glass-module">
        <SectionTitle>{t('holes.machiningTitle')}</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {!isCsk && (
            <SelectField
              label={t('holes.mode')}
              value={s.mode}
              onChange={set('mode')}
              options={[
                { value: 'cbore', label: t('holes.modes.cbore') },
                { value: 'spot', label: t('holes.modes.spot') },
                { value: 'none', label: t('holes.modes.none') },
              ]}
            />
          )}
          {isCsk && (
            <SelectField
              label={t('holes.angle')}
              value={s.angle}
              onChange={set('angle')}
              options={[
                { value: '90', label: '90° (ISO)' },
                { value: '82', label: '82°' },
                { value: '100', label: '100°' },
              ]}
            />
          )}
          <SelectField
            label={t('holes.fit')}
            value={s.fit}
            onChange={set('fit')}
            options={(['close', 'normal', 'loose'] as Fit[]).map((x) => ({
              value: x,
              label: t(`holes.fits.${x}`),
            }))}
          />
          {!isCsk && s.mode !== 'none' && (
            <SelectField
              label={t('holes.washer')}
              value={s.washer}
              onChange={set('washer')}
              options={[
                { value: 'none', label: t('holes.washers.none') },
                { value: 'w7089', label: t('holes.washers.w7089') },
                { value: 'w7093', label: t('holes.washers.w7093') },
                { value: 'custom', label: t('holes.washers.custom') },
              ]}
            />
          )}
          {(isCsk || s.mode === 'cbore') && (
            <InputField
              label={u(t('holes.recess'))}
              value={s.recess}
              onChange={set('recess')}
              inputMode="decimal"
            />
          )}
          {!isCsk && s.mode === 'spot' && (
            <InputField
              label={u(t('holes.spotDepth'))}
              value={s.spotDepth}
              onChange={set('spotDepth')}
              inputMode="decimal"
            />
          )}
        </div>
        {!isCsk && s.mode !== 'none' && s.washer === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputField label={u(t('holes.washerOd'))} value={s.washerOd} onChange={set('washerOd')} inputMode="decimal" />
            <InputField label={u(t('holes.washerTh'))} value={s.washerTh} onChange={set('washerTh')} inputMode="decimal" />
          </div>
        )}
      </div>
      )}

      {adv && (
      <div className="glass-module">
        <SectionTitle>{t('holes.plateTitle')}</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <InputField label={u(t('holes.plate'))} value={s.plate} onChange={set('plate')} inputMode="decimal" />
          {!isNut && (
            <SelectField
              label={t('holes.material')}
              value={s.material}
              onChange={set('material')}
              options={[
                { value: 'steel', label: t('holes.materials.steel') },
                { value: 'cast', label: t('holes.materials.cast') },
                { value: 'alu', label: t('holes.materials.alu') },
              ]}
            />
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('holes.plateHint')}</p>
      </div>
      )}

      {res && (
        <>
          <div className="glass-module">
            <SectionTitle>{t('holes.sectionTitle')}</SectionTitle>
            <CrossSection r={res} />
          </div>

          <div className="glass-module">
            <SectionTitle>{t('holes.holeTitle')}</SectionTitle>
            <ResultRow
              label={t('holes.holeNominal', { series: t(`holes.seriesNames.${s.series}`) })}
              value={fmtL(res.hole.nominal, 2)}
              unit={L.unit}
              strong
            />
            <ResultRow
              label={t('holes.tolerance', { grade: res.hole.grade })}
              value={`+${fmtL(res.hole.tolUm / 1000, 3)} / 0`}
              unit={L.unit}
            />
            <ResultRow
              label={t('holes.limits')}
              value={`${fmtL(res.hole.min, 2)} … ${fmtL(res.hole.max, 3)}`}
              copy={fmtL(res.hole.nominal, 2)}
              unit={L.unit}
            />
          </div>

          {res.kind === 'csk' && res.csk && (
            <div className="glass-module">
              <SectionTitle>{t('holes.cskTitle')}</SectionTitle>
              <ResultRow label={t('holes.cskDia')} value={fmtL(res.csk.dia, 2)} unit={L.unit} strong />
              <ResultRow label={t('holes.cskAngle')} value={`${res.csk.angle}`} unit="°" />
              <ResultRow label={t('holes.cskDepth')} value={fmtL(res.csk.depth, 2)} unit={L.unit} strong />
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('holes.cskNote')}</p>
            </div>
          )}

          {(res.kind === 'cbore' || res.kind === 'spot') && res.big && (
            <div className="glass-module">
              <SectionTitle>
                {res.kind === 'cbore' ? t('holes.cboreTitle') : t('holes.spotTitle')}
              </SectionTitle>
              <ResultRow label={t('holes.bigDia')} value={fmtL(res.big.dia, 1)} unit={L.unit} strong />
              <ResultRow
                label={t('holes.tolerance', { grade: 'H13' })}
                value={`+${fmtL(res.big.tolUm / 1000, 3)} / 0`}
                unit={L.unit}
              />
              <ResultRow label={t('holes.bigDepth')} value={fmtL(res.big.depth, 2)} unit={L.unit} strong />
              {res.headShape === 'hex' && (
                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{t('holes.hexNote')}</p>
              )}
            </div>
          )}

          {adv && (
          <div className="glass-module">
            <SectionTitle>{t('holes.headDims')}</SectionTitle>
            <ResultRow
              label={res.headShape === 'hex' ? t('holes.acrossFlats') : t('holes.headDia')}
              value={fmtL(res.headA, 2)}
              unit={L.unit}
            />
            {res.headShape === 'hex' && (
              <ResultRow label={t('holes.acrossCorners')} value={fmtL(res.headEff, 2)} unit={L.unit} />
            )}
            <ResultRow
              label={isNut ? t('holes.nutHeight') : t('holes.headHeight')}
              value={fmtL(res.headK, 2)}
              unit={L.unit}
            />
            {res.washer && (
              <ResultRow
                label={t('holes.washerDims')}
                value={`Ø${fmtL(res.washer.od, 1)} × ${fmtL(res.washer.th, 1)}`}
                unit={L.unit}
              />
            )}
          </div>
          )}

          {adv && (res.remaining !== null || res.length) && (
            <div className="glass-module">
              <SectionTitle>{t('holes.plateResult')}</SectionTitle>
              {res.remaining !== null && (
                <ResultRow label={t('holes.remaining')} value={fmtL(res.remaining, 2)} unit={L.unit} strong />
              )}
              {res.length && (
                <>
                  <ResultRow label={t('holes.engagement')} value={fmtL(res.length.engagement, 1)} unit={L.unit} />
                  <ResultRow label={t('holes.lengthMin')} value={fmtL(res.length.min, 1)} unit={L.unit} />
                  <ResultRow
                    label={t('holes.lengthStd')}
                    value={res.length.std !== null ? `${res.length.std}` : '—'}
                    unit={L.unit}
                    strong
                  />
                  <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                    {isCsk ? t('holes.lengthNoteCsk') : t('holes.lengthNote')}
                  </p>
                </>
              )}
            </div>
          )}

          {res.warnings.length > 0 && (
            <div className="space-y-3">
              {res.warnings.map((w) => (
                <Banner key={w} tone={w === 'platePierced' || w === 'cboreSmall' || w === 'cskSmall' ? 'bad' : 'warn'}>
                  {t(`holes.warn.${w}`)}
                </Banner>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-600 text-center leading-relaxed px-2">{t('holes.footer')}</p>
        </>
      )}

      <ClearFab onClear={reset} />
    </div>
  );
};

export default BoltHolesCalculator;
