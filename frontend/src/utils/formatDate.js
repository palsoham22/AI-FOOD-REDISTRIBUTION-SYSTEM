export function formatLocalizedDate(date, language) {

    if (!date) return "";

    return new Date(date).toLocaleDateString(language, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

}