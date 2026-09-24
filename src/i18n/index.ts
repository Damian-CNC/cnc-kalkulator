import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const supportedLanguages = [
  { code: 'pl', label: 'PL', flag: '🇵🇱', name: 'Polski' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'it', label: 'IT', flag: '🇮🇹', name: 'Italiano' },
] as const;

type LanguageCode = (typeof supportedLanguages)[number]['code'];

const DEFAULT_LANGUAGE: LanguageCode = 'pl';
const FALLBACK_LANGUAGE: LanguageCode = 'en';

// Pliki tłumaczeń: src/locales/{lng}/{namespace}.json
// Ładowane leniwie, per język (vite.config.ts skleja je w jeden plik na język),
// więc w paczce startowej nie ma tłumaczeń wszystkich 4 języków.
const loaders = import.meta.glob<Record<string, unknown>>('../locales/*/*.json', {
  import: 'default',
});

const toSupported = (lng?: string | null): LanguageCode | null => {
  const base = lng?.toLowerCase().split(/[-_]/)[0];
  return supportedLanguages.find((l) => l.code === base)?.code ?? null;
};

const pending = new Map<string, Promise<void>>();

const loadLanguage = (lng: string): Promise<void> => {
  const existing = pending.get(lng);
  if (existing) return existing;

  const task = Promise.all(
    Object.entries(loaders)
      .filter(([path]) => path.includes(`/locales/${lng}/`))
      .map(async ([path, load]) => {
        const ns = path.match(/\/([^/]+)\.json$/)?.[1];
        if (!ns) return;
        const content = await load();
        i18n.addResourceBundle(lng, ns, content, true, true);
      }),
  ).then(() => undefined);

  // Po błędzie (np. brak sieci) pozwól spróbować ponownie
  task.catch(() => pending.delete(lng));
  pending.set(lng, task);
  return task;
};

const readStoredLanguage = (): string | null => {
  try {
    return localStorage.getItem('i18nextLng');
  } catch {
    return null;
  }
};

// Domyślny język aplikacji to polski (gdy brak zapisanego wyboru)
const stored = readStoredLanguage();
const initialLanguage: LanguageCode = stored
  ? (toSupported(stored) ?? FALLBACK_LANGUAGE)
  : DEFAULT_LANGUAGE;

const initPromise = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    lng: initialLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: 'translation',
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

// Zmiana języka najpierw dociąga jego tłumaczenia, potem przełącza język
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng, callback) => {
  const supported = toSupported(lng);
  if (supported) await loadLanguage(supported);
  return originalChangeLanguage(lng, callback);
};

/** Aplikacja renderuje się dopiero po załadowaniu aktywnego języka i języka zapasowego. */
export const i18nReady: Promise<unknown> = Promise.all([
  initPromise,
  loadLanguage(initialLanguage),
  loadLanguage(FALLBACK_LANGUAGE),
]);

export default i18n;
