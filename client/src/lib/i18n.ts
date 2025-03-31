import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "@/translations/en";
import esTranslation from "@/translations/es";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
