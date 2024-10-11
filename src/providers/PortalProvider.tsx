import React from 'react';
import { useLocation } from 'react-router-dom';

import { Panel } from 'components/molecules/Panel';
import { PortalManager } from 'components/organisms/PortalManager';
import { PortalType } from 'helpers/types';

import { useArweaveProvider } from './ArweaveProvider';
import { useLanguageProvider } from './LanguageProvider';

interface PortalContextState {
	portals: PortalType[] | null;
	current: PortalType | null;
	showPortalManager: boolean;
	setShowPortalManager: (toggle: boolean) => void;
}

const DEFAULT_CONTEXT = {
	portals: null,
	current: null,
	showPortalManager: false,
	setShowPortalManager(_toggle: boolean) {},
};

const PortalContext = React.createContext<PortalContextState>(DEFAULT_CONTEXT);

export function usePortalProvider(): PortalContextState {
	return React.useContext(PortalContext);
}

export function PortalProvider(props: { children: React.ReactNode }) {
	const location = useLocation();

	const arProvider = useArweaveProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [portals, setPortals] = React.useState<PortalType[] | null>(null);
	const [current, setCurrent] = React.useState<PortalType | null>(null);

	const [showPortalManager, setShowPortalManager] = React.useState<boolean>(false);

	React.useEffect(() => {
		setPortals([
			{
				id: 'IR2hzJyfSGp7lgqqgnoeza2caaus96e56uTVP1gV7GE',
				name: 'My first portal',
				logo: '4txDbfbymP1RNMQCsFzyZOZR9qeUZXt_IacmL4IXYD8',
			},
		]);
	}, []);

	React.useEffect(() => {
		if (portals && portals.length) setCurrent(portals[0]);
	}, [portals]);

	// TODO
	// React.useEffect(() => {
	// 	if (arProvider.profile && arProvider.profile.portals) {
	// 		setPortals(arProvider.profile.portals);
	// 	}
	// }, [arProvider.profile]);

	// React.useEffect(() => {
	// 	if (portals) {
	// 		const currentPortal = portals.find((portal) => location.pathname.startsWith(`/${portal.id}`));
	// 		setCurrent(currentPortal || null);
	// 	} else setCurrent(null);
	// }, [location.pathname, portals]);

	return (
		<PortalContext.Provider value={{ portals, current, showPortalManager, setShowPortalManager }}>
			{props.children}
			<Panel
				open={showPortalManager}
				header={current && current.id ? language.editPortal : language.createPortal}
				handleClose={() => setShowPortalManager(false)}
				width={500}
			>
				<PortalManager portal={current} handleClose={() => setShowPortalManager(false)} handleUpdate={null} />
			</Panel>
		</PortalContext.Provider>
	);
}
