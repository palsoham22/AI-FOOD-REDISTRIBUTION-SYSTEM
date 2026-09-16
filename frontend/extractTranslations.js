const fs = require("fs");

const file = fs.readFileSync(
    "./src/translations/index.js",
    "utf8"
);

const matches = [...file.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)];

const translations = {};

for (const match of matches) {
    const text = match[1];

    if (text.trim() !== "") {
        translations[text] = text;
    }
}

fs.writeFileSync(
    "./src/i18n/locales/en/translation.json",
    JSON.stringify(translations, null, 2),
    "utf8"
);

console.log(
    `Created English translation file with ${Object.keys(translations).length} keys.`
);