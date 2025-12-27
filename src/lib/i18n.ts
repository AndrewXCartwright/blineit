import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import zh from '@/locales/zh.json';
import ar from '@/locales/ar.json';
import pl from '@/locales/pl.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
  zh: { translation: zh },
  ar: { translation: ar },
  pl: { translation: pl },
};

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' as const },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' as const },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' as const },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' as const },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', direction: 'ltr' as const },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'zh', 'ar', 'pl'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
  });

// Update document direction based on language
i18n.on('languageChanged', (lng) => {
  const language = supportedLanguages.find(l => l.code === lng);
  const direction = language?.direction || 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = lng;
});

export default i18n;
