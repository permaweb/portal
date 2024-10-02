import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, URLS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const paths: { path: string; label: string; target?: '_blank' }[] = [{ path: URLS.docs, label: language.docs }];

	const [panelOpen, setPanelOpen] = React.useState<boolean>(false);

	const navigationToggle = React.useMemo(() => {
		return (
			<IconButton
				type={'primary'}
				src={ASSETS.navigation}
				handlePress={props.toggle}
				dimensions={{
					wrapper: 36.5,
					icon: 23.5,
				}}
				tooltip={props.open ? language.sidebarClose : language.sidebarOpen}
				tooltipPosition={'right'}
			/>
		);
	}, [props.open]);

	return (
		<>
			<S.Panel open={props.open}>
				<S.PanelHeader>{navigationToggle}</S.PanelHeader>
				<S.PanelContent open={props.open}>
					{paths.map((element: { path: string; label: string; target?: '_blank' }, index: number) => {
						return (
							<Link key={index} to={element.path} target={element.target || ''} onClick={() => setPanelOpen(false)}>
								{element.label}
							</Link>
						);
					})}
				</S.PanelContent>
			</S.Panel>

			<S.Header navigationOpen={props.open}>
				<S.Content>
					<S.C1Wrapper>
						{!props.open && navigationToggle}
						{/* <S.LogoWrapper>
							<Link to={URLS.base}>
								<ReactSVG src={ASSETS.logo} />
							</Link>
							</S.LogoWrapper> */}
					</S.C1Wrapper>
					<S.ActionsWrapper>
						<WalletConnect />
						<S.MWrapper>
							<IconButton
								type={'alt1'}
								src={ASSETS.menu}
								handlePress={() => setPanelOpen(true)}
								dimensions={{ wrapper: 35, icon: 20 }}
							/>
						</S.MWrapper>
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
			{/* {panelOpen && (
				<div className={'overlay'}>
					<S.PWrapper className={'border-wrapper-primary'}>
						<CloseHandler active={panelOpen} disabled={!panelOpen} callback={() => setPanelOpen(false)}>
							<S.PMenu>
								<S.PHeader>
									<h4>{language.goTo}</h4>
									<IconButton
										type={'primary'}
										src={ASSETS.close}
										handlePress={() => setPanelOpen(false)}
										dimensions={{
											wrapper: 35,
											icon: 20,
										}}
									/>
								</S.PHeader>
								<S.MNavWrapper>
									{paths.map((element: { path: string; label: string; target?: '_blank' }, index: number) => {
										return (
											<Link
												key={index}
												to={element.path}
												target={element.target || ''}
												onClick={() => setPanelOpen(false)}
											>
												{element.label}
											</Link>
										);
									})}
								</S.MNavWrapper>
							</S.PMenu>
						</CloseHandler>
					</S.PWrapper>
				</div>
			)} */}
		</>
	);
}
