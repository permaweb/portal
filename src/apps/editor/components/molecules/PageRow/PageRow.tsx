import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ICONS, URLS } from 'helpers/config';
import { PortalPatchMapEnum } from 'helpers/types';
import { displayUrlName, resolvePrimaryDomain, urlify } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

interface PageRowProps {
	pageKey: string;
	isStatic?: boolean;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	children?: React.ReactNode;
	isTemplatePage?: boolean;
}

export default function PageRow(props: PageRowProps) {
	const navigate = useNavigate();

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();

	const [showPageDropdown, setShowPageDropdown] = React.useState<boolean>(false);
	const [showRemoveConfirmation, setShowRemoveConfirmation] = React.useState<boolean>(false);
	const [removeLoading, setRemoveLoading] = React.useState<boolean>(false);

	const pages = portalProvider.current?.pages || {};
	const page = pages[props.pageKey];

	const redirectBase = page?.type === 'static' ? URLS.pageEditInfo : URLS.pageEditMain;
	const redirectId = page?.type === 'static' ? page.id : props.pageKey;
	const previewUrl = `${resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id)}/#/${urlify(
		props.pageKey
	)}`;

	function handleDropdownAction(e: any, fn: () => void) {
		e.preventDefault();
		e.stopPropagation();
		fn();
		setShowPageDropdown(false);
	}

	async function handleRemovePage() {
		if (!arProvider.wallet || !portalProvider.current?.id) return;

		setRemoveLoading(true);
		try {
			const currentPages = { ...portalProvider.current.pages };
			currentPages[props.pageKey] = 'Removed';

			await permawebProvider.libs.updateZone(
				{ Pages: permawebProvider.libs.mapToProcessCase(currentPages) },
				portalProvider.current.id,
				arProvider.wallet
			);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
			addNotification(`${language?.pageRemoved || 'Page removed'}!`, 'success');
			setShowRemoveConfirmation(false);
		} catch (e: any) {
			addNotification(e.message ?? 'Error removing page', 'warning');
		}
		setRemoveLoading(false);
	}

	return (
		<>
			<S.PageWrapper className={'border-wrapper-alt2'}>
				<S.Page collapsed={props.isCollapsed} static={props.isStatic} onClick={props.onToggleCollapse}>
					<S.PageHeader>
						{!props.isStatic && (
							<S.Arrow $open={!props.isCollapsed}>
								<ReactSVG src={ICONS.arrow} />
							</S.Arrow>
						)}
						<p>{displayUrlName(props.pageKey)}</p>
					</S.PageHeader>
					<S.PageDetail onClick={(e) => e.stopPropagation()}>
						<S.PageActions>
							<S.PageMenuWrapper>
								<CloseHandler
									active={showPageDropdown}
									disabled={!showPageDropdown}
									callback={() => setShowPageDropdown(false)}
								>
									<S.PageMenuAction>
										<IconButton
											type={'alt1'}
											src={ICONS.menu}
											handlePress={() => setShowPageDropdown((prev) => !prev)}
											dimensions={{ wrapper: 25, icon: 13.5 }}
											disabled={false}
											active={showPageDropdown}
											tooltip={language?.showPageActions}
											tooltipPosition={'bottom-right'}
										/>
									</S.PageMenuAction>
									{showPageDropdown && (
										<S.PageMenuDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper-hidden'}>
											<button
												onClick={(e) =>
													handleDropdownAction(e, () =>
														navigate(`${redirectBase(portalProvider.current.id)}/${redirectId}`)
													)
												}
											>
												<ReactSVG src={ICONS.write} />
												<p>{language?.edit}</p>
											</button>
											{!props.isStatic && (
												<button onClick={(e) => handleDropdownAction(e, () => window.open(previewUrl, '_blank'))}>
													<ReactSVG src={ICONS.show} />
													<p>{language?.view}</p>
												</button>
											)}

											{!props.isTemplatePage && (
												<S.PageMenuWarning
													onClick={(e) =>
														handleDropdownAction(e, () => {
															setShowRemoveConfirmation(true);
														})
													}
												>
													<ReactSVG src={ICONS.warning} />
													<p>{language?.remove}</p>
												</S.PageMenuWarning>
											)}
										</S.PageMenuDropdown>
									)}
								</CloseHandler>
							</S.PageMenuWrapper>
						</S.PageActions>
					</S.PageDetail>
				</S.Page>
				{props.children}
			</S.PageWrapper>
			{showRemoveConfirmation && (
				<Modal
					header={language?.confirm}
					handleClose={() => setShowRemoveConfirmation(false)}
					closeDisabled={removeLoading}
				>
					<S.RemoveModalWrapper>
						<S.RemoveModalBodyWrapper>
							<p>{language?.removePageConfirmationInfo || 'Are you sure you want to remove this page?'}</p>
						</S.RemoveModalBodyWrapper>
						<S.RemoveModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowRemoveConfirmation(false)}
								disabled={removeLoading}
							/>
							<Button
								type={'primary'}
								label={language?.remove}
								handlePress={() => handleRemovePage()}
								disabled={removeLoading}
								loading={removeLoading}
								warning
							/>
						</S.RemoveModalActionsWrapper>
					</S.RemoveModalWrapper>
				</Modal>
			)}
		</>
	);
}
