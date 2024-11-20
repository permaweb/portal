import React from 'react';
import { ReactSVG } from 'react-svg';

import { globalLog, mapFromProcessCase, mapToProcessCase, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { NotificationType, PortalLinkType } from 'helpers/types';
import { validateUrl } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

export default function LinkList(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [linkOptions, setLinkOptions] = React.useState<PortalLinkType[]>([]);
	const [newLinkUrl, setNewLinkUrl] = React.useState<string>('');
	const [newLinkTitle, setNewLinkTitle] = React.useState<string>('');

	const [linkLoading, setLinkLoading] = React.useState<boolean>(false);
	const [linkResponse, setLinkResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (portalProvider.current.links) setLinkOptions(portalProvider.current.links);
		}
	}, [portalProvider.current?.id]);

	const addLink = async () => {
		if (newLinkUrl && newLinkTitle && portalProvider.current?.id && arProvider.wallet) {
			setLinkLoading(true);
			try {
				const newLink = { Url: newLinkUrl, Title: newLinkTitle };

				const updatedLinkOptions = [...mapToProcessCase(linkOptions), newLink];

				const linkUpdateId = await updateZone(
					{ Links: updatedLinkOptions },
					portalProvider.current.id,
					arProvider.wallet
				);

				globalLog(`Link update: ${linkUpdateId}`);

				setLinkOptions(mapFromProcessCase(updatedLinkOptions));
				// props.setTopics([...props.topics, newTopic]);
				setLinkResponse({ status: 'success', message: `${language.linkAdded}!` });

				setNewLinkUrl('');
				setNewLinkTitle('');
			} catch (e: any) {
				setLinkResponse({ status: 'warning', message: e.message ?? 'Error adding link' });
			}
			setLinkLoading(false);
		}
	};

	console.log(linkOptions);

	const linkActionDisabled =
		!arProvider.wallet || !portalProvider.current?.id || !newLinkUrl || !newLinkTitle || linkLoading;

	function getLinks() {
		if (!portalProvider.current?.links) {
			return (
				<S.WrapperEmpty>
					<p>Getting links...</p>
				</S.WrapperEmpty>
			);
		} else if (portalProvider.current.links.length <= 0) {
			return (
				<S.WrapperEmpty>
					<p>No links found</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<>
				{portalProvider.current.links.map((link: PortalLinkType, index: number) => {
					return (
						<S.LinkWrapper key={index}>
							<a href={link.url} target={'_blank'}>
								<ReactSVG src={link.icon ?? ASSETS.link} />
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
					</S.LinksActionHeader>
					<FormField
						value={newLinkUrl}
						onChange={(e: any) => setNewLinkUrl(e.target.value)}
						invalid={{ status: newLinkUrl?.length > 0 && !validateUrl(newLinkUrl), message: null }}
						label={'URL'}
						placeholder={'https://'}
						disabled={linkLoading}
						hideErrorMessage
						sm
					/>
					<FormField
						value={newLinkTitle}
						onChange={(e: any) => setNewLinkTitle(e.target.value)}
						invalid={{ status: false, message: null }}
						label={'Link Text'}
						disabled={linkLoading}
						hideErrorMessage
						sm
					/>
					<Button
						type={'alt3'}
						label={language.add}
						handlePress={addLink}
						disabled={linkActionDisabled}
						loading={linkLoading}
						icon={ASSETS.add}
						iconLeftAlign
					/>
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
