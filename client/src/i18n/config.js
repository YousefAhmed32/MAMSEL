import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

const resources = {
  ar: {
    translation: arTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'ar', // Default language
    lng: localStorage.getItem('i18nextLng') || 'ar', // Get saved language or default to Arabic
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator'],
      // Cache user language preference
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

// Force LTR direction for Admin Panel (always LTR regardless of language)
if (typeof document !== 'undefined') {
  document.documentElement.dir = 'ltr';
  document.documentElement.setAttribute('data-admin-panel', 'true');
}

export default i18n;
