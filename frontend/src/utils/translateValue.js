export function translateValue(value, t) {

    if (!value) return "";

    return t(value);

}