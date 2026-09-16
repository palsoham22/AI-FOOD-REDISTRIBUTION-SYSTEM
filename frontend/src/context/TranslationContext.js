import { createContext, useContext, useState, useMemo, useEffect } from "react";
import i18n from "../i18n";

const TranslationContext = createContext();

export function TranslationProvider({ children }) {

    const [language, setLanguageState] = useState(
        i18n.language || "en-IN"
    );

    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(false);

    const setLanguage = (newLanguage) => {
        setLanguageState(newLanguage);
        i18n.changeLanguage(newLanguage);
    };

    useEffect(() => {

        const handleLanguageChange = (lng) => {
            setLanguageState(lng);
        };

        i18n.on("languageChanged", handleLanguageChange);

        return () => {
            i18n.off("languageChanged", handleLanguageChange);
        };

    }, []);

    const value = useMemo(() => ({

        language,
        setLanguage,

        translations,
        setTranslations,

        loading,
        setLoading,

    }), [language, translations, loading]);

    console.log("Translation Context Updated");
    console.log("Language:", language);
    console.log("Translations:", translations);

    return (

        <TranslationContext.Provider value={value}>

            {children}

        </TranslationContext.Provider>

    );

}

export function useTranslationContext() {

    return useContext(TranslationContext);

}