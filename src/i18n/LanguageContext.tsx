import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TRANSLATIONS, Translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isBangla: boolean;
  formatNumberLocalized: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'physistep_language_pref';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') return saved;
      // Auto-detect browser language
      if (navigator.language && navigator.language.startsWith('bn')) {
        return 'bn';
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable
    }
  };

  const isBangla = language === 'bn';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Helper to convert standard digits to Bengali numerals if preferred
  const formatNumberLocalized = (input: number | string): string => {
    const str = input.toString();
    if (!isBangla) return str;
    const bnDigits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return str.replace(/[0-9]/g, (digit) => bnDigits[digit] || digit);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isBangla, formatNumberLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
