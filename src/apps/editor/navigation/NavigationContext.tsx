import React from 'react';

import { useSettingsProvider } from 'editor/providers/SettingsProvider';

interface NavigationContextType {
	navWidth: number;
	setNavWidth: (width: number) => void;
}

const NavigationContext = React.createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { settings, updateSettings } = useSettingsProvider();

	const setNavWidth = React.useCallback(
		(width: number) => {
			updateSettings('navWidth', width);
		},
		[updateSettings]
	);

	const value = React.useMemo(
		() => ({
			navWidth: settings.navWidth,
			setNavWidth,
		}),
		[settings.navWidth, setNavWidth]
	);

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = () => {
	const context = React.useContext(NavigationContext);
	if (!context) {
		throw new Error('useNavigation must be used within a NavigationProvider');
	}
	return context;
};
