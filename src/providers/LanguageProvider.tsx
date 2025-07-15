import React from 'react';

import { language } from 'helpers/language';
import { LanguageEnum } from 'helpers/types';

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
		return (savedLanguage as LanguageEnum) || defaultLanguage as any;
	});

	const handleLanguageChange = (newLanguage: LanguageEnum) => {
		console.log(newLanguage)
		setCurrent(newLanguage);
		localStorage.setItem('appLanguage', newLanguage);
	};

	return (
		<LanguageContext.Provider
			value={{
				current,
				setCurrent: handleLanguageChange,
				object: language,
			}}
		>
			{props.children}
		</LanguageContext.Provider>
	);
}
