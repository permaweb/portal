import React from 'react';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { IconButton } from 'components/atoms/IconButton';
import { ASSETS, STYLING, URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalHeaderType } from 'helpers/types';
import { checkWindowCutoff } from 'helpers/window';
import { useNavigationConfirm } from 'hooks/useNavigationConfirm';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { WalletConnect } from 'wallet/WalletConnect';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function Navigation(props: { open: boolean; toggle: () => void }) {
	/* Confirm navigation from inside the post editor */
	const { confirmNavigation } = useNavigationConfirm('post', 'Changes you made may not be saved.');

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.desktop)));
	const [showPortalDropdown, setShowPortalDropdown] = React.useState<boolean>(false);

	const paths = React.useMemo(() => {
		return [
			{
				path: portalProvider.current ? URLS.portalBase(portalProvider.current.id) : URLS.base,
				icon: ASSETS.portal,
				label: language.home,
			},
			{
				path: portalProvider.current ? URLS.portalSetup(portalProvider.current.id) : URLS.base,
				icon: ASSETS.setup,
				label: language.setup,
			},
			{
				path: portalProvider.current ? URLS.portalDesign(portalProvider.current.id) : URLS.base,
				icon: ASSETS.design,
				label: language.design,
			},
			{
				path: portalProvider.current ? URLS.portalPosts(portalProvider.current.id) : URLS.base,
				icon: ASSETS.posts,
				label: language.posts,
			},
			{
				path: portalProvider.current ? URLS.portalUsers(portalProvider.current.id) : URLS.base,
				icon: ASSETS.users,
				label: language.users,
			},
			{
				path: portalProvider.current ? URLS.portalDomains(portalProvider.current.id) : URLS.base,
				icon: ASSETS.domains,
				label: language.domains,
			},
		];
	}, [portalProvider.current?.id]);

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

	const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
		e.preventDefault();
		confirmNavigation(to);
		if (!desktop) props.toggle();
	};

	const navigationToggle = React.useMemo(() => {
		return (
			<S.ToggleWrapper>
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
			</S.ToggleWrapper>
		);
	}, [props.open, portalProvider.current?.id, desktop]);

	const panel = React.useMemo(() => {
		const content = (
			<>
				<S.PanelHeader>{navigationToggle}</S.PanelHeader>
				<>
					<S.PanelContent open={props.open} className={'fade-in scroll-wrapper'}>
						{paths.map((element: { path: string; label: string; icon: string; target?: '_blank' }, index: number) => {
							return (
								<Link
									key={index}
									to={element.path}
									target={element.target || ''}
									onClick={(e) => handleNavigate(e, element.path)}
								>
									<ReactSVG src={element.icon} />
									{element.label}
								</Link>
							);
						})}
					</S.PanelContent>
					<S.PanelFooter open={props.open} className={'fade-in'}>
						<Link to={URLS.docsIntro} onClick={(e) => handleNavigate(e, URLS.docsIntro)}>
							<ReactSVG src={ASSETS.help} />
							{language.helpCenter}
						</Link>
					</S.PanelFooter>
				</>
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
	}, [props.open, desktop, portalProvider.current?.id]);

	const portal = React.useMemo(() => {
		if (portalProvider.current?.id) {
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
										{portalProvider.portals.map((portal: PortalHeaderType) => {
											const active = portalProvider.current ? portalProvider.current.id === portal.id : false;
											const path = `${URLS.base}${portal.id}`;
											return (
												<S.PDropdownLink key={portal.id} active={active} onClick={() => setShowPortalDropdown(false)}>
													<Link to={path} onClick={(e) => handleNavigate(e, path)}>
														<span>{portal.name}</span>
														{active && (
															<S.PIndicator>
																<ReactSVG src={ASSETS.checkmark} />
															</S.PIndicator>
														)}
													</Link>
												</S.PDropdownLink>
											);
										})}
									</S.PDropdownBody>
								)}
								<S.PDropdownFooter>
									<button onClick={() =>{
										 window.open(getTxEndpoint(portalProvider.current.id));
										 setShowPortalDropdown(false);
									}}>
										<ReactSVG src={ASSETS.site} />
										{language.goToSite}
									</button>
									<button
										onClick={(e: any) => {
											handleNavigate(e, `${URLS.base}${portalProvider.current.id}`);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ASSETS.portal} />
										{language.portalReturn}
									</button>
									<button
										onClick={() => {
											portalProvider.setShowPortalManager(true);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ASSETS.write} />
										{language.editPortal}
									</button>
									<button
										onClick={() => {
											portalProvider.setShowPortalManager(true, true);
											setShowPortalDropdown(false);
										}}
									>
										<ReactSVG src={ASSETS.add} />
										{language.createPortal}
									</button>
									<button onClick={(e: any) => handleNavigate(e, URLS.base)}>
										<ReactSVG src={ASSETS.disconnect} />
										{language.portalsReturn}
									</button>
								</S.PDropdownFooter>
							</S.PortalDropdown>
						)}
					</CloseHandler>
					{portalProvider.updating && (
						<S.PortalUpdateWrapper>
							<span>{`${language.updating}...`}</span>
						</S.PortalUpdateWrapper>
					)}
				</S.PortalWrapper>
			);
		}
		return (
			<S.LoadingWrapper>
				<span>{`${language.loading}...`}</span>
			</S.LoadingWrapper>
		);
	}, [
		showPortalDropdown,
		portalProvider.portals,
		portalProvider.current?.id,
		portalProvider.current?.name,
		portalProvider.updating,
	]);

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
						<WalletConnect app={'editor'} />
					</S.ActionsWrapper>
				</S.Content>
			</S.Header>
		</>
	);
}
