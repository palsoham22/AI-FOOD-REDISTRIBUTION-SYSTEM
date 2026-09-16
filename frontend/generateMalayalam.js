const fs = require("fs");
const axios = require("axios");

async function generateMalayalam() {

    const english = JSON.parse(
        fs.readFileSync(
            "./src/i18n/locales/en/translation.json",
            "utf8"
        )
    );

    const texts = Object.keys(english);
    const translations = {};

    const BATCH_SIZE = 20;

    console.log(`Total texts: ${texts.length}`);
    console.log("Starting Malayalam translation...\n");

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {

        const batch = texts.slice(i, i + BATCH_SIZE);

        console.log(
            `Translating ${i + 1}-${Math.min(
                i + BATCH_SIZE,
                texts.length
            )} of ${texts.length}...`
        );

        try {

            const response = await axios.post(
                "http://127.0.0.1:8000/api/translate/",
                {
                    texts: batch,
                    target: "ml-IN"
                }
            );

            Object.assign(
                translations,
                response.data.translations
            );

        } catch (error) {

            console.error(
                "Translation failed:",
                error.response?.data || error.message
            );

            process.exit(1);
        }
    }

    fs.writeFileSync(
        "./src/i18n/locales/ml/translation.json",
        JSON.stringify(translations, null, 2),
        "utf8"
    );

    console.log("\n✅ Malayalam translation file created successfully!");
    console.log(
        `Translated keys: ${Object.keys(translations).length}`
    );
}

generateMalayalam();