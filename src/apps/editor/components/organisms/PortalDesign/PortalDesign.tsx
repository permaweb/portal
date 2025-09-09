import React from 'react';

import { Fonts } from 'editor/components/molecules/Fonts';
import { Media } from 'editor/components/molecules/Media';
import { Themes } from 'editor/components/molecules/Themes';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { ASSETS } from 'helpers/config';
import { DesignPanelType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PortalDesign() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState<boolean>(false);
	const [panelType, setPanelType] = React.useState<DesignPanelType | null>(null);

	function handleOpenAction(type: DesignPanelType) {
		setPanelType(type);
		setShowPanel(true);
	}

	const panel = React.useMemo(() => {
		let header: string | null;
		let component: React.ReactNode | null;

		switch (panelType) {
			case 'themes':
				header = language?.themes;
				component = <Themes />;
				break;
			case 'fonts':
				header = language?.fonts;
				component = <Fonts />;
				break;
			case 'logo':
				header = language?.siteLogo;
				component = <Media portal={portalProvider.current} type={'logo'} />;
				break;
			default:
				header = null;
				component = null;
				break;
		}

		return (
			<Panel
				open={showPanel}
				header={header}
				handleClose={() => setShowPanel(false)}
				width={500}
				closeHandlerDisabled={true}
			>
				<S.PanelBodyWrapper>
					{component}
					<S.PanelActionsWrapper>
						<Button
							type={'primary'}
							label={language?.close}
							handlePress={() => setShowPanel(false)}
							height={45}
							fullWidth
						/>
					</S.PanelActionsWrapper>
				</S.PanelBodyWrapper>
			</Panel>
		);
	}, [portalProvider.current, panelType, showPanel, language]);

	function getAction(label: string, action: DesignPanelType) {
		return (
			<S.ActionWrapper>
				<Button
					type={'primary'}
					label={label}
					handlePress={() => handleOpenAction(action)}
					disabled={!portalProvider?.permissions?.updatePortalMeta}
					icon={ASSETS.arrow}
					height={40}
					fullWidth
				/>
			</S.ActionWrapper>
		);
	}

	return (
		<>
			<S.Wrapper>
				{getAction(language?.themes, 'themes')}
				{getAction(language?.fonts, 'fonts')}
				{getAction(language?.siteLogo, 'logo')}
			</S.Wrapper>
			{panel}
		</>
	);
}
