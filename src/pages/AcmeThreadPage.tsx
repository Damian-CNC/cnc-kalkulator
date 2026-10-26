import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useLength from '@/hooks/useLength';
import useQueryState from '@/hooks/useQueryState';
import { parseDecimal } from '@/lib/numericInput';
import {
  ACME_CLASSES,
  ACME_SIZES,
  calcAcme,
  type AcmeClass,
  type AcmeForm,
  type Lim,
} from '@/lib/acmeThread';
import {
  DiameterCard,
  PitchCard,
  DepthCard,
  DrillCard,
  AuxCard,
} from '@/components/ThreadResultCards';

type Range = Lim;

type State = {
  size: string; // id z serii albo 'custom'
  form: AcmeForm;
  cls: AcmeClass;
  starts: string;
  customD: string;
  customN: string;
};
const INITIAL: State = { size: '1/2', form: 'acme', cls: '2G', starts: '1', customD: '', customN: '' };


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
  const form: AcmeForm = s.form === 'stub' ? 'stub' : 'acme';
  const stub = form === 'stub';
  const starts = Math.min(6, Math.max(1, Math.round(parseDecimal(s.starts) ?? 1)));

  const res = useMemo(
    () => (D !== null && n !== null ? calcAcme(D, n, stub ? '2G' : s.cls, starts, form) : null),
    [D, n, s.cls, starts, form, stub],
  );

  // Compute nearest metric drill for nut tab (DrillCard)
  let metricDrill: number | null = null;
  if (res && res.nut.minor.max !== null) {
    const mid = (res.nut.minor.min + (res.nut.minor.max ?? res.nut.minor.min)) / 2;
    for (
      let d = Math.ceil(res.nut.minor.min * 25.4 * 10) / 10;
      d <= res.nut.minor.max * 25.4 + 1e-9;
      d += 0.1
    ) {
      if (metricDrill === null || Math.abs(d - mid * 25.4) < Math.abs(metricDrill - mid * 25.4)) {
        metricDrill = Math.round(d * 10) / 10;
      }
    }
  }

  return (
    <PageLayout title={t(stub ? 'acme.titleStub' : 'acme.title')} backRoute="/gwinty" wideDesktop>
      <div className="space-y-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
          <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
            {/* Lewa kolumna: wybór i kontrolki (sticky na PC) */}
            <div className="space-y-4 lg:sticky lg:top-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-2">
                {(['acme', 'stub'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setS((p) => ({ ...p, form: f }))}
                    className={`py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all border ${
                      form === f
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {t(f === 'acme' ? 'acme.formAcme' : 'acme.formStub')}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-2 gap-2">
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

              {res && (
                <>
                  <div className="text-center pt-1 border-t border-zinc-800/60">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm md:text-base tracking-wide border border-emerald-500/30">
                      {res.designation}
                    </span>
                    <p className="text-zinc-500 text-xs mt-1">
                      {t('acme.basicInfo', { p: L.fmt(res.P), lead: L.fmt(res.lead), angle: res.leadAngle.toFixed(2) })}
                    </p>
                    {!res.inRange && (
                      <p className="text-amber-500/80 text-xs mt-1">{t('acme.outOfRange')}</p>
                    )}
                    {res.starts > 1 && (
                      <p className="text-amber-500/80 text-xs mt-0.5">{t('acme.multiStart')}</p>
                    )}
                  </div>

                  <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                    <TabsTrigger
                      value="external"
                      className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm"
                    >
                      🔩 {t('acme.bolt')}
                    </TabsTrigger>
                    <TabsTrigger
                      value="internal"
                      className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 text-xs md:text-sm"
                    >
                      🔧 {t('acme.nut')}
                    </TabsTrigger>
                  </TabsList>

                  <div className="pt-2 border-t border-zinc-800/60">
                    <ClassPicker
                      title={t('acme.class')}
                      options={stub ? (['2G'] as const) : ACME_CLASSES}
                      value={stub ? '2G' : s.cls}
                      onChange={(v) => setS((p) => ({ ...p, cls: v as AcmeClass }))}
                    />
                  </div>

                  <p className="text-zinc-500 text-[11px] text-center pt-2 border-t border-zinc-800/60 leading-relaxed">
                    {res.form === 'stub' ? t('acme.footerStub') : t('acme.footer')}
                  </p>
                </>
              )}
            </div>

            {/* Prawa kolumna: karty wyników */}
            <div className="min-w-0">
              {res && (
                <>
                  <TabsContent value="external" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {res.form === 'stub' ? (
                        <DiameterCard
                          label={t('acme.major')}
                          limits={{ max: res.D, min: res.D }}
                          unit="in"
                          digits={4}
                          note={t('acme.stubMajorNote')}
                        />
                      ) : (
                        <DiameterCard
                          label={t('acme.major')}
                          limits={res.bolt.major}
                          unit="in"
                          digits={4}
                          tolClass={s.cls}
                        />
                      )}
                      <DiameterCard
                        label={t('acme.pitch')}
                        limits={res.bolt.pitch}
                        unit="in"
                        digits={4}
                        tolClass={s.cls}
                      />
                      <DiameterCard
                        label={t('acme.minor')}
                        limits={res.bolt.minor}
                        unit="in"
                        digits={4}
                        tolClass={s.cls}
                      />
                      <PitchCard
                        label="Skok / Posuw"
                        pitch={res.P}
                        lead={res.lead}
                        unit="in"
                        note={`Kat wzniosu: ${res.leadAngle.toFixed(2)}deg`}
                        digits={4}
                      />
                      <DepthCard
                        label={t('acme.depthBolt')}
                        depth={res.depth}
                        unit="in"
                        note={`${t('acme.depthNote')} · ${t('acme.depthFrom')}`}
                        digits={4}
                      />
                      <AuxCard
                        label={t('acme.rootFlat')}
                        value={res.bolt.rootFlat}
                        unit="in"
                        note={t('acme.rootFlatNote')}
                        digits={4}
                      />
                      <AuxCard
                        label={t('acme.crestFlat')}
                        value={res.bolt.crestFlat}
                        unit="in"
                        digits={4}
                      />
                      <div className="md:col-span-2">
                        <p className="text-xs text-zinc-500 text-center py-1">
                          {t('acme.allowance', { a: L.fmt(res.pitchAllowance) })}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="internal" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {res.form !== 'stub' && (
                        <DiameterCard
                          label={t('acme.majorNut')}
                          limits={res.nut.major}
                          unit="in"
                          digits={4}
                          tolClass={s.cls}
                        />
                      )}
                      <DiameterCard
                        label={t('acme.pitchNut')}
                        limits={res.nut.pitch}
                        unit="in"
                        digits={4}
                        tolClass={s.cls}
                      />
                      <DiameterCard
                        label={t('acme.minorNut')}
                        limits={res.nut.minor}
                        unit="in"
                        digits={4}
                        tolClass={s.cls}
                      />
                      <PitchCard
                        label="Skok / Posuw"
                        pitch={res.P}
                        lead={res.lead}
                        unit="in"
                        note={`Kat wzniosu: ${res.leadAngle.toFixed(2)}deg`}
                        digits={4}
                      />
                      <DepthCard
                        label={t('acme.depthNut')}
                        depth={res.depth}
                        unit="in"
                        note={`${t('acme.depthNote')} · ${t('acme.depthFromNut')}`}
                        digits={4}
                      />
                      <DrillCard
                        label={t('acme.drill')}
                        diameter={(res.nut.minor.min + res.nut.minor.max) / 2}
                        unit="in"
                        note={t('acme.drillNote')}
                        metricDrill={metricDrill}
                        digits={4}
                      />
                      <div className="md:col-span-2">
                        <AuxCard
                          label={t('acme.rootFlatNut')}
                          value={res.nut.rootFlat}
                          note={t('acme.rootFlatNutNote')}
                          unit="in"
                          digits={4}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </div>
          </div>
        </Tabs>
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

export default AcmeThreadPage;
