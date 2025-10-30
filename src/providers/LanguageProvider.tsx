import React from 'react';

import { loadLanguage, loadLanguageAsync, LanguageEnum, LanguageTranslations } from 'helpers/language';

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

	const [currentTranslations, setCurrentTranslations] = React.useState<LanguageTranslations>(() => {
		return loadLanguage(current as string);
	});

	React.useEffect(() => {
		loadLanguageAsync(current as string).then((loadedTranslations) => {
			setCurrentTranslations(loadedTranslations);
		});
	}, [current]);

	const handleLanguageChange = (newLanguage: LanguageEnum) => {
		setCurrent(newLanguage);
		localStorage.setItem('appLanguage', newLanguage);
	}, []);

	const languageObject = React.useMemo(() => {
		return {
			[current]: currentTranslations,
		};
	}, [currentTranslations, current]);

	return (
		<LanguageContext.Provider
			value={{
				current,
				setCurrent: handleLanguageChange,
				object: languageObject,
			}}
		>
			{props.children}
		</LanguageContext.Provider>
	);

	return <LanguageContext.Provider value={contextValue}>{props.children}</LanguageContext.Provider>;
}
