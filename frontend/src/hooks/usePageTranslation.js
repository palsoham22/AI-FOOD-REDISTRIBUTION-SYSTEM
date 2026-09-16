import { useEffect } from "react";
import { useTranslationContext } from "../context/TranslationContext";
import { translatePage } from "../services/translationService";

export function usePageTranslation(labels) {

    const {

        language,
        translations,
        setTranslations,
        setLoading

    } = useTranslationContext();

    useEffect(() => {

        let cancelled = false;

        async function loadTranslations() {

            if (language === "en-IN") {

                return;

            }

            setLoading(true);

            try {

                const result = await translatePage(labels, language);

                console.log("RESULT FROM DJANGO:", result);

                if (cancelled) return;

                if (
                    JSON.stringify(result) !==
                    JSON.stringify(translations)
                ) {

                    console.log("SETTING TRANSLATIONS");

                    setTranslations(result);

                }

            }

            catch (error) {

                console.log(error);

            }

            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }

        loadTranslations();

        return () => {

            cancelled = true;

        };

    }, [language]);

}