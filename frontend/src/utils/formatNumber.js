export function formatLocalizedNumber(number, language) {

    if (number === null || number === undefined) {
        return "";
    }

    return Number(number).toLocaleString(language);

}