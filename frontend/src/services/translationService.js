import axios from "axios";

export async function translatePage(texts, language) {

    if (language === "en-IN") {
        const result = {};

        texts.forEach(text => {
            result[text] = text;
        });

        return result;
    }

    const cacheKey = `translations_${language}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "{}");

    // Find only missing labels
    const missingTexts = [

    ...new Set(

        texts.filter(

            text =>

                text &&
                String(text).trim() !== "" &&
                !cached[text]

        )

    )

];

    if (missingTexts.length === 0) {
        console.log("Loaded all translations from cache");
        return cached;
    }

    console.log("Fetching only missing translations");

    console.log("Texts being sent:", missingTexts);

    const updatedCache = { ...cached };

const BATCH_SIZE = 2;

for (let i = 0; i < missingTexts.length; i += BATCH_SIZE) {

    const batch = missingTexts.slice(i, i + BATCH_SIZE);

    console.log("Sending batch:", batch);

    const response = await axios.post(
        "http://127.0.0.1:8000/api/translate/",
        {
            texts: batch,
            target: language
        }
    );

    Object.assign(updatedCache, response.data.translations);

}

localStorage.setItem(
    cacheKey,
    JSON.stringify(updatedCache)
);

return updatedCache;
}