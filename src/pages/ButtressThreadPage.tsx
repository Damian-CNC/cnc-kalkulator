import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import SelectField from '@/components/SelectField';
import InputField from '@/components/InputField';
import ClearFab from '@/components/ClearFab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import usePersistedState from '@/hooks/usePersistedState';
import useQueryState from '@/hooks/useQueryState';
import useLength from '@/hooks/useLength';
import { parseDecimal } from '@/lib/numericInput';
import { BUTTRESS_SIZES, calcButtress } from '@/lib/buttressThread';
import {
  DiameterCard,
  PitchCard,
  DepthCard,
  DrillCard,
  AuxCard,
} from '@/components/ThreadResultCards';

type State = { size: string; customD: string; customP: string };
const INITIAL: State = { size: '40x7', customD: '', customP: '' };

const ButtressThreadPage = () => {
  const { t } = useTranslation('tools');
  const Lx = useLength('mm');
  const [s, setS, reset] = usePersistedState<State>('buttress-thread', INITIAL);
  const [tab, setTab] = useQueryState('tab', 'external', ['external', 'internal'] as const, 'buttress-tab');

  const custom = s.size === 'custom';
  const std = BUTTRESS_SIZES.find((z) => `${z.d}x${z.P}` === s.size);
  const toMm = (v: number | null) => (v === null ? null : Lx.isImperial ? v * 25.4 : v);
  const d = custom ? toMm(parseDecimal(s.customD)) : std?.d ?? null;
  const P = custom ? toMm(parseDecimal(s.customP)) : std?.P ?? null;
  const res = useMemo(() => (d !== null && P !== null ? calcButtress(d, P) : null), [d, P]);

  return (
    <PageLayout title={t('buttress.title')} backRoute="/gwinty">
      <div className="space-y-5">
        <SelectField
          label={t('buttress.size')}
          value={s.size}
          onChange={(e) => setS((p) => ({ ...p, size: e.target.value }))}
          options={[
            ...BUTTRESS_SIZES.map((z) => ({ value: `${z.d}x${z.P}`, label: `S ${z.d} × ${z.P}` })),
            { value: 'custom', label: t('buttress.custom') },
          ]}
        />
        {custom && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('buttress.customD').replace('[mm]', `[${Lx.unit}]`)}
              value={s.customD}
              onChange={(e) => setS((p) => ({ ...p, customD: e.target.value }))}
              inputMode="decimal"
            />
            <InputField
              label={t('buttress.customP').replace('[mm]', `[${Lx.unit}]`)}
              value={s.customP}
              onChange={(e) => setS((p) => ({ ...p, customP: e.target.value }))}
              inputMode="decimal"
            />
          </div>
        )}

        {res && (
          <>
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-lg tracking-wide border border-emerald-500/30">
                {res.designation}
              </span>
              <p className="text-zinc-500 text-xs mt-2">{t('buttress.basicInfo')}</p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'external' | 'internal')} className="w-full">
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔩 {t('buttress.bolt')}
                </TabsTrigger>
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50"
                >
                  🔧 {t('buttress.nut')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="external">
                <div className="space-y-3 mt-3">
                  <DiameterCard
                    label={t('buttress.major')}
                    limits={{ max: res.d, min: res.d }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label={t('buttress.pitch')}
                    limits={{ max: res.d2, min: res.d2 }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label={t('buttress.minor')}
                    limits={{ max: res.d3, min: res.d3 }}
                    unit="mm"
                    digits={3}
                  />
                  {P !== null && (
                    <PitchCard
                      label="Skok gwintu (P)"
                      pitch={P}
                      unit="mm"
                      digits={3}
                    />
                  )}
                  <DepthCard
                    label={t('buttress.depthBolt')}
                    depth={res.h3}
                    unit="mm"
                    digits={3}
                    note={`${t('buttress.depthNote')} · ${t('buttress.depthFrom')}`}
                  />
                  <AuxCard
                    label={t('buttress.radius')}
                    value={res.R}
                    unit="mm"
                    digits={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="internal">
                <div className="space-y-3 mt-3">
                  <DiameterCard
                    label={t('buttress.majorNut')}
                    limits={{ max: res.d, min: res.d }}
                    unit="mm"
                    digits={3}
                    note={t('buttress.majorNutNote')}
                  />
                  <DiameterCard
                    label={t('buttress.pitchNut')}
                    limits={{ max: res.d2, min: res.d2 }}
                    unit="mm"
                    digits={3}
                  />
                  <DiameterCard
                    label={t('buttress.minorNut')}
                    limits={{ max: res.D1, min: res.D1 }}
                    unit="mm"
                    digits={3}
                    note={t('buttress.drillNote')}
                  />
                  {P !== null && (
                    <PitchCard
                      label="Skok gwintu (P)"
                      pitch={P}
                      unit="mm"
                      digits={3}
                    />
                  )}
                  <DepthCard
                    label={t('buttress.depthNut')}
                    depth={res.H1}
                    unit="mm"
                    digits={3}
                    note={`${t('buttress.depthNote')} · ${t('buttress.depthFromNut')}`}
                  />
                  <DrillCard
                    label="Średnica wiercenia pod nakrętkę"
                    diameter={res.D1}
                    unit="mm"
                    note="Równa średnicy wewnętrznej D1"
                    digits={3}
                  />
                </div>
              </TabsContent>
              <p className="text-zinc-600 text-xs text-center mt-4 leading-relaxed">{t('buttress.footer')}</p>
            </Tabs>
          </>
        )}
      </div>
      <ClearFab onClear={reset} />
    </PageLayout>
  );
};

export default ButtressThreadPage;
