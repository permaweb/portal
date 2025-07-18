import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Modal } from 'components/atoms/Modal';
import { ASSETS, SOCIAL_LINK_ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalLinkType, ViewLayoutType } from 'helpers/types';
import { checkValidAddress, validateUrl } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

const ALLOWED_ICON_TYPES = 'image/svg+xml';

export default function Links(props: { type: ViewLayoutType; showActions?: boolean; closeAction?: () => void }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<any>(null);

	const [linkOptions, setLinkOptions] = React.useState<PortalLinkType[] | null>(null);
	const [linkLoading, setLinkLoading] = React.useState<boolean>(false);
	const { addNotification } = useNotifications();
	const [showPrefills, setShowPrefills] = React.useState<boolean>(false);
	const [editMode, setEditMode] = React.useState<boolean>(false);
	const [selectedLinks, setSelectedLinks] = React.useState<PortalLinkType[]>([]);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [newLinkUrl, setNewLinkUrl] = React.useState<string>('');
	const [newLinkTitle, setNewLinkTitle] = React.useState<string>('');
	const [newLinkIcon, setNewLinkIcon] = React.useState<any>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.links) setLinkOptions(portalProvider.current.links);
		}
	}, [portalProvider.current]);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const linkActionDisabled =
		unauthorized || !arProvider.wallet || !portalProvider.current?.id || !newLinkUrl || !newLinkTitle || linkLoading;

	const handleSelect = (link: PortalLinkType) => {
		const isSelected = selectedLinks.some((selectedLink) => selectedLink.url === link.url);
		if (isSelected) {
			setSelectedLinks(selectedLinks.filter((selectedLink) => selectedLink.url !== link.url));
		} else {
			setSelectedLinks([...selectedLinks, link]);
		}
	};

	const deleteLinks = async () => {
		if (!unauthorized && arProvider.wallet && portalProvider.current?.links && selectedLinks?.length) {
			setLinkLoading(true);
			try {
				const updatedLinks = linkOptions.filter(
					(link) => !selectedLinks.some((selectedLink) => selectedLink.url === link.url)
				);

				const linkUpdateId = await permawebProvider.libs.updateZone(
					{ Links: permawebProvider.libs.mapToProcessCase(updatedLinks) },
					portalProvider.current.id,
					arProvider.wallet
				);

				setSelectedLinks([]);

				portalProvider.refreshCurrentPortal();

				console.log(`Link update: ${linkUpdateId}`);

				addNotification(`${language?.linksUpdated}!`, 'success');
				setShowDeleteConfirmation(false);
				setEditMode(false);
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating links', 'warning');
			}
			setLinkLoading(false);
		}
	};

	const addLink = async () => {
		if (!unauthorized && newLinkUrl && newLinkTitle && portalProvider.current?.id && arProvider.wallet) {
			setLinkLoading(true);
			try {
				let newLink: { Url: string; Title: string; Icon?: string } = { Url: newLinkUrl, Title: newLinkTitle };

				if (newLinkIcon) newLink.Icon = await permawebProvider.libs.resolveTransaction(newLinkIcon);

				const updatedLinkOptions = [...permawebProvider.libs.mapToProcessCase(linkOptions), newLink];

				const linkUpdateId = await permawebProvider.libs.updateZone(
					{ Links: updatedLinkOptions },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				console.log(`Link update: ${linkUpdateId}`);

				setLinkOptions(permawebProvider.libs.mapFromProcessCase(updatedLinkOptions));
				addNotification(`${language?.linkAdded}!`, 'success');

				setNewLinkUrl('');
				setNewLinkTitle('');
				setNewLinkIcon(null);
			} catch (e: any) {
				addNotification(e.message ?? 'Error adding link', 'warning');
			}
			setLinkLoading(false);
		}
	};

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						setNewLinkIcon(event.target.result);
					}
				};

				reader.readAsDataURL(file);
			}
			e.target.value = '';
		}
	}

	const prefills = React.useMemo(() => {
		return [
			{ title: 'X', icon: SOCIAL_LINK_ASSETS.x },
			{ title: 'Odysee', icon: SOCIAL_LINK_ASSETS.odysee },
			{ title: 'Youtube', icon: SOCIAL_LINK_ASSETS.youtube },
			{ title: 'Telegram', icon: SOCIAL_LINK_ASSETS.telegram },
			{ title: 'VK', icon: SOCIAL_LINK_ASSETS.vk },
			{ title: 'LinkedIn', icon: SOCIAL_LINK_ASSETS.linkedin },
			{ title: 'Rumble', icon: SOCIAL_LINK_ASSETS.rumble },
			{ title: 'Facebook', icon: SOCIAL_LINK_ASSETS.facebook },
			{ title: 'Daily Motion', icon: SOCIAL_LINK_ASSETS.dailyMotion },
			{ title: 'Patreon', icon: SOCIAL_LINK_ASSETS.patreon },
			{ title: 'RSS', icon: SOCIAL_LINK_ASSETS.rss },
		];
	}, [language]);

	function getIconWrapper() {
		if (newLinkIcon)
			return <ReactSVG src={checkValidAddress(newLinkIcon) ? getTxEndpoint(newLinkIcon) : newLinkIcon} />;
		return <span>{'SVG'}</span>;
	}

	const getLinks = () => {
		if (!linkOptions) {
			return (
				<S.LoadingWrapper>
					<p>{`${language?.gettingLinks}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (linkOptions.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noLinksFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{linkOptions.map((link: PortalLinkType, index: number) => {
					const isSelected = selectedLinks.some((selectedLink) => selectedLink.url === link.url);
					return (
						<S.LinkWrapper key={index} editMode={editMode} active={isSelected}>
							<button onClick={() => (editMode ? handleSelect(link) : window.open(link.url, '_blank'))}>
								<ReactSVG src={link.icon ? getTxEndpoint(link.icon) : ASSETS.link} />
								<S.LinkTooltip className={'info'}>
									<span>{link.title}</span>
								</S.LinkTooltip>
							</button>
						</S.LinkWrapper>
					);
				})}
			</>
		);
	};

	return (
		<>
			<S.Wrapper>
				<S.LinksAction>
					<S.LinksHeader>
						<p>{language?.addLink}</p>
						<S.LinksHeaderActions>
							<Button
								type={'alt3'}
								label={language?.clear}
								handlePress={() => {
									setNewLinkUrl('');
									setNewLinkTitle('');
									setNewLinkIcon(null);
								}}
								disabled={
									!arProvider.wallet ||
									!portalProvider.current?.id ||
									linkLoading ||
									(!newLinkUrl && !newLinkTitle && !newLinkIcon)
								}
								loading={false}
								warning
							/>
							<S.LinkPrefillWrapper>
								<CloseHandler callback={() => setShowPrefills(false)} active={showPrefills} disabled={!showPrefills}>
									<Button
										type={'alt4'}
										label={language?.prefill}
										handlePress={() => setShowPrefills(!showPrefills)}
										disabled={unauthorized || !arProvider.wallet || !portalProvider.current?.id || linkLoading}
										loading={false}
									/>
									{showPrefills && (
										<S.LinkPrefillsDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
											<S.LinkPrefillOptions>
												{prefills.map((prefill: { title: string; icon: string }, index: number) => {
													return (
														<S.LinkPrefillOption
															key={index}
															onClick={() => {
																setNewLinkTitle(prefill.title);
																setNewLinkIcon(prefill.icon);
																setShowPrefills(false);
															}}
														>
															<ReactSVG src={getTxEndpoint(prefill.icon)} />
															<span>{prefill.title}</span>
														</S.LinkPrefillOption>
													);
												})}
											</S.LinkPrefillOptions>
										</S.LinkPrefillsDropdown>
									)}
								</CloseHandler>
							</S.LinkPrefillWrapper>
						</S.LinksHeaderActions>
					</S.LinksHeader>
					<S.LinkDetailsWrapper>
						<FormField
							value={newLinkTitle}
							onChange={(e: any) => setNewLinkTitle(e.target.value)}
							invalid={{ status: false, message: null }}
							label={language?.text}
							disabled={linkLoading || unauthorized}
							hideErrorMessage
							sm
						/>
						<S.IconInput
							hasData={newLinkIcon !== null}
							onClick={() => inputRef.current.click()}
							disabled={unauthorized || linkLoading}
						>
							{getIconWrapper()}
						</S.IconInput>
						<input
							id={'link-icon-input'}
							ref={inputRef}
							type={'file'}
							onChange={(e: any) => handleFileChange(e)}
							disabled={linkLoading}
							accept={ALLOWED_ICON_TYPES}
						/>
					</S.LinkDetailsWrapper>
					<S.LinksAddAction>
						<Button
							type={'alt4'}
							label={language?.add}
							handlePress={addLink}
							disabled={linkActionDisabled}
							loading={linkLoading}
							icon={ASSETS.add}
							iconLeftAlign
						/>
						<FormField
							value={newLinkUrl}
							onChange={(e: any) => setNewLinkUrl(e.target.value)}
							invalid={{ status: newLinkUrl?.length > 0 && !validateUrl(newLinkUrl), message: null }}
							label={language?.url}
							placeholder={'https://'}
							disabled={linkLoading || unauthorized}
							hideErrorMessage
							sm
						/>
					</S.LinksAddAction>
				</S.LinksAction>
				<S.LinksBodyWrapper>
					<S.LinksHeader>
						<p>{language?.current}</p>
						<Button
							type={'alt4'}
							label={editMode ? language?.done : language?.edit}
							handlePress={() => {
								setEditMode(!editMode);
								setSelectedLinks([]);
							}}
							active={editMode}
							disabled={unauthorized || linkOptions?.length <= 0 || linkLoading}
							loading={false}
							icon={editMode ? ASSETS.close : ASSETS.write}
							iconLeftAlign
						/>
					</S.LinksHeader>
					<S.LinksBody type={props.type} editMode={editMode}>
						{getLinks()}
					</S.LinksBody>
					<S.LinksFooter>
						{props.closeAction && (
							<Button type={'alt3'} label={language?.close} handlePress={() => props.closeAction()} />
						)}
						<Button
							type={'alt3'}
							label={language?.remove}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={!selectedLinks?.length || linkLoading}
							loading={false}
							icon={ASSETS.delete}
							iconLeftAlign
							warning
						/>
					</S.LinksFooter>
				</S.LinksBodyWrapper>
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language?.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language?.linkDeleteConfirmationInfo}</p>
							<S.ModalBodyElements>
								{selectedLinks.map((link: PortalLinkType, index: number) => {
									return (
										<S.ModalBodyElement key={index}>
											<span>{`· ${link.title.toUpperCase()}`}</span>
										</S.ModalBodyElement>
									);
								})}
							</S.ModalBodyElements>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={linkLoading}
							/>
							<Button
								type={'primary'}
								label={language?.linkDeleteConfirmation}
								handlePress={() => deleteLinks()}
								disabled={!selectedLinks?.length || linkLoading}
								loading={linkLoading}
								icon={ASSETS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
		</>
	);
}
