import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone } from 'lucide-react';
import { useIsLandscapePhone, lockPortraitOrientation } from '@/hooks/use-mobile';
import useHaptics from '@/hooks/useHaptics';

const DISMISS_KEY = 'cnc_dismiss_rotate_hint';

/**
 * Pokazuje subtelny monit z prośbą o obrócenie telefonu do pionu,
 * gdy użytkownik fizycznego smartfona przekręci ekran do poziomu.
 *
 * Zapobiega przypadkowemu przejściu w nieporęczny widok landscape
 * podczas pracy przy maszynie CNC.
 */
export const RotateDeviceOverlay = () => {
  const { t } = useTranslation('app');
  const { triggerLight } = useHaptics();
  const isLandscape = useIsLandscapePhone();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Przy każdej próbie obrotu ponawiamy próbę zablokowania orientacji
  useEffect(() => {
    lockPortraitOrientation();
  }, [isLandscape]);

  if (!isLandscape || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    triggerLight();
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={t('orientation.rotateTitle', { defaultValue: 'Obróć telefon do pionu' })}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md px-6 text-center animate-in fade-in duration-200 select-none"
    >
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Animowana ikona telefonu obracająca się z poziomu do pionu */}
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
          <Smartphone className="h-8 w-8 text-cyan-400 animate-phone-rotate" />
        </div>

        <h2 className="text-base font-bold text-zinc-100 mb-1.5 tracking-wide">
          {t('orientation.rotateTitle', { defaultValue: 'Obróć telefon do pionu' })}
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4 max-w-xs">
          {t('orientation.rotateDesc', {
            defaultValue:
              'Aplikacja CNC HUB jest zoptymalizowana do wygodnej obsługi jedną ręką w orientacji pionowej.',
          })}
        </p>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors py-1.5 px-3 rounded-lg"
        >
          {t('orientation.continueLandscape', { defaultValue: 'Użyj w poziomie mimo to' })}
        </button>
      </div>
    </div>
  );
};

export default RotateDeviceOverlay;
