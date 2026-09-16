import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import ta from "./locales/ta/translation.json";
import te from "./locales/te/translation.json";
import ml from "./locales/ml/translation.json";
import bn from "./locales/bn/translation.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
    "en-IN": {
        translation: en
    },
    "hi-IN": {
        translation: hi
    },
    "ta-IN": {
        translation: ta
    },
    "te-IN": {
        translation: te
    },
    "ml-IN": {
        translation: ml
    },
    "bn-IN": {
        translation: bn
    }
},

        fallbackLng: "en-IN",

        supportedLngs: [
    "en-IN",
    "hi-IN",
    "ta-IN",
    "te-IN",
    "ml-IN",
    "bn-IN"
],

        interpolation: {
            escapeValue: false
        },

        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"]
        }
    });

export default i18n;

window.i18next = i18n;