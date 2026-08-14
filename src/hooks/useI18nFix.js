import { useTranslation } from 'react-i18next';

export const useI18nFix = () => {
    const { t } = useTranslation();
    return { t };
};
