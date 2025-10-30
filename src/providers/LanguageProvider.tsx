import React from 'react';

import { loadLanguage, loadLanguageAsync, LanguageEnum, LanguageTranslations } from 'helpers/language';

interface LanguageContextState {
	current: LanguageEnum;
	setCurrent: (current: LanguageEnum) => void;
	object: any;
}

interface LanguageProviderProps {
	children: React.ReactNode;
}

const LanguageContext = React.createContext<LanguageContextState>({
	current: LanguageEnum.en,
	setCurrent(current: LanguageEnum) {
		console.log('Language changed to:', current);
	},
	object: null,
});

export function useLanguageProvider(): LanguageContextState {
	return React.useContext(LanguageContext);
}

export function LanguageProvider(props: LanguageProviderProps) {
	const defaultLanguage = Object.keys(LanguageEnum)[0];

	const [current, setCurrent] = React.useState<LanguageEnum>(() => {
		const savedLanguage = localStorage.getItem('appLanguage');
		return (savedLanguage as LanguageEnum) || (defaultLanguage as any);
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
	};

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
}
