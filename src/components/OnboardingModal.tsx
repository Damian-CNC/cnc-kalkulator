import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles } from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import { useUnits, type UnitSystem } from '@/contexts/UnitContext';

export const ONBOARDING_KEY = 'cnc_onboarding_completed';

const OnboardingModal = () => {
  const { t, i18n } = useTranslation('app');
  const { system, setSystem } = useUnits();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<string>(
    supportedLanguages.find((l) => i18n.resolvedLanguage?.startsWith(l.code))?.code ?? 'pl',
  );
  const [units, setUnits] = useState<UnitSystem>(system);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done || done === 'false') setOpen(true);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const pickLanguage = (code: string) => {
    setLang(code);
    void i18n.changeLanguage(code);
  };

  const finish = () => {
    void i18n.changeLanguage(lang);
    setSystem(units);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  const unitCard = (value: UnitSystem, title: string, desc: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setUnits(value)}
      className={`flex-1 rounded-2xl border p-4 text-left transition-all active:scale-95 ${
        units === value
          ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
          : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-zinc-100">{title}</span>
        {units === value && <Check className="w-4 h-4 text-cyan-400" />}
      </div>
      <span className="text-xs text-zinc-500 tracking-wide">{desc}</span>
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-black tracking-wide text-zinc-100">{t('onboarding.title')}</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-6">{t('onboarding.subtitle')}</p>

        <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
          {t('onboarding.step')} 1 — {t('onboarding.stepLanguage')}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {supportedLanguages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pickLanguage(l.code)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-3 transition-all active:scale-95 ${
                lang === l.code
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                  : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="text-xl" aria-hidden>
                {l.flag}
              </span>
              <span className="text-sm font-semibold">{l.name}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
          {t('onboarding.step')} 2 — {t('onboarding.stepUnits')}
        </p>
        <div className="flex gap-2 mb-7">
          {unitCard('metric', t('onboarding.metric'), t('onboarding.metricDesc'))}
          {unitCard('imperial', t('onboarding.imperial'), t('onboarding.imperialDesc'))}
        </div>

        <button
          type="button"
          onClick={finish}
          className="w-full rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold tracking-wide py-3.5 transition-all hover:bg-cyan-500/25 active:scale-95"
        >
          {t('onboarding.cta')}
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
