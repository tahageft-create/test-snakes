import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { translations, type TranslationKey } from '../lib/translations';
import api from '../lib/api';
type Lang = 'en' | 'ar';
interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}
const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('snakes_lang');
    return (saved === 'ar' ? 'ar' : 'en') as Lang;
  });
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('snakes_lang', newLang);
    if (isAuthenticated) {
      api
        .put('/auth/profile', {
          language: newLang,
        })
        .catch(() => {});
      updateProfile({
        language: newLang,
      });
    }
  }; // Sync from user profile on auth change
  useEffect(() => {
    if (user?.language && (user.language === 'en' || user.language === 'ar')) {
      setLangState(user.language as Lang);
      localStorage.setItem('snakes_lang', user.language);
    }
  }, [user?.id]);

  const t = (key: TranslationKey): string => {
    return (
      (translations[lang] as Record<string, string>)[key] ||
      (translations.en as Record<string, string>)[key] ||
      key
    );
  };
  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        isRTL: lang === 'ar',
      }}
    >
      {' '}
      {children}{' '}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
