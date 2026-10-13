import { useEffect, useState, useCallback, useRef } from 'react';
import { readPreferencesConfigured } from '@/components/InitialPreferencesModal';
import { readAccepted } from '@/components/DisclaimerGateModal';

export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/cnchub';
export const SUPPORT_LAST_SHOWN_KEY = 'cnc_support_prompt_last';
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const FIVE_SECONDS_MS = 5000;

export const useSupportPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledRef = useRef(false);

  const shouldPrompt = useCallback((): boolean => {
    try {
      const lastShownStr = localStorage.getItem(SUPPORT_LAST_SHOWN_KEY);
      if (!lastShownStr) return true;
      const lastShown = parseInt(lastShownStr, 10);
      if (Number.isNaN(lastShown)) return true;
      return Date.now() - lastShown >= THIRTY_DAYS_MS;
    } catch {
      return false;
    }
  }, []);

  const markShown = useCallback(() => {
    try {
      localStorage.setItem(SUPPORT_LAST_SHOWN_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
  }, []);

  const schedulePrompt = useCallback(() => {
    if (scheduledRef.current) return;
    if (!shouldPrompt()) return;

    scheduledRef.current = true;
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
      markShown();
    }, FIVE_SECONDS_MS);
  }, [shouldPrompt, markShown]);

  useEffect(() => {
    // Sprawdź czy użytkownik przeszedł onboarding (język, jednostki, regulamin)
    const checkAndSchedule = () => {
      const onboarded = readPreferencesConfigured() && readAccepted();
      if (onboarded) {
        schedulePrompt();
        return true;
      }
      return false;
    };

    if (checkAndSchedule()) return;

    // Jeśli użytkownik jest właśnie w trakcie onboardingu, sprawdzaj co sekundę aż zakończy
    const interval = setInterval(() => {
      if (checkAndSchedule()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [schedulePrompt]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    markShown();
  }, [markShown]);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleSupportClick = useCallback(() => {
    markShown();
    window.open(BUY_ME_A_COFFEE_URL, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  }, [markShown]);

  return {
    isOpen,
    openModal,
    closeModal,
    handleSupportClick,
    coffeeUrl: BUY_ME_A_COFFEE_URL,
  };
};
