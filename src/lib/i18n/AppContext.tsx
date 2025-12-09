'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage (only on client)
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang) {
        setLanguage(savedLang);
      }
    }
  }, []);

  // Save language preference
  useEffect(() => {
    if (!mounted) return;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language, mounted]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
