import React from 'react';

import { loadLanguage, LanguageTranslations } from 'helpers/language';

interface LanguageContextState {
	current: string;
	setCurrent: (current: string) => void;
	object: { [key: string]: LanguageTranslations };
}

const enTranslations = loadLanguage('en');

const LanguageContext = React.createContext<LanguageContextState>({
	current: 'en',
	setCurrent() {},
	object: { en: enTranslations },
});

export function useLanguageProvider(): LanguageContextState {
	return React.useContext(LanguageContext);
}

export function WidgetLanguageProvider(props: { children: React.ReactNode }) {
	const value = React.useMemo(
		() => ({
			current: 'en' as string,
			setCurrent() {},
			object: { en: enTranslations },
		}),
		[]
	);

	return <LanguageContext.Provider value={value}>{props.children}</LanguageContext.Provider>;
}
