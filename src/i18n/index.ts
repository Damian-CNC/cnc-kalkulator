import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pl from '@/locales/pl/translation.json';
import en from '@/locales/en/translation.json';
import de from '@/locales/de/translation.json';
import it from '@/locales/it/translation.json';

export const supportedLanguages = [
  { code: 'pl', label: 'PL', flag: '🇵🇱', name: 'Polski' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'it', label: 'IT', flag: '🇮🇹', name: 'Italiano' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
      de: { translation: de },
      it: { translation: it },
    },
    lng: undefined,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

// Domyślny język aplikacji to polski (gdy brak zapisanego wyboru / brak dopasowania)
if (!localStorage.getItem('i18nextLng')) {
  i18n.changeLanguage('pl');
}

export default i18n;
