import React from 'react';
import { ReactSVG } from 'react-svg';

import { addToZone, globalLog, mapToProcessCase, resolveTransaction, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Notification } from 'components/atoms/Notification';
import { Tabs } from 'components/atoms/Tabs';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { MediaConfigType, NotificationType, PortalUploadOptionType, PortalUploadType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';
import { IProps } from './types';

export default function MediaLibrary(props: IProps) {
	const arProvider = useArweaveProvider();
	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const mediaConfig: Record<PortalUploadOptionType, MediaConfigType> = {
		image: {
			type: 'image',
			icon: ASSETS.image,
			label: language.image,
			renderContent: (url) => <img src={url} />,
			acceptType: 'image/*',
		},
		video: {
			type: 'video',
			icon: ASSETS.video,
			label: language.video,
			renderContent: (url) => <video controls src={url} />,
			acceptType: 'video/*',
		},
	};

	const inputRef = React.useRef(null);

	const TABS = [{ label: language.all }, { label: language.images }, { label: language.videos }];

	const [selectedUpload, setSelectedUpload] = React.useState<PortalUploadType | null>(null);
	const [uploads, setUploads] = React.useState<PortalUploadType[] | null>(null);
	const [currentList, setCurrentList] = React.useState<string>(TABS[0]!.label);
	const [currentAcceptType, setCurrentAcceptType] = React.useState<string>('');
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);
	const [newUploadUrl, setNewUploadUrl] = React.useState<string | null>(null);
	const [mediaLoading, setMediaLoading] = React.useState<boolean>(false);
	const [mediaMessage, setMediaMessage] = React.useState<string | null>(null);
	const [mediaResponse, setMediaResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.uploads) {
			switch (currentList) {
				case language.all:
					setUploads(portalProvider.current.uploads);

					const updatedAcceptType = Object.keys(mediaConfig)
						.map((entry) => mediaConfig[entry].acceptType)
						.join(', ');
					setCurrentAcceptType(updatedAcceptType);
					break;
				case language.images:
					setUploads(
						portalProvider.current.uploads.filter((upload: PortalUploadType) => upload.type.toLowerCase() === 'image')
					);
					setCurrentAcceptType(mediaConfig['image'].acceptType);
					break;
				case language.videos:
					setUploads(
						portalProvider.current.uploads.filter((upload: PortalUploadType) => upload.type.toLowerCase() === 'video')
					);
					setCurrentAcceptType(mediaConfig['video'].acceptType);
					break;
				default:
					break;
			}
		}
	}, [currentList, portalProvider.current?.uploads, language]);

	React.useEffect(() => {
		(async function () {
			if (newUploadUrl && portalProvider.current?.id && arProvider.wallet) {
				setMediaLoading(true);
				setMediaMessage(`${language.uploadingMedia}...`);
				try {
					const tx = await resolveTransaction(newUploadUrl);

					const mediaUpdateId = await addToZone(
						{
							path: 'Uploads',
							data: mapToProcessCase({ tx: tx, type: getMediaType(newUploadUrl), dateUploaded: Date.now().toString() }),
						},
						portalProvider.current.id,
						arProvider.wallet
					);

					portalProvider.refreshCurrentPortal();

					globalLog(`Media update: ${mediaUpdateId}`);

					setNewUploadUrl(null);
					setMediaResponse({ status: 'success', message: `${language.mediaUploaded}!` });
				} catch (e: any) {
					setMediaResponse({ status: 'warning', message: e.message ?? 'Error uploading media' });
					setNewUploadUrl(null);
				}
				setMediaLoading(false);
				setMediaMessage(null);
			}
		})();
	}, [newUploadUrl, portalProvider.current?.id, arProvider.wallet]);

	function getMediaType(dataUrl: string): string {
		// Extract the media type from the data URL
		const mediaTypeMatch = dataUrl.match(/^data:(.+?);base64,/);

		if (!mediaTypeMatch || mediaTypeMatch.length < 2) {
			throw new Error('Invalid data URL');
		}

		const mediaType = mediaTypeMatch[1];

		// Check if the media type starts with "image" or "video"
		if (mediaType.startsWith('image/')) {
			return 'image';
		} else if (mediaType.startsWith('video/')) {
			return 'video';
		}

		return 'unknown';
	}

	function getUpload(upload: PortalUploadType) {
		switch (upload.type) {
			case 'image':
				return <img src={getTxEndpoint(upload.tx)} />;
			case 'video':
				return <video controls src={getTxEndpoint(upload.tx)} />;
		}
	}

	const deleteUpload = async () => {
		if (arProvider.wallet && portalProvider.current?.uploads && selectedUpload) {
			setShowDeleteConfirmation(false);
			setMediaLoading(true);
			setMediaMessage(`${language.removingMedia}...`);
			try {
				const updatedMedia = portalProvider.current?.uploads.filter(
					(upload: PortalUploadType) => upload.tx !== selectedUpload.tx
				);

				const mediaUpdateId = await updateZone(
					{ Uploads: mapToProcessCase(updatedMedia) },
					portalProvider.current.id,
					arProvider.wallet
				);

				setSelectedUpload(null);

				portalProvider.refreshCurrentPortal();

				globalLog(`Media update: ${mediaUpdateId}`);

				setMediaResponse({ status: 'success', message: `${language.mediaUpdated}!` });
			} catch (e: any) {
				setMediaResponse({ status: 'warning', message: e.message ?? 'Error updating media' });
			}
			setMediaLoading(false);
			setMediaMessage(null);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const url = event.target?.result as string;
				setNewUploadUrl(url);
			};
			reader.readAsDataURL(file);
		}
	};

	const header = React.useMemo(() => {
		if (props.type === 'all') {
			return (
				<S.TabsWrapper>
					<Tabs onTabPropClick={(label: string) => setCurrentList(label)} type={'alt1'}>
						{TABS.map((tab: { label: string; icon?: string }, index: number) => {
							return <S.TabWrapper key={index} label={tab.label} icon={tab.icon ? tab.icon : null} />;
						})}
					</Tabs>
				</S.TabsWrapper>
			);
		}

		return <p>{`${props.type}s`}</p>;
	}, [props.type]);

	const body = React.useMemo(() => {
		if (!uploads) {
			return (
				<S.LoadingWrapper>
					<p>{`${language.gettingUploads}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (uploads.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language.noUploadsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.UploadsWrapper>
				{uploads.map((upload: PortalUploadType) => {
					const active = selectedUpload?.tx === upload.tx;

					return (
						<S.UploadWrapper key={upload.tx} active={active} onClick={() => setSelectedUpload(active ? null : upload)}>
							{getUpload(upload)}
							{active && (
								<S.Indicator>
									<ReactSVG src={ASSETS.checkmark} />
								</S.Indicator>
							)}
						</S.UploadWrapper>
					);
				})}
			</S.UploadsWrapper>
		);
	}, [uploads, selectedUpload]);

	return (
		<>
			<S.Wrapper>
				<S.Header className={'border-wrapper-alt3'}>
					{header}
					<S.HeaderActions>
						<Button
							type={'alt3'}
							label={language.remove}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={!selectedUpload}
							loading={false}
							icon={ASSETS.delete}
							iconLeftAlign
							warning
						/>
						<Button
							type={'alt4'}
							label={language.upload}
							handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
							disabled={false}
							loading={false}
							icon={ASSETS.upload}
							iconLeftAlign
						/>
					</S.HeaderActions>
				</S.Header>
				{body}
				{(props.callback || props.handleClose) && (
					<S.ActionsWrapper>
						{props.handleClose && (
							<Button type={'primary'} label={language.close} handlePress={() => props.handleClose()} />
						)}
						{props.callback && (
							<Button
								type={'alt1'}
								label={language.select}
								handlePress={() => props.callback(selectedUpload)}
								disabled={!selectedUpload}
							/>
						)}
					</S.ActionsWrapper>
				)}
				<input
					id={'media-file-input'}
					ref={inputRef}
					type={'file'}
					accept={props.type === 'all' ? currentAcceptType : mediaConfig[props.type].acceptType}
					onChange={handleFileChange}
				/>
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language.mediaDeleteConfirmationInfo}</p>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={mediaLoading}
							/>
							<Button
								type={'primary'}
								label={language.mediaDeleteConfirmation}
								handlePress={() => deleteUpload()}
								disabled={!selectedUpload || mediaLoading}
								loading={mediaLoading}
								icon={ASSETS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
			{mediaLoading && <Loader message={mediaMessage ?? `${language.loading}...`} />}
			{mediaResponse && (
				<Notification
					type={mediaResponse.status}
					message={mediaResponse.message}
					callback={() => setMediaResponse(null)}
				/>
			)}
		</>
	);
}
