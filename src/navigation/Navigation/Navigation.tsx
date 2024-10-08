import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { ASSETS, STYLING, URLS } from 'helpers/config';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

// TODO: Cache panel open
export default function Navigation(props: { open: boolean; toggle: () => void }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const paths = React.useMemo(() => {
		if (portalProvider.current) {
			return [
				{
					path: `${URLS.base}${portalProvider.current.id}`,
					icon: ASSETS.portals,
					label: language.home,
				},
				{ path: URLS.portalDesign(portalProvider.current.id), icon: ASSETS.design, label: language.design },
				{ path: URLS.portalPosts(portalProvider.current.id), icon: ASSETS.posts, label: language.posts },
				{ path: URLS.portalDomains(portalProvider.current.id), icon: ASSETS.domains, label: language.domains },
				{ path: URLS.portalUsers(portalProvider.current.id), icon: ASSETS.users, label: language.users },
			];
		}
		return null;
	}, [portalProvider.current]);

	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [showPortalDropdown, setShowPortalDropdown] = React.useState<boolean>(false);

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
				{portalProvider.current ? (
					<>
						<S.PanelContent open={props.open} className={'fade-in scroll-wrapper'}>
							{paths.map((element: { path: string; label: string; icon: string; target?: '_blank' }, index: number) => {
								return (
									<Link key={index} to={element.path} target={element.target || ''}>
										<ReactSVG src={element.icon} />
										{element.label}
									</Link>
								);
							})}
						</S.PanelContent>
						<S.PanelFooter open={props.open} className={'fade-in'}>
							<Link to={URLS.docs}>
								<ReactSVG src={ASSETS.help} />
								{'Help center'}
							</Link>
						</S.PanelFooter>
					</>
				) : (
					<Loader sm relative />
				)}
			</>
		);

		if (desktop) {
			return (
				<S.Panel open={props.open} className={'fade-in'}>
					{content}
				</S.Panel>
			);
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
	}, [props.open, desktop, portalProvider.current]);

	const portal = React.useMemo(() => {
		if (portalProvider.current) {
			return (
				<S.PortalWrapper className={'fade-in'}>
					<CloseHandler
						active={showPortalDropdown}
						disabled={!showPortalDropdown}
						callback={() => setShowPortalDropdown(false)}
					>
						<S.Portal
							onClick={() => setShowPortalDropdown(!showPortalDropdown)}
							active={showPortalDropdown}
							disabled={!portalProvider.current}
						>
							<span>{portalProvider.current ? portalProvider.current.name : '-'}</span>
							<ReactSVG src={ASSETS.arrow} />
						</S.Portal>
						{showPortalDropdown && (
							<S.PortalDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
								<S.PDropdownHeader>
									<p>{language.portals}</p>
								</S.PDropdownHeader>
								{portalProvider.portals && portalProvider.portals.length > 0 && (
									<S.PDropdownBody>
										{portalProvider.portals.map((portal: any) => {
											const active = portalProvider.current ? portalProvider.current.id === portal.id : false;
											return (
												<S.PDropdownLink key={portal.id} active={active} onClick={() => setShowPortalDropdown(false)}>
													<Link to={`${URLS.base}${portal.id}`}>
														<span>{portal.name}</span>
														{active && <ReactSVG src={ASSETS.checkmark} />}
													</Link>
												</S.PDropdownLink>
											);
										})}
									</S.PDropdownBody>
								)}
								<S.PDropdownFooter>
									<button
										onClick={() => {
											navigate(`${URLS.base}${portalProvider.current.id}`);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ASSETS.portals} />
										{language.portalReturn}
									</button>
									<button
										onClick={() => {
											portalProvider.setShowPortalManager(true);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ASSETS.add} />
										{language.portalCreate}
									</button>
									<button onClick={() => navigate(URLS.base)}>
										<ReactSVG src={ASSETS.disconnect} />
										{language.portalsReturn}
									</button>
								</S.PDropdownFooter>
							</S.PortalDropdown>
						)}
					</CloseHandler>
				</S.PortalWrapper>
			);
		}
		return null;
	}, [showPortalDropdown, portalProvider.portals, portalProvider.current]);

	return (
		<>
			{panel}
			<S.Header navigationOpen={props.open} className={'fade-in'}>
				<S.Content>
					<S.C1Wrapper>
						{!props.open && navigationToggle}
						{portal}
					</S.C1Wrapper>
					<S.ActionsWrapper>
						<WalletConnect />
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
		</>
	);
}
