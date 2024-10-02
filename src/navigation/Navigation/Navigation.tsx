import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, STYLING, URLS } from 'helpers/config';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

// TODO: Cache panel open
export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const paths: { path: string; label: string; icon: string; target?: '_blank' }[] = [
		{ path: URLS.base, icon: ASSETS.portals, label: language.portals }
	];

	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [panelOpen, setPanelOpen] = React.useState<boolean>(false);

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.desktop))) {
			setDesktop(true);
		} else {
			setDesktop(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), []);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

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
				tooltipPosition={props.open ? 'right' : 'bottom-left'}
			/>
		);
	}, [props.open]);

	const panel = React.useMemo(() => {
		const content = (
			<>
				<S.PanelHeader>{navigationToggle}</S.PanelHeader>
				<S.PanelContent open={props.open}>
					{paths.map((element: { path: string; label: string; icon: string; target?: '_blank' }, index: number) => {
						return (
							<Link key={index} to={element.path} target={element.target || ''} onClick={() => setPanelOpen(false)}>
								<ReactSVG src={element.icon} />
								{element.label}
							</Link>
						);
					})}
				</S.PanelContent>
			</>
		);

		if (desktop) {
			return <S.Panel open={props.open} className={'fade-in'}>{content}</S.Panel>;
		} else {
			return (
				<>
					<S.Panel open={props.open} className={'fade-in'}>
						<CloseHandler active={props.open} disabled={!props.open} callback={() => props.toggle()}>
							{content}
						</CloseHandler>
					</S.Panel>
					<S.PanelOverlay open={props.open} />
				</>
			);
		}
	}, [props.open, desktop]);

	return (
		<>
			{panel}
			<S.Header navigationOpen={props.open} className={'fade-in'}>
				<S.Content>
					<S.C1Wrapper>
						{!props.open && navigationToggle}
						<S.LogoWrapper>
							<Link to={URLS.base}>
								<ReactSVG src={ASSETS.logo} />
							</Link>
							</S.LogoWrapper>
					</S.C1Wrapper>
					<S.ActionsWrapper>
						<WalletConnect />
						<S.MWrapper>
							<IconButton
								type={'primary'}
								src={ASSETS.menu}
								handlePress={() => setPanelOpen(true)}
								dimensions={{ wrapper: 36.5, icon: 23.5 }}
							/>
						</S.MWrapper>
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
			{panelOpen && (
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
			)}
		</>
	);
}
