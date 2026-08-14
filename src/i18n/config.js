import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationPT from './pt-BR.json';

const resources = {
  'pt-BR': {
    translation: translationPT
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
