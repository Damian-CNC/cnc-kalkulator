import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

export const DISCLAIMER_KEY = 'cnc_disclaimer_accepted';

export const readAccepted = (): boolean => {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === 'true';
  } catch {
    return false;
  }
};

/** Shared scrollable terms body — used by the gate and the footer legal modal. */
export const LegalTerms = () => {
  const { t } = useTranslation('app');
  return (
    <div className="max-h-56 overflow-y-auto text-xs text-zinc-400 bg-zinc-950/80 p-3 rounded-md border border-zinc-800 leading-relaxed space-y-3">
      <div>
        <h3 className="text-zinc-200 font-bold mb-1">{t('legal.liabilityTitle')}</h3>
        <p>{t('legal.liabilityBody')}</p>
      </div>
      <div>
        <h3 className="text-zinc-200 font-bold mb-1">{t('legal.privacyTitle')}</h3>
        <p>{t('legal.privacyBody')}</p>
      </div>
    </div>
  );
};

/** Non-dismissible first-visit gate. Blocks the whole app until accepted. */
const DisclaimerGateModal = () => {
  const { t } = useTranslation('app');
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!readAccepted()) setOpen(true);
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

  const accept = () => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, 'true');
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  if (locked) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
      >
        <div className="w-full max-w-md rounded-2xl border border-red-900/60 bg-zinc-950 p-6 text-center shadow-2xl">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-zinc-300 leading-relaxed mb-6">{t('legal.lockedBody')}</p>
          <button
            type="button"
            onClick={() => setLocked(false)}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm font-semibold transition-colors hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95"
          >
            {t('legal.changeDecision')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-base font-black tracking-wide text-zinc-100 leading-tight">
            {t('legal.gateTitle')}
          </h2>
        </div>

        <LegalTerms />

        <label className="mt-4 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 w-5 h-5 shrink-0 rounded-md border border-zinc-600 bg-zinc-950 flex items-center justify-center transition-colors peer-checked:bg-cyan-500 peer-checked:border-cyan-400 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500/50"
          >
            {checked && <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />}
          </span>
          <span className="text-xs text-zinc-300 leading-relaxed">{t('legal.checkboxLabel')}</span>
        </label>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={!checked}
            onClick={accept}
            className="w-full px-4 py-3 rounded-xl bg-cyan-500 text-zinc-950 text-sm font-bold tracking-wide transition-all enabled:hover:bg-cyan-400 enabled:active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('legal.accept')}
          </button>
          <button
            type="button"
            onClick={() => setLocked(true)}
            className="w-full px-4 py-2.5 rounded-xl border border-red-900/60 text-red-400 text-sm font-semibold transition-colors hover:bg-red-950/40 active:scale-95"
          >
            {t('legal.decline')}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Standard modal re-showing the terms, opened from the footer. */
export const LegalModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation('app');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black tracking-wide text-zinc-100">{t('legal.modalTitle')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('legal.close')}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <LegalTerms />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm font-semibold transition-colors hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95"
        >
          {t('legal.close')}
        </button>
      </div>
    </div>
  );
};

export default DisclaimerGateModal;
