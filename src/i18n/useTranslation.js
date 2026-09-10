import { useSelector } from 'react-redux';
import { translations } from './translations';

export const useTranslation = () => {
  const lang = useSelector((s) => s.ui?.language || 'en');
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  return { t, lang };
};
