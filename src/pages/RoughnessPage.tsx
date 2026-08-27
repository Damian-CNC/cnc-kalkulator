import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import ClearFab from '@/components/ClearFab';

const RADII = [0.1, 0.2, 0.4, 0.8, 1.2, 1.6, 2.4];

const isoClasses = [
  { n: 'N1', ra: 0.025 },
  { n: 'N2', ra: 0.05 },
  { n: 'N3', ra: 0.1 },
  { n: 'N4', ra: 0.2 },
  { n: 'N5', ra: 0.4 },
  { n: 'N6', ra: 0.8 },
  { n: 'N7', ra: 1.6 },
  { n: 'N8', ra: 3.2 },
  { n: 'N9', ra: 6.3 },
  { n: 'N10', ra: 12.5 },
  { n: 'N11', ra: 25 },
  { n: 'N12', ra: 50 },
];

const raColor = (ra: number) => {
  if (ra <= 1.6) return 'text-emerald-400';
  if (ra <= 3.2) return 'text-yellow-400';
  return 'text-orange-400';
};

const isoClassFor = (ra: number) => isoClasses.find((c) => ra <= c.ra)?.n ?? '> N12';

const RoughnessPage = () => {
  const { t } = useTranslation(['roughness', 'translation']);
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward');
  const [radius, setRadius] = useState('0.4');
  const [feed, setFeed] = useState('');
  const [targetRa, setTargetRa] = useState('');

  const raLabel = (ra: number) => {
    if (ra <= 1.6) return t('finishing');
    if (ra <= 3.2) return t('standard');
    return t('rough');
  };

  const r = parseFloat(radius.replace(',', '.'));
  const f = parseFloat(feed.replace(',', '.'));
  const raT = parseFloat(targetRa.replace(',', '.'));

  const result = useMemo(() => {
    if (!r || r <= 0) return null;
    if (mode === 'forward') {
      if (!f || f <= 0) return null;
      return {
        ra: ((f * f) / (32 * r)) * 1000,
        rz: ((f * f) / (8 * r)) * 1000,
        fmax: null as number | null,
      };
    }
    if (!raT || raT <= 0) return null;
    const fmax = Math.sqrt((32 * r * raT) / 1000);
    return { ra: raT, rz: ((fmax * fmax) / (8 * r)) * 1000, fmax };
  }, [mode, r, f, raT]);

  const invalid =
    (mode === 'forward' && feed !== '' && (!f || f <= 0)) ||
    (mode === 'reverse' && targetRa !== '' && (!raT || raT <= 0)) ||
    (radius !== '' && (!r || r <= 0));

  const clear = () => {
    setFeed('');
    setTargetRa('');
    setRadius('0.4');
  };

  return (
    <PageLayout title={t('pages.roughness', { ns: 'translation' })}>
      <div className="glass-module">
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['forward', 'reverse'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                mode === m
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m === 'forward' ? t('modeForward') : t('modeReverse')}
            </button>
          ))}
        </div>

        <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
          {t('cornerRadius')}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {RADII.map((v) => (
            <button
              key={v}
              onClick={() => setRadius(String(v))}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                parseFloat(radius) === v
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {v.toFixed(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="input-field mb-6"
        />

        {mode === 'forward' ? (
          <>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
              {t('feed')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={feed}
              onChange={(e) => setFeed(e.target.value)}
              className="input-field"
            />
          </>
        ) : (
          <>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
              {t('targetRa')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={targetRa}
              onChange={(e) => setTargetRa(e.target.value)}
              className="input-field"
            />
          </>
        )}

        {invalid && (
          <p className="mt-3 text-sm text-red-400">{t('positiveValuesRequired')}</p>
        )}
      </div>

      {result && (
        <div className="glass-module">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Ra</div>
              <div className={`text-3xl font-bold ${raColor(result.ra)}`}>
                {result.ra.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">µm · {isoClassFor(result.ra)}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Rz ≈ Rt</div>
              <div className={`text-3xl font-bold ${raColor(result.ra)}`}>
                {result.rz.toFixed(2)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">µm</div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-zinc-400">
            {t('surfaceClass')} <span className={raColor(result.ra)}>{raLabel(result.ra)}</span>
          </div>

          {result.fmax !== null && (
            <div className="result-box mt-4 text-2xl">
              f max = {result.fmax.toFixed(3)} mm/{t('perRev')}
            </div>
          )}
        </div>
      )}

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">{t('isoClasses')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {isoClasses.map((c) => (
            <div
              key={c.n}
              className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-2 py-2 text-center"
            >
              <div className="text-cyan-400 font-bold text-sm">{c.n}</div>
              <div className="text-xs text-zinc-500">Ra {c.ra} µm</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-4">
          {t('theoreticalFormulas')}
        </p>
      </div>

      <div className="h-20" />
      <ClearFab onClear={clear} />
    </PageLayout>
  );
};

export default RoughnessPage;
