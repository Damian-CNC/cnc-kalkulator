import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import CopyableValue from '@/components/CopyableValue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import useQueryState from '@/hooks/useQueryState';
import { parseDecimal } from '@/lib/numericInput';
import {
  ACME_CLASSES,
  ACME_SIZES,
  MM,
  calcAcme,
  type AcmeClass,
  type Lim,
} from '@/lib/acmeThread';

type Range = Lim;

type State = {
  size: string; // id z serii albo 'custom'
  cls: AcmeClass;
  starts: string;
  customD: string;
  customN: string;
};
const INITIAL: State = { size: '1/2', cls: '2G', starts: '1', customD: '', customN: '' };


const AcmeThreadPage = () => {
  const { t } = useTranslation('tools');
  const L = useLength('in');
  const [s, setS, reset] = usePersistedState<State>('acme-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'acme-tab');

  const isCustom = s.size === 'custom';
  const std = ACME_SIZES.find((z) => z.id === s.size);
  const customDv = parseDecimal(s.customD);
  const D = isCustom ? (customDv === null ? null : L.isImperial ? customDv : customDv / 25.4) : std?.D ?? null;
  const n = isCustom ? parseDecimal(s.customN) : std?.n ?? null;
  const starts = Math.min(6, Math.max(1, Math.round(parseDecimal(s.starts) ?? 1)));

  const res = useMemo(
    () => (D !== null && n !== null ? calcAcme(D, n, s.cls, starts) : null),
    [D, n, s.cls, starts],
  );

  return (
    <PageLayout title={t('acme.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label={t('acme.size')}
            value={s.size}
            onChange={(e) => setS((p) => ({ ...p, size: e.target.value }))}
            options={[
              ...ACME_SIZES.map((z) => ({ value: z.id, label: `${z.id}″-${z.n}` })),
              { value: 'custom', label: t('acme.custom') },
            ]}
          />
          <InputField
            label={t('acme.starts')}
            value={s.starts}
            onChange={(e) => setS((p) => ({ ...p, starts: e.target.value }))}
            inputMode="numeric"
          />
        </div>
        {isCustom && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('acme.customD').replace('[in]', `[${L.unit}]`)}
              value={s.customD}
              onChange={(e) => setS((p) => ({ ...p, customD: e.target.value }))}
              inputMode="decimal"
            />
            <InputField
              label={t('acme.customN')}
              value={s.customN}
              onChange={(e) => setS((p) => ({ ...p, customN: e.target.value }))}
              inputMode="decimal"
            />
          </div>
        )}

        <ClassPicker
          title={t('acme.class')}
          options={ACME_CLASSES}
          value={s.cls}
          onChange={(v) => setS((p) => ({ ...p, cls: v as AcmeClass }))}
        />

        {res && (
          <>
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {res.D.toFixed(3)}-{res.n}-ACME-{s.cls}
              </span>
              <p className="text-zinc-500 text-xs mt-2">
                {t('acme.basicInfo', { p: L.fmt(res.P), lead: L.fmt(res.lead), angle: res.leadAngle.toFixed(2) })}
              </p>
              {!res.inRange && (
                <p className="text-amber-500/80 text-xs mt-2">{t('acme.outOfRange')}</p>
              )}
              {res.starts > 1 && (
                <p className="text-amber-500/80 text-xs mt-1">{t('acme.multiStart')}</p>
              )}
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔩 {t('acme.bolt')}
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔧 {t('acme.nut')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <LimitCard label={t('acme.major')} lim={res.bolt.major} tolLabel={t('acme.tolerance')} />
                  <LimitCard label={t('acme.pitch')} lim={res.bolt.pitch} tolLabel={t('acme.tolerance')} />
                  <LimitCard label={t('acme.minor')} lim={res.bolt.minor} tolLabel={t('acme.tolerance')} />
                  <CamCard label={t('acme.depthBolt')} inches={res.depth} note={`${t('acme.depthNote')} · ${t('acme.depthFrom')}`} />
                  <ValueCard
                    label={t('acme.rootFlat')}
                    inches={res.bolt.rootFlat}
                    note={t('acme.rootFlatNote')}
                    digits={4}
                  />
                  <ValueCard label={t('acme.crestFlat')} inches={res.bolt.crestFlat} digits={4} />
                  <p className="text-xs text-zinc-500 text-center">
                    {t('acme.allowance', { a: L.fmt(res.pitchAllowance) })}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <LimitCard label={t('acme.majorNut')} lim={res.nut.major} tolLabel={t('acme.tolerance')} />
                  <LimitCard label={t('acme.pitchNut')} lim={res.nut.pitch} tolLabel={t('acme.tolerance')} />
                  <LimitCard label={t('acme.minorNut')} lim={res.nut.minor} tolLabel={t('acme.tolerance')} />
                  <CamCard label={t('acme.depthNut')} inches={res.depth} note={`${t('acme.depthNote')} · ${t('acme.depthFromNut')}`} />
                  <DrillCard
                    label={t('acme.drill')}
                    min={res.nut.minor.min}
                    max={res.nut.minor.max}
                    note={t('acme.drillNote')}
                    digits={4}
                  />
                  <ValueCard
                    label={t('acme.rootFlatNut')}
                    inches={res.nut.rootFlat}
                    note={t('acme.rootFlatNutNote')}
                    digits={4}
                  />
                </div>
              </TabsContent>
              <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('acme.footer')}</p>
            </Tabs>
          </>
        )}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

function ClassPicker({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`py-3 rounded-xl font-bold text-sm transition-all border ${
              value === o
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function LimitCard({
  label,
  lim,
  tolLabel,
  fallback,
  fallbackNote,
  digits = 4,
}: {
  label: string;
  lim: Range | null;
  tolLabel: string;
  fallback?: number;
  fallbackNote?: string;
  digits?: number;
}) {
  const L = useLength('in');
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4">
      <p className="text-emerald-300 text-sm font-medium mb-2">{label}</p>
      {lim ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {(['max', 'min'] as const).map((k) => (
              <div key={k}>
                <p className="text-zinc-500 text-xs uppercase tracking-wider">{k}</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-400">
                  <CopyableValue value={L.raw(lim[k], digits)}>{L.val(lim[k], digits)}</CopyableValue>
                  <span className="text-xs text-zinc-500 font-normal ml-1">{L.unit}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="text-emerald-700 text-xs mt-2">
            {tolLabel} {L.fmt(lim.tol, digits)}
          </p>
        </>
      ) : (
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">min</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-400">
            {fallback !== undefined ? L.val(fallback, digits) : '—'}
            <span className="text-xs text-zinc-500 font-normal ml-1">{L.unit}</span>
          </p>
          {fallbackNote && <p className="text-amber-500/80 text-xs mt-2">{fallbackNote}</p>}
        </div>
      )}
    </div>
  );
}

function ValueCard({
  label,
  inches,
  note,
  prefix,
  digits = 4,
}: {
  label: string;
  inches: number;
  note?: string;
  prefix?: string;
  digits?: number;
}) {
  const L = useLength('in');
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-zinc-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-zinc-100">
        {prefix ? `${prefix} ` : ''}
        <CopyableValue value={L.raw(inches, digits)}>{L.val(inches, digits)}</CopyableValue>
        <span className="text-sm text-zinc-500 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className="text-zinc-600 text-xs mt-1">{note}</p>}
    </div>
  );
}

function CamCard({ label, inches, note }: { label: string; inches: number; note?: string }) {
  const L = useLength('in');
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={L.raw(inches)}>{L.val(inches)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">{L.unit}</span>
      </p>
      {note && <p className="text-cyan-600 text-xs mt-1.5">({note})</p>}
    </div>
  );
}

function DrillCard({
  label,
  min,
  max,
  note,
  digits = 3,
}: {
  label: string;
  min: number;
  max: number | null;
  note: string;
  digits?: number;
}) {
  const L = useLength('in');
  const mid = max !== null ? (min + max) / 2 : min;
  // najbliższe wiertło metryczne co 0,1 mm mieszczące się w tolerancji D1
  let metric: number | null = null;
  if (max !== null) {
    for (let d = Math.ceil(min * MM * 10) / 10; d <= max * MM + 1e-9; d += 0.1) {
      if (metric === null || Math.abs(d - mid * MM) < Math.abs(metric - mid * MM)) {
        metric = Math.round(d * 10) / 10;
      }
    }
  }
  return (
    <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4">
      <p className="text-cyan-300 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-cyan-400">
        <CopyableValue value={L.raw(mid, digits, 2)}>{L.val(mid, digits, 2)}</CopyableValue>
        <span className="text-base text-cyan-600 font-normal ml-1">{L.unit}</span>
      </p>
      {!L.isImperial && metric !== null && (
        <p className="text-cyan-500 text-sm">Ø{metric.toFixed(1)} mm</p>
      )}
      <p className="text-cyan-600 text-xs mt-1.5">({note})</p>
    </div>
  );
}

export default AcmeThreadPage;
