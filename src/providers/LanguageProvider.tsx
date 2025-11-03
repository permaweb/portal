import React from 'react';

import { loadLanguage, loadLanguageAsync, LanguageEnum, LanguageTranslations } from 'helpers/language';

type LanguageKey = keyof typeof LanguageEnum;

interface LanguageContextState {
	current: LanguageKey;
	setCurrent: (current: LanguageKey) => void;
	object: any;
}

interface LanguageProviderProps {
	children: React.ReactNode;
}

const LanguageContext = React.createContext<LanguageContextState>({
	current: 'en',
	setCurrent(current: LanguageKey) {
		console.log('Language changed to:', current);
	},
	object: null,
});

export function useLanguageProvider(): LanguageContextState {
	return React.useContext(LanguageContext);
}

export function LanguageProvider(props: LanguageProviderProps) {
	const defaultLanguage = Object.keys(LanguageEnum)[0] as LanguageKey;

	const [current, setCurrent] = React.useState<LanguageKey>(() => {
		const savedLanguage = localStorage.getItem('appLanguage');
		return (savedLanguage as LanguageKey) || defaultLanguage;
	});

	const [translations, setTranslations] = React.useState<{ [key: string]: LanguageTranslations }>(() => {
		const enTranslations = loadLanguage('en');
		return {
			en: enTranslations,
			es: enTranslations,
			de: enTranslations,
		};
	});

	const [isLoading, setIsLoading] = React.useState(current !== 'en');

	React.useEffect(() => {
		const loadTranslations = async () => {
			setIsLoading(true);
			const enTrans = await loadLanguageAsync('en');
			const esTrans = await loadLanguageAsync('es');
			const deTrans = await loadLanguageAsync('de');

			setTranslations({
				en: enTrans,
				es: esTrans,
				de: deTrans,
			});
			setIsLoading(false);
		};

		loadTranslations();
	}, []);

	const handleLanguageChange = React.useCallback((newLanguage: LanguageKey) => {
		setCurrent(newLanguage);
		localStorage.setItem('appLanguage', newLanguage);
	}, []);

	const contextValue = React.useMemo(
		() => ({
			current,
			setCurrent: handleLanguageChange,
			object: translations,
		}),
		[current, translations, handleLanguageChange]
	);

	return <LanguageContext.Provider value={contextValue}>{props.children}</LanguageContext.Provider>;
}
