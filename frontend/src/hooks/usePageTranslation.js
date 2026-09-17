import { useEffect } from "react";
import { useTranslationContext } from "../context/TranslationContext";
import i18n from "../i18n";

export function usePageTranslation(labels) {
    const {
        language,
        setTranslations,
        setLoading
    } = useTranslationContext();

    useEffect(() => {
        // Purely local translation resolution via i18next; no remote API dependencies
        if (labels && Array.isArray(labels)) {
            const bundle = i18n.getResourceBundle(language, "translation") || {};
            const result = {};
            labels.forEach((text) => {
                result[text] = bundle[text] || text;
            });
            setTranslations(result);
        }
        setLoading(false);
    }, [language, labels, setTranslations, setLoading]);
}
