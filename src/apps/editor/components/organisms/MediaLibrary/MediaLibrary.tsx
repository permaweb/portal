import React from 'react';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Tabs } from 'components/atoms/Tabs';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ICONS, UPLOAD } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { MediaConfigType, PortalPatchMapEnum, PortalUploadOptionType, PortalUploadType } from 'helpers/types';
import { compressImageToSize, isCompressibleImage } from 'helpers/utils';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function MediaLibrary(props: {
	type: PortalUploadOptionType | 'all';
	callback?: (upload: PortalUploadType) => void;
	handleClose?: () => void;
	selectDisabled?: boolean;
	columns?: number;
}) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { addNotification } = useNotifications();
	const { uploadCost, showUploadConfirmation, calculateUploadCost, clearUploadState } = useUploadCost();

	const mediaConfig: Record<PortalUploadOptionType, MediaConfigType> = {
		image: {
			type: 'image',
			icon: ICONS.image,
			label: language?.image,
			renderContent: (url) => <img src={url} />,
			acceptType: 'image/*',
		},
		video: {
			type: 'video',
			icon: ICONS.video,
			label: language?.video,
			renderContent: (url) => <video controls src={url} />,
			acceptType: 'video/*',
		},
	};

	const inputRef = React.useRef(null);
	const videoRef = React.useRef(null);
	const canvasRef = React.useRef(null);

	const TABS = [
		{ type: 'all', label: language?.all },
		{ type: 'image', label: language?.images },
		{ type: 'video', label: language?.videos },
	];

	const [selectedUpload, setSelectedUpload] = React.useState<PortalUploadType | null>(null);
	const [columns, setColumns] = React.useState<number>(props.columns ?? 4);
	const [uploads, setUploads] = React.useState<PortalUploadType[] | null>(null);
	const [currentList, setCurrentList] = React.useState<string>(TABS.find((tab) => tab.type === props.type).type);
	const [currentAcceptType, setCurrentAcceptType] = React.useState<string>('');
	const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState<boolean>(false);

	const [mediaData, setMediaData] = React.useState<File | null>(null);
	const [mediaLoading, setMediaLoading] = React.useState<boolean>(false);
	const [mediaMessage, setMediaMessage] = React.useState<string | null>(null);
	const [compressing, setCompressing] = React.useState<boolean>(false);

	const unauthorized = !portalProvider.permissions?.updatePortalMeta;

	const canCompress = mediaData && isCompressibleImage(mediaData);

	React.useEffect(() => {
		if (portalProvider.current?.uploads) {
			switch (currentList) {
				case 'all':
					setUploads(portalProvider.current.uploads);
					const updatedAcceptType = Object.keys(mediaConfig)
						.map((entry) => mediaConfig[entry].acceptType)
						.join(', ');
					setCurrentAcceptType(updatedAcceptType);
					break;
				case 'image':
					setUploads(
						portalProvider.current.uploads.filter((upload: PortalUploadType) => upload.type.toLowerCase() === 'image')
					);
					setCurrentAcceptType(mediaConfig['image'].acceptType);
					break;
				case 'video':
					setUploads(
						portalProvider.current.uploads.filter((upload: PortalUploadType) => upload.type.toLowerCase() === 'video')
					);
					setCurrentAcceptType(mediaConfig['video'].acceptType);
					break;
				default:
					break;
			}
		}
	}, [currentList, portalProvider.current?.uploads]);

	React.useEffect(() => {
		(async function () {
			if (!unauthorized && mediaData && portalProvider.current?.id && arProvider.wallet) {
				const result = await calculateUploadCost(mediaData);

				if (result && !result.requiresConfirmation) {
					await handleUpload();
				}
			}
		})();
	}, [
		mediaData,
		portalProvider.current?.id,
		portalProvider.permissions?.updatePortalMeta,
		arProvider.wallet,
		calculateUploadCost,
	]);

	async function handleUpload() {
		setMediaLoading(true);
		try {
			let tx: string;
			try {
				tx = await permawebProvider.libs.resolveTransaction(mediaData);
			} catch (e) {
				debugLog('error', 'MediaLibrary', 'Upload failed', e);
				throw new Error('Failed to upload media to Permaweb');
			}

			const mediaType = getMediaType(mediaData);

			let thumbnail: string | null = null;
			if (mediaType === 'video') {
				thumbnail = await generateThumbnail();
				debugLog('info', 'MediaLibrary', `Video thumbnail: ${thumbnail}`);
			}

			const data: any = {
				tx: tx,
				type: mediaType,
				dateUploaded: Date.now().toString(),
			};

			if (thumbnail) data.thumbnail = thumbnail;

			const updatedMedia = [...portalProvider.current.uploads, data];

			const mediaUpdateId = await permawebProvider.libs.updateZone(
				{ Uploads: permawebProvider.libs.mapToProcessCase(updatedMedia) },
				portalProvider.current.id,
				arProvider.wallet
			);

			debugLog('info', 'MediaLibrary', `Media update: ${mediaUpdateId}`);

			addNotification(`${language?.mediaUploaded}!`, 'success');
			handleClear(null);

			portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Media);
		} catch (e: any) {
			handleClear(e.message ?? 'Error uploading media');
		}
		setMediaLoading(false);
	}

	async function handleCompress() {
		if (!mediaData) return;
		setCompressing(true);
		try {
			const compressedFile = await compressImageToSize(mediaData, UPLOAD.dispatchUploadSize);
			clearUploadState();
			setMediaData(compressedFile);
		} catch (e: any) {
			addNotification(e.message ?? 'Error compressing image', 'warning');
		}
		setCompressing(false);
	}

	async function generateThumbnail() {
		if (!mediaData) return null;
		const url = URL.createObjectURL(mediaData);
		const video = videoRef.current!;
		video.src = url;

		await new Promise<void>((res, rej) => {
			video.onloadedmetadata = () => res();
			video.onerror = (e) => rej(e);
		});

		const seekTime = video.duration * 0.25;
		video.currentTime = seekTime;
		await new Promise<void>((res) => {
			video.onseeked = () => res();
		});

		const canvas = canvasRef.current!;
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(video, 0, 0);

		const dataURL = canvas.toDataURL('image/jpeg', 0.8);
		URL.revokeObjectURL(url);

		return await permawebProvider.libs.resolveTransaction(dataURL);
	}

	function getMediaType(file: File): 'image' | 'video' | 'unknown' {
		const { type } = file;

		if (!type) return 'unknown';

		if (type.startsWith('image/')) {
			return 'image';
		} else if (type.startsWith('video/')) {
			return 'video';
		}

		return 'unknown';
	}

	const deleteUpload = async () => {
		if (!unauthorized && arProvider.wallet && portalProvider.current?.uploads && selectedUpload) {
			setShowDeleteConfirmation(false);
			setMediaLoading(true);
			setMediaMessage(`${language?.removingMedia}...`);
			try {
				const updatedMedia = portalProvider.current?.uploads.filter(
					(upload: PortalUploadType) => upload.tx !== selectedUpload.tx
				);

				const mediaUpdateId = await permawebProvider.libs.updateZone(
					{ Uploads: permawebProvider.libs.mapToProcessCase(updatedMedia) },
					portalProvider.current.id,
					arProvider.wallet
				);

				setSelectedUpload(null);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Media);

				debugLog('info', 'MediaLibrary', `Media update: ${mediaUpdateId}`);

				addNotification(`${language?.mediaUpdated}!`, 'success');
			} catch (e: any) {
				addNotification(e.message ?? 'Error updating media', 'warning');
			}
			setMediaLoading(false);
			setMediaMessage(null);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setMediaData(file);
	};

	function handleClear(message: string | null) {
		if (message) addNotification(message, 'warning');
		setMediaData(null);
		clearUploadState();
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}

	function getCurrentList(label: string) {
		return TABS.find((tab) => tab.label === label).type;
	}

	function getUpload(upload: PortalUploadType) {
		switch (upload.type) {
			case 'image':
				return <img src={getTxEndpoint(upload.tx)} />;
			case 'video':
				if (upload.thumbnail)
					return (
						<>
							<img src={getTxEndpoint(upload.thumbnail)} />
							<div className={'info'}>
								<span>{language?.video}</span>
							</div>
						</>
					);
				return <video controls src={getTxEndpoint(upload.tx)} />;
		}
	}

	const header = React.useMemo(() => {
		if (props.type === 'all') {
			return (
				<S.TabsWrapper>
					<Tabs onTabPropClick={(label: string) => setCurrentList(getCurrentList(label))} type={'alt1'}>
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
					<p>{`${language?.gettingUploads}...`}</p>
				</S.LoadingWrapper>
			);
		} else if (uploads.length === 0) {
			return (
				<S.WrapperEmpty>
					<p>{language?.noUploadsFound}</p>
				</S.WrapperEmpty>
			);
		}

		return (
			<S.UploadsWrapper>
				{uploads.map((upload: PortalUploadType) => {
					const active = selectedUpload?.tx === upload.tx;

					return (
						<S.UploadWrapper
							key={upload.tx}
							active={active}
							disabled={props.selectDisabled}
							onClick={() => setSelectedUpload(active ? null : upload)}
							columns={columns}
						>
							{getUpload(upload)}
							{active && (
								<S.Indicator>
									<ReactSVG src={ICONS.checkmark} />
								</S.Indicator>
							)}
						</S.UploadWrapper>
					);
				})}
			</S.UploadsWrapper>
		);
	}, [uploads, selectedUpload, columns]);

	return (
		<>
			<S.Wrapper>
				<S.Header>
					{header}
					<S.HeaderActions>
						<S.ColumnActions>
							<IconButton
								type={'alt1'}
								active={false}
								src={ICONS.minus}
								handlePress={() => setColumns((prev) => prev + 1)}
								disabled={columns >= 8}
								dimensions={{ wrapper: 23.5, icon: 13.5 }}
								tooltip={language.smaller}
								noFocus
							/>
							<IconButton
								type={'alt1'}
								active={false}
								src={ICONS.plus}
								handlePress={() => setColumns((prev) => prev - 1)}
								disabled={columns <= 2}
								dimensions={{ wrapper: 23.5, icon: 13.5 }}
								tooltip={language.larger}
								noFocus
							/>
						</S.ColumnActions>
						<Button
							type={'alt3'}
							label={language?.remove}
							handlePress={() => setShowDeleteConfirmation(true)}
							disabled={unauthorized || !selectedUpload}
							loading={false}
							icon={ICONS.delete}
							iconLeftAlign
							warning
						/>
						<Button
							type={'alt4'}
							label={language?.upload}
							handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
							disabled={unauthorized}
							loading={false}
						/>
					</S.HeaderActions>
				</S.Header>
				{body}
				{(props.callback || props.handleClose) && (
					<S.ActionsWrapper>
						{props.handleClose && (
							<Button type={'primary'} label={language?.close} handlePress={() => props.handleClose()} />
						)}
						{props.callback && (
							<Button
								type={'alt1'}
								label={language?.select}
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
				<video id={'media-file-input'} ref={videoRef} style={{ display: 'none' }} />
				<canvas id={'media-file-input'} ref={canvasRef} style={{ display: 'none' }} />
			</S.Wrapper>
			{showDeleteConfirmation && (
				<Modal header={language?.confirmDeletion} handleClose={() => setShowDeleteConfirmation(false)}>
					<S.ModalWrapper>
						<S.ModalBodyWrapper>
							<p>{language?.mediaDeleteConfirmationInfo}</p>
						</S.ModalBodyWrapper>
						<S.ModalActionsWrapper>
							<Button
								type={'primary'}
								label={language?.cancel}
								handlePress={() => setShowDeleteConfirmation(false)}
								disabled={mediaLoading}
							/>
							<Button
								type={'primary'}
								label={language?.mediaDeleteConfirmation}
								handlePress={() => deleteUpload()}
								disabled={!selectedUpload || mediaLoading}
								loading={mediaLoading}
								icon={ICONS.delete}
								iconLeftAlign
								warning
							/>
						</S.ModalActionsWrapper>
					</S.ModalWrapper>
				</Modal>
			)}
			{showUploadConfirmation && (
				<Modal
					header={`${language?.upload} ${mediaData.name}`}
					handleClose={() => handleClear(language?.uploadCancelled)}
					className={'modal-wrapper'}
				>
					<TurboUploadConfirmation
						uploadCost={uploadCost}
						uploadDisabled={unauthorized || mediaLoading}
						handleUpload={handleUpload}
						handleCancel={() => handleClear(language?.uploadCancelled)}
						handleCompress={handleCompress}
						canCompress={canCompress}
						compressing={compressing}
					/>
				</Modal>
			)}
			{mediaLoading && <Loader message={mediaMessage ?? `${language?.loading}...`} />}
		</>
	);
}
