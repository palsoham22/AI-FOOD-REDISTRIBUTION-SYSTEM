import { useEffect, useRef } from "react";
import { useTranslationContext } from "../context/TranslationContext";
import i18n from "../i18n";

export function usePageTranslation(labels) {
    const {
        language,
        setTranslations
    } = useTranslationContext();

    const prevKeyRef = useRef("");
    const currentKey = Array.isArray(labels) ? labels.join("|") : "";

    useEffect(() => {
        if (currentKey && currentKey !== prevKeyRef.current) {
            prevKeyRef.current = currentKey;
            if (labels && Array.isArray(labels)) {
                const bundle = i18n.getResourceBundle(language, "translation") || {};
                const result = {};
                labels.forEach((text) => {
                    result[text] = bundle[text] || text;
                });
                if (typeof setTranslations === "function") {
                    setTranslations((prev) => {
                        const prevKeys = Object.keys(prev);
                        const newKeys = Object.keys(result);
                        if (
                            prevKeys.length === newKeys.length &&
                            newKeys.every((k) => prev[k] === result[k])
                        ) {
                            return prev;
                        }
                        return result;
                    });
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, currentKey]);
}
