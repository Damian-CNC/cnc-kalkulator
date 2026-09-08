import { useEffect, useState } from 'react';
import InitialPreferencesModal, { readPreferencesConfigured } from '@/components/InitialPreferencesModal';
import DisclaimerGateModal, { readAccepted } from '@/components/DisclaimerGateModal';

const isPrivacyRoute = () =>
  typeof window !== 'undefined' &&
  (window.location.hash.replace(/^#/, '').startsWith('/privacy') ||
    window.location.pathname.startsWith('/privacy'));

/** Sequential first-visit flow: preferences -> legal disclaimer. Never blocks /privacy. */
const OnboardingController = () => {
  const [step, setStep] = useState<'prefs' | 'legal' | 'done'>(() =>
    !readPreferencesConfigured() ? 'prefs' : !readAccepted() ? 'legal' : 'done',
  );
  const [onPrivacy, setOnPrivacy] = useState(isPrivacyRoute);

  useEffect(() => {
    const sync = () => setOnPrivacy(isPrivacyRoute());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  const blocking = !onPrivacy && step !== 'done';

  useEffect(() => {
    if (!blocking) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [blocking]);

  if (onPrivacy || step === 'done') return null;

  if (step === 'prefs') {
    return (
      <InitialPreferencesModal
        onDone={() => setStep(readAccepted() ? 'done' : 'legal')}
      />
    );
  }

  return <DisclaimerGateModal onAccepted={() => setStep('done')} />;
};

export default OnboardingController;
