import React from 'react';

import { language } from 'helpers/language';

// Agrega más idiomas según sea necesario
type LanguageType = 'en' | 'es' | 'fr' | 'pt';

interface LanguageContextState {
  [x: string]: any;
  current: LanguageType;
  setCurrent: (current: LanguageType) => void;
  object: any;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LanguageContext = React.createContext<LanguageContextState>({
  current: 'en',
  setCurrent(current: LanguageType) {
    console.log('Language changed to:', current);
  },
  object: null,
});

export function useLanguageProvider(): LanguageContextState {
  return React.useContext(LanguageContext);
}

export function LanguageProvider(props: LanguageProviderProps) {
  const [current, setCurrent] = React.useState<LanguageType>(() => {
    // Intenta obtener el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('appLanguage');
    return (savedLanguage as LanguageType) || 'en'; // Fallback a inglés
  });

  // Persiste el cambio de idioma en localStorage
  const handleLanguageChange = (newLanguage: LanguageType) => {
    setCurrent(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        current,
        setCurrent: handleLanguageChange,
        object: language
      }}
    >
      {props.children}
    </LanguageContext.Provider>
  );
}