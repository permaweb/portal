import React from 'react';

import { Button } from 'components/atoms/Button';
import { Panel } from 'components/atoms/Panel';
import { Logo } from 'components/molecules/Logo';
import { Themes } from 'components/molecules/Themes';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

type PanelType = 'themes' | 'logo';

// TODO
export default function PortalDesign() {
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showPanel, setShowPanel] = React.useState<boolean>(false);
	const [panelType, setPanelType] = React.useState<PanelType | null>(null);

	function handleOpenAction(type: PanelType) {
		setPanelType(type);
		setShowPanel(true);
	}

	const panel = React.useMemo(() => {
		let header: string | null;
		let component: React.ReactNode | null;
		let useAction: boolean = false;

		switch (panelType) {
			case 'themes':
				header = language.themes;
				component = <Themes hideHeader />;
				useAction = true;
				break;
			case 'logo':
				header = language.siteLogo;
				component = (
					<Logo portal={portalProvider.current} handleClose={() => setShowPanel(false)} handleUpdate={null} />
				);
				break;
			default:
				header = 'Design panel';
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
					{useAction && (
						<S.PanelActionsWrapper>
							<Button type={'primary'} label={language.close} handlePress={() => setShowPanel(false)} />
						</S.PanelActionsWrapper>
					)}
				</S.PanelBodyWrapper>
			</Panel>
		);
	}, [portalProvider.current, panelType, showPanel, language]);

	return (
		<>
			<S.Wrapper>
				<S.ActionWrapper>
					<Button
						type={'primary'}
						label={language.themes}
						handlePress={() => handleOpenAction('themes')}
						icon={ASSETS.arrow}
						height={40}
						fullWidth
					/>
				</S.ActionWrapper>
				{/* <S.ActionWrapper>
					<Button type={'primary'} label={'Fonts'} handlePress={() => {}} icon={ASSETS.arrow} height={40} fullWidth />
				</S.ActionWrapper> */}
				<S.ActionWrapper>
					<Button
						type={'primary'}
						label={language.siteLogo}
						handlePress={() => handleOpenAction('logo')}
						icon={ASSETS.arrow}
						height={40}
						fullWidth
					/>
				</S.ActionWrapper>
			</S.Wrapper>
			{panel}
		</>
	);
}
