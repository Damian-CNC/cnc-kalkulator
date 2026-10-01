import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import usePersistedState from '@/hooks/usePersistedState';
import { parseDecimal } from '@/lib/numericInput';
import { DEG, solveOblique, solveRight, toDms, type Oblique } from '@/lib/trig';
import { useUnits } from '@/contexts/UnitContext';
import { Banner, ResultRow, SectionTitle, fmt } from '@/components/ToolsUi';

type Tab = 'right' | 'oblique' | 'points' | 'polar';

type Shape = {
  tab: Tab;
  rA: string; rB: string; rC: string; rAlpha: string; rBeta: string;
  oa: string; ob: string; oc: string; oA: string; oB: string; oC: string;
  x1: string; y1: string; x2: string; y2: string;
  pr: string; pth: string; px: string; py: string;
};

const INITIAL: Shape = {
  tab: 'right',
  rA: '', rB: '', rC: '', rAlpha: '', rBeta: '',
  oa: '', ob: '', oc: '', oA: '', oB: '', oC: '',
  x1: '', y1: '', x2: '', y2: '',
  pr: '', pth: '', px: '', py: '',
};

const TABS: Tab[] = ['right', 'oblique', 'points', 'polar'];

const ang = (v: number) => `${fmt(v, 4)}°`;

type RightValues = {
  a: number | null;
  b: number | null;
  c: number | null;
  alpha: number | null;
  beta: number | null;
};

/**
 * Podgląd trójkąta prostokątnego. Proporcje rysunku odpowiadają wynikowi,
 * a opisy pokazują wpisane (białe) i obliczone (turkusowe) wartości.
 */
