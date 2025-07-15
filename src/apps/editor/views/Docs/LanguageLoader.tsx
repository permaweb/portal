import React from 'react';

import { Loader } from 'components/atoms/Loader';
import { useLanguageProvider } from 'providers/LanguageProvider';

export function LanguageLoader({ children }: { children: React.ReactNode }) {
  const languageProvider = useLanguageProvider();

  if (!languageProvider || !languageProvider.object) {
    return <Loader />;
  }

  return <>{children}</>;
}