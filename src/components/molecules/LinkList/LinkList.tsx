import React from 'react';
import { ReactSVG } from 'react-svg';

import { globalLog, mapFromProcessCase, mapToProcessCase, resolveTransaction, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { ASSETS, SOCIAL_LINK_ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType, PortalLinkType } from 'helpers/types';
import { checkValidAddress, validateUrl } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

const ALLOWED_ICON_TYPES = 'image/svg+xml';

// TODO: Clear fields option
export default function LinkList(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<any>(null);

	const [linkOptions, setLinkOptions] = React.useState<PortalLinkType[] | null>(null);
	const [linkLoading, setLinkLoading] = React.useState<boolean>(false);
	const [linkResponse, setLinkResponse] = React.useState<NotificationType | null>(null);
	const [showPrefills, setShowPrefills] = React.useState<boolean>(false);

	const [newLinkUrl, setNewLinkUrl] = React.useState<string>('');
	const [newLinkTitle, setNewLinkTitle] = React.useState<string>('');
	const [newLinkIcon, setNewLinkIcon] = React.useState<any>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.links) setLinkOptions(portalProvider.current.links);
		}
	}, [portalProvider.current?.id]);

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

	const addLink = async () => {
		if (newLinkUrl && newLinkTitle && portalProvider.current?.id && arProvider.wallet) {
			setLinkLoading(true);
			try {
				let newLink: { Url: string; Title: string; Icon?: string } = { Url: newLinkUrl, Title: newLinkTitle };

				if (newLinkIcon) newLink.Icon = await resolveTransaction(newLinkIcon);

				const updatedLinkOptions = [...mapToProcessCase(linkOptions), newLink];

				const linkUpdateId = await updateZone(
					{ Links: updatedLinkOptions },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal();

				globalLog(`Link update: ${linkUpdateId}`);

				setLinkOptions(mapFromProcessCase(updatedLinkOptions));
				setLinkResponse({ status: 'success', message: `${language.linkAdded}!` });

				setNewLinkUrl('');
				setNewLinkTitle('');
				setNewLinkIcon(null);
			} catch (e: any) {
				setLinkResponse({ status: 'warning', message: e.message ?? 'Error adding link' });
			}
			setLinkLoading(false);
		}
	};

	const linkActionDisabled =
		!arProvider.wallet || !portalProvider.current?.id || !newLinkUrl || !newLinkTitle || linkLoading;

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

	function getIconWrapper() {
		if (newLinkIcon)
			return <ReactSVG src={checkValidAddress(newLinkIcon) ? getTxEndpoint(newLinkIcon) : newLinkIcon} />;
		return <span>{'SVG'}</span>;
	}

	function getLinks() {
		if (!linkOptions) {
			return (
				<S.WrapperEmpty>
					<p>{`${language.gettingLinks}...`}</p>
				</S.WrapperEmpty>
			);
		} else if (linkOptions.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noLinksFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{linkOptions.map((link: PortalLinkType, index: number) => {
					return (
						<S.LinkWrapper key={index}>
							<a href={link.url} target={'_blank'}>
								<ReactSVG src={link.icon ? getTxEndpoint(link.icon) : ASSETS.link} />
							</a>
							<S.LinkTooltip className={'info'}>
								<span>{link.title}</span>
							</S.LinkTooltip>
						</S.LinkWrapper>
					);
				})}
			</>
		);
	}

	return (
		<>
			<S.Wrapper>
				<S.LinksBody type={props.type} className={'border-wrapper-alt3'}>
					{getLinks()}
				</S.LinksBody>
				<S.LinksAction>
					<S.LinksActionHeader>
						<p>{language.addLink}</p>
						<S.LinkPrefillWrapper>
							<CloseHandler callback={() => setShowPrefills(false)} active={showPrefills} disabled={!showPrefills}>
								<Button
									type={'alt3'}
									label={language.prefill}
									handlePress={() => setShowPrefills(!showPrefills)}
									disabled={!arProvider.wallet || !portalProvider.current?.id || linkLoading}
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
					</S.LinksActionHeader>
					<S.LinkDetailsWrapper>
						<FormField
							value={newLinkTitle}
							onChange={(e: any) => setNewLinkTitle(e.target.value)}
							invalid={{ status: false, message: null }}
							label={language.text}
							disabled={linkLoading}
							hideErrorMessage
							sm
						/>
						<S.IconInput hasData={newLinkIcon !== null} onClick={() => inputRef.current.click()} disabled={linkLoading}>
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
					<FormField
						value={newLinkUrl}
						onChange={(e: any) => setNewLinkUrl(e.target.value)}
						invalid={{ status: newLinkUrl?.length > 0 && !validateUrl(newLinkUrl), message: null }}
						label={language.url}
						placeholder={'https://'}
						disabled={linkLoading}
						hideErrorMessage
						sm
					/>
					<S.LinksActionFlex>
						<Button
							type={'alt3'}
							label={language.add}
							handlePress={addLink}
							disabled={linkActionDisabled}
							loading={linkLoading}
							icon={ASSETS.add}
							iconLeftAlign
						/>
					</S.LinksActionFlex>
				</S.LinksAction>
			</S.Wrapper>
			{linkResponse && (
				<Notification
					type={linkResponse.status}
					message={linkResponse.message}
					callback={() => setLinkResponse(null)}
				/>
			)}
		</>
	);
}