const RightTriangleDiagram = ({
  right,
  values,
  unitLabel,
}: {
  right: { a: number; b: number; c: number; alpha: number; beta: number } | null;
  values: RightValues;
  unitLabel: string;
}) => {
  const shown = right ?? values;
  const has = (k: keyof RightValues) => shown[k] !== null && shown[k] !== undefined;

  // Wymiary rysunku (skalowane do pola 150 x 90, z minimalnym rozmiarem)
  const MAX_W = 150;
  const MAX_H = 90;
  const MIN = 20;
  let dw = 150;
  let dh = 75;
  if (right) {
    const scale = Math.min(MAX_W / right.b, MAX_H / right.a);
    dw = Math.max(MIN, right.b * scale);
    dh = Math.max(MIN, right.a * scale);
  }

  const x0 = 80;
  const y0 = 120;
  const A = { x: x0, y: y0 }; // wierzchołek przy α
  const C = { x: x0 + dw, y: y0 }; // kąt prosty
  const B = { x: x0 + dw, y: y0 - dh }; // wierzchołek przy β

  const len = Math.hypot(dw, dh);
  const nx = -dh / len;
  const ny = -dw / len;
  const mid = { x: (A.x + B.x) / 2 + nx * 8, y: (A.y + B.y) / 2 + ny * 8 };

  const entered = (k: keyof RightValues) => values[k] !== null;
  const fill = (k: keyof RightValues) => (entered(k) ? '#f4f4f5' : '#22d3ee');
  const side = (name: string, k: 'a' | 'b' | 'c') =>
    has(k) ? `${name} = ${fmt(shown[k] as number, 3)}` : name;
  const angle = (name: string, k: 'alpha' | 'beta') =>
    has(k) ? `${name} = ${fmt(shown[k] as number, 2)}°` : name;

  return (
    <div className="mt-4">
      <svg viewBox="0 0 340 160" className="w-full max-w-[380px] mx-auto block" role="img">
        <polygon
          points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`}
          fill="rgba(6,182,212,0.08)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polyline
          points={`${C.x - 9},${C.y} ${C.x - 9},${C.y - 9} ${C.x},${C.y - 9}`}
          fill="none"
          stroke="#71717a"
          strokeWidth="1"
        />
        <text x={(A.x + C.x) / 2} y={A.y + 17} fill={fill('b')} fontSize="11" textAnchor="middle" fontWeight="600">
          {side('b', 'b')}
        </text>
        <text x={C.x + 9} y={(B.y + C.y) / 2 + 4} fill={fill('a')} fontSize="11" textAnchor="start" fontWeight="600">
          {side('a', 'a')}
        </text>
        <text x={mid.x} y={mid.y + 3} fill={fill('c')} fontSize="11" textAnchor="end" fontWeight="600">
          {side('c', 'c')}
        </text>
        <text x={A.x - 8} y={A.y + 4} fill={fill('alpha')} fontSize="11" textAnchor="end" fontWeight="600">
          {angle('α', 'alpha')}
        </text>
        <text x={B.x} y={B.y - 8} fill={fill('beta')} fontSize="11" textAnchor="end" fontWeight="600">
          {angle('β', 'beta')}
        </text>
        <text x={C.x + 9} y={C.y + 4} fill="#71717a" fontSize="10" textAnchor="start">
          C 90°
        </text>
      </svg>
      <p className="text-[11px] text-zinc-500 text-center mt-1">
        [{unitLabel}]
      </p>
    </div>
  );
};

const TrigCalculator = () => {
  const { t } = useTranslation('tools');
  const { u } = useUnits();
  const [s, setS, reset] = usePersistedState<Shape>('trig', INITIAL);

  const set = (k: keyof Shape) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setS((prev) => ({ ...prev, [k]: e.target.value }));

  const n = (k: keyof Shape) => parseDecimal(s[k] as string);

  /* ---------- trójkąt prostokątny ---------- */
  const right = useMemo(
    () => solveRight({ a: n('rA'), b: n('rB'), c: n('rC'), alpha: n('rAlpha'), beta: n('rBeta') }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.rA, s.rB, s.rC, s.rAlpha, s.rBeta],
  );

  /* ---------- dowolny trójkąt ---------- */
  const oblique = useMemo(() => {
    const sides = [n('oa'), n('ob'), n('oc')];
    const angles = [n('oA'), n('oB'), n('oC')];
    const first = solveOblique(sides, angles, false);
    const second = first.ambiguous ? solveOblique(sides, angles, true) : null;
    return { first: first.sol, second: second?.sol ?? null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.oa, s.ob, s.oc, s.oA, s.oB, s.oC]);

  /* ---------- dwa punkty ---------- */
  const pts = useMemo(() => {
    const x1 = n('x1'), y1 = n('y1'), x2 = n('x2'), y2 = n('y2');
    if (x1 === null || y1 === null || x2 === null || y2 === null) return null;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    let angle = Math.atan2(dy, dx) / DEG;
    if (angle < 0) angle += 360;
    return { dx, dy, dist, angle, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, slope: dx !== 0 ? (dy / dx) * 100 : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.x1, s.y1, s.x2, s.y2]);

  /* ---------- współrzędne biegunowe <-> kartezjańskie ---------- */
  const toXY = useMemo(() => {
    const r = n('pr'), th = n('pth');
    if (r === null || th === null) return null;
    return { x: r * Math.cos(th * DEG), y: r * Math.sin(th * DEG) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.pr, s.pth]);

  const toPolar = useMemo(() => {
    const x = n('px'), y = n('py');
    if (x === null || y === null) return null;
    let th = Math.atan2(y, x) / DEG;
    if (th < 0) th += 360;
    return { r: Math.hypot(x, y), th };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.px, s.py]);

  const angleRow = (label: string, v: number) => (
    <ResultRow label={label} value={ang(v)} copy={fmt(v, 4)} strong />
  );
  const dmsRow = (label: string, v: number) => (
    <ResultRow label={label} value={toDms(v)} />
  );

  const renderOblique = (sol: Oblique, title?: string) => (
    <div className="mb-2">
      {title && <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">{title}</p>}
      <ResultRow label="a" value={fmt(sol.a, 4)} unit={u.length} strong />
      <ResultRow label="b" value={fmt(sol.b, 4)} unit={u.length} strong />
      <ResultRow label="c" value={fmt(sol.c, 4)} unit={u.length} strong />
      {angleRow('A', sol.A)}
      {angleRow('B', sol.B)}
      {angleRow('C', sol.C)}
      <ResultRow label={t('trig.area')} value={fmt(sol.area, 4)} unit={`${u.length}²`} />
      <ResultRow label={t('trig.perimeter')} value={fmt(sol.perimeter, 4)} unit={u.length} />
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setS((prev) => ({ ...prev, tab }))}
            className={`py-3 rounded-xl font-bold text-sm transition-all border ${
              s.tab === tab
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {t(`trig.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {s.tab === 'right' && (
        <>
          <div className="glass-module">
            <SectionTitle>{t('trig.rightTitle')}</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InputField label={`a [${u.length}]`} value={s.rA} onChange={set('rA')} />
              <InputField label={`b [${u.length}]`} value={s.rB} onChange={set('rB')} />
              <InputField label={`c [${u.length}] (${t('trig.hyp')})`} value={s.rC} onChange={set('rC')} />
              <div className="hidden sm:block" />
              <InputField label="α [°]" value={s.rAlpha} onChange={set('rAlpha')} />
              <InputField label="β [°]" value={s.rBeta} onChange={set('rBeta')} />
            </div>
            <p className="text-xs text-zinc-500 mt-4 leading-relaxed">{t('trig.rightHint')}</p>
            <RightTriangleDiagram
              right={right}
              values={{ a: n('rA'), b: n('rB'), c: n('rC'), alpha: n('rAlpha'), beta: n('rBeta') }}
              unitLabel={u.length}
            />
          </div>
          {right ? (
            <div className="glass-module">
              <SectionTitle>{t('common.result')}</SectionTitle>
              <ResultRow label="a" value={fmt(right.a, 4)} unit={u.length} strong />
              <ResultRow label="b" value={fmt(right.b, 4)} unit={u.length} strong />
              <ResultRow label="c" value={fmt(right.c, 4)} unit={u.length} strong />
              {angleRow('α', right.alpha)}
              {angleRow('β', right.beta)}
              {dmsRow('α (DMS)', right.alpha)}
              {dmsRow('β (DMS)', right.beta)}
              <ResultRow label={t('trig.area')} value={fmt(right.area, 4)} unit={`${u.length}²`} />
              <ResultRow label={t('trig.slope')} value={fmt(right.slopePct, 3)} unit="%" />
            </div>
          ) : (
            (s.rA || s.rB || s.rC || s.rAlpha || s.rBeta) && (
              <Banner tone="warn">{t('trig.needMore')}</Banner>
            )
          )}
        </>
      )}

      {s.tab === 'oblique' && (
        <>
          <div className="glass-module">
            <SectionTitle>{t('trig.obliqueTitle')}</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <InputField label={`a [${u.length}]`} value={s.oa} onChange={set('oa')} />
              <InputField label={`b [${u.length}]`} value={s.ob} onChange={set('ob')} />
              <InputField label={`c [${u.length}]`} value={s.oc} onChange={set('oc')} />
              <InputField label="A [°]" value={s.oA} onChange={set('oA')} />
              <InputField label="B [°]" value={s.oB} onChange={set('oB')} />
              <InputField label="C [°]" value={s.oC} onChange={set('oC')} />
            </div>
            <p className="text-xs text-zinc-500 mt-4 leading-relaxed">{t('trig.obliqueHint')}</p>
          </div>
          {oblique.first ? (
            <div className="glass-module">
              <SectionTitle>{t('common.result')}</SectionTitle>
              {oblique.second && (
                <div className="mb-4">
                  <Banner tone="warn">{t('trig.ambiguous')}</Banner>
                </div>
              )}
              {renderOblique(oblique.first, oblique.second ? t('trig.solution1') : undefined)}
              {oblique.second && (
                <div className="mt-4">{renderOblique(oblique.second, t('trig.solution2'))}</div>
              )}
            </div>
          ) : (
            (s.oa || s.ob || s.oc || s.oA || s.oB || s.oC) && (
              <Banner tone="warn">{t('trig.needMoreOblique')}</Banner>
            )
          )}
        </>
      )}

      {s.tab === 'points' && (
        <>
          <div className="glass-module">
            <SectionTitle>{t('trig.pointsTitle')}</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InputField label={`X1 [${u.length}]`} value={s.x1} onChange={set('x1')} inputMode="text" />
              <InputField label={`Y1 [${u.length}]`} value={s.y1} onChange={set('y1')} inputMode="text" />
              <InputField label={`X2 [${u.length}]`} value={s.x2} onChange={set('x2')} inputMode="text" />
              <InputField label={`Y2 [${u.length}]`} value={s.y2} onChange={set('y2')} inputMode="text" />
            </div>
          </div>
          {pts && (
            <div className="glass-module">
              <SectionTitle>{t('common.result')}</SectionTitle>
              <ResultRow label={t('trig.distance')} value={fmt(pts.dist, 4)} unit={u.length} strong />
              {angleRow(t('trig.angleX'), pts.angle)}
              {dmsRow(t('trig.angleX') + ' (DMS)', pts.angle)}
              <ResultRow label="ΔX" value={fmt(pts.dx, 4)} unit={u.length} />
              <ResultRow label="ΔY" value={fmt(pts.dy, 4)} unit={u.length} />
              <ResultRow label={t('trig.midpoint')} value={`X${fmt(pts.mx, 3)}  Y${fmt(pts.my, 3)}`} />
              {pts.slope !== null && (
                <ResultRow label={t('trig.slope')} value={fmt(pts.slope, 3)} unit="%" />
              )}
            </div>
          )}
        </>
      )}

      {s.tab === 'polar' && (
        <>
          <div className="glass-module">
            <SectionTitle>{t('trig.polarToXY')}</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InputField label={`R [${u.length}]`} value={s.pr} onChange={set('pr')} />
              <InputField label="θ [°]" value={s.pth} onChange={set('pth')} inputMode="text" />
            </div>
            {toXY && (
              <div className="mt-4">
                <ResultRow label="X" value={fmt(toXY.x, 4)} unit={u.length} strong />
                <ResultRow label="Y" value={fmt(toXY.y, 4)} unit={u.length} strong />
              </div>
            )}
          </div>
          <div className="glass-module">
            <SectionTitle>{t('trig.xyToPolar')}</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InputField label={`X [${u.length}]`} value={s.px} onChange={set('px')} inputMode="text" />
              <InputField label={`Y [${u.length}]`} value={s.py} onChange={set('py')} inputMode="text" />
            </div>
            {toPolar && (
              <div className="mt-4">
                <ResultRow label="R" value={fmt(toPolar.r, 4)} unit={u.length} strong />
                {angleRow('θ', toPolar.th)}
                {dmsRow('θ (DMS)', toPolar.th)}
              </div>
            )}
          </div>
        </>
      )}

      <ClearFab onClear={reset} />
    </>
  );
};

export default TrigCalculator;
