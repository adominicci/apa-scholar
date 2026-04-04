import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@renderer/i18n/resources/en';
import es from '@renderer/i18n/resources/es';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
