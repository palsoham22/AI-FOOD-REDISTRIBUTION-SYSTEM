import { useTranslation } from "react-i18next";

export function useTranslate() {
    const { t } = useTranslation();

    return t;
}