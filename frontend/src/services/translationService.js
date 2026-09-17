import i18n from "../i18n";

export async function translatePage(texts, language) {
    if (!texts || !Array.isArray(texts)) {
        return {};
    }

    if (language === "en-IN") {
        const result = {};
        texts.forEach((text) => {
            result[text] = text;
        });
        return result;
    }

    // Resolve synchronously from the local i18next resource bundle
    const bundle = i18n.getResourceBundle(language, "translation") || {};
    const result = {};
    texts.forEach((text) => {
        result[text] = bundle[text] || text;
    });
    return result;
}
