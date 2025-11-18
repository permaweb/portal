import React from 'react';
import { ReactSVG } from 'react-svg';

import { MediaLibrary } from 'editor/components/organisms/MediaLibrary';
import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Modal } from 'components/atoms/Modal';
import { Panel } from 'components/atoms/Panel';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import {
	AlignmentButtonType,
	AlignmentEnum,
	MediaConfigType,
	PortalPatchMapEnum,
	PortalUploadOptionType,
	PortalUploadType,
} from 'helpers/types';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

type ImageSize = 'small' | 'medium' | 'large';

const SIZE_PRESETS: Record<ImageSize, number> = {
	small: 360,
	medium: 640,
	large: 960,
};

function snapWidthToPreset(width?: number | null): ImageSize | null {
	if (!width) return null;
	const entries = Object.entries(SIZE_PRESETS) as [ImageSize, number][];
	let best: [ImageSize, number] = entries[0];
	for (const e of entries) {
		if (Math.abs(e[1] - width) < Math.abs(best[1] - width)) best = e;
	}
	return best[0];
}

export default function MediaBlock(props: { type: 'image' | 'video'; content: any; data: any; onChange: any }) {
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

	const config = mediaConfig[props.type];

	const inputRef = React.useRef(null);
	const mediaRef = React.useRef<HTMLDivElement>(null);
	const prevPropsDataRef = React.useRef<{
		url?: string | null;
		caption: string | null;
		alignment: AlignmentEnum | null;
		width?: number | null;
	}>();
	const isInternalUpdateRef = React.useRef(false);
	const isResizingRef = React.useRef(false);

	const [mediaData, setMediaData] = React.useState<{
		url?: string | null;
		file?: File | null;
		caption: string | null;
		alignment: AlignmentEnum | null;
		width?: number | null;
	}>({
		url: null,
		caption: null,
		alignment: AlignmentEnum.Column,
		width: null,
	});
	const [showCaptionEdit, setShowCaptionEdit] = React.useState<boolean>(false);
	const [showMediaLibrary, setShowMediaLibrary] = React.useState<boolean>(false);
	const [isValidUrl, setIsValidUrl] = React.useState(true);

	const [mediaUploaded, setMediaUploaded] = React.useState<boolean>(false);
	const [mediaLoading, setMediaLoading] = React.useState<boolean>(false);
	const [uploadDisabled, setUploadDisabled] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (
			props.data &&
			!isInternalUpdateRef.current &&
			(props.data.url !== prevPropsDataRef.current?.url ||
				props.data.caption !== prevPropsDataRef.current?.caption ||
				props.data.alignment !== prevPropsDataRef.current?.alignment ||
				props.data.width !== prevPropsDataRef.current?.width)
		) {
			setMediaData(props.data);
			prevPropsDataRef.current = {
				url: props.data.url,
				caption: props.data.caption,
				alignment: props.data.alignment,
				width: props.data.width,
			};
		}
		isInternalUpdateRef.current = false;
	}, [props.data?.url, props.data?.caption, props.data?.alignment, props.data?.width]);

	React.useEffect(() => {
		(async function () {
			if (mediaData?.file && !mediaData.url && !mediaUploaded && portalProvider.current?.id && arProvider.wallet) {
				const result = await calculateUploadCost(mediaData.file);

				if (result) {
					if (result.hasInsufficientBalance) {
						setUploadDisabled(true);
					} else if (!result.requiresConfirmation) {
						await handleUpload();
					}
				}
			}
		})();
	}, [mediaData, portalProvider.current?.id, arProvider.wallet, calculateUploadCost]);

	React.useEffect(() => {
		if (mediaData?.url && validateUrl(mediaData.url) && mediaData.url.startsWith('https://')) {
			isInternalUpdateRef.current = true;
			props.onChange(buildContent(mediaData), mediaData);
		}
	}, [mediaData?.url, mediaData?.caption, mediaData?.alignment, mediaData?.width]);

	function buildContent(data: any) {
		const widthStyle = data.width ? ` style="width: ${data.width}px; max-width: 100%;"` : '';
		const mediaTag = props.type === 'video' ? `<video controls src="${data.url}"></video>` : `<img src="${data.url}"/>`;

		return `
    <div class="portal-media-wrapper ${data.alignment}"${widthStyle}>
      ${mediaTag}
      ${data.caption ? `<p>${data.caption}</p>` : ''}
    </div>
  `;
	}

	async function handleUpload() {
		setMediaLoading(true);
		try {
			const tx = await permawebProvider.libs.resolveTransaction(mediaData.file);

			if (portalProvider.permissions?.updatePortalMeta) {
				const data: any = {
					tx: tx,
					type: props.type,
					dateUploaded: Date.now().toString(),
				};

				const updatedMedia = [...portalProvider.current.uploads, data];

				const mediaUpdateId = await permawebProvider.libs.updateZone(
					{ Uploads: permawebProvider.libs.mapToProcessCase(updatedMedia) },
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Media update: ${mediaUpdateId}`);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Media);
			}

			setMediaData((prevContent) => ({ ...prevContent, url: getTxEndpoint(tx) }));
			setMediaUploaded(true);
			addNotification(`${language?.mediaUploaded}!`, 'success');
		} catch (e: any) {
			handleClear(e.message ?? 'Error uploading media');
		}
		setMediaLoading(false);
	}

	function handleClear(message: string) {
		addNotification(message, 'warning');
		setMediaData((prevContent) => ({ ...prevContent, file: null }));
		clearUploadState();
		setUploadDisabled(false);
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}

	const validateUrl = (url: string) => {
		if (url.startsWith('data')) {
			return true;
		}
		const urlPattern = /^(https?:\/\/)?([\w\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*[\w\/:;=\?&%+#]*)?\/?$/i;
		return urlPattern.test(url);
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const url = e.target.value;
		const isValid = validateUrl(url);

		setIsValidUrl(url.length <= 0 ? true : isValid);
		setMediaData((prevContent) => ({ ...prevContent, url }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setMediaData((prevContent) => ({ ...prevContent, file: file }));
	};

	const handleLibraryCallback = (upload: PortalUploadType) => {
		setMediaData((prevContent) => ({ ...prevContent, url: getTxEndpoint(upload.tx) }));
		setShowMediaLibrary(false);
	};

	const alignmentButtons: AlignmentButtonType[] = [
		{ label: 'top', alignment: AlignmentEnum.ColumnReverse, icon: ICONS.alignTop },
		{ label: 'right', alignment: AlignmentEnum.Row, icon: ICONS.alignRight },
		{ label: 'bottom', alignment: AlignmentEnum.Column, icon: ICONS.alignBottom },
		{ label: 'left', alignment: AlignmentEnum.RowReverse, icon: ICONS.alignLeft },
	];

	const renderAlignmentButton = ({ label, alignment: buttonAlignment, icon }: AlignmentButtonType) => (
		<Button
			key={buttonAlignment}
			type={'alt3'}
			label={language[label]}
			handlePress={() => setMediaData((prevContent) => ({ ...prevContent, alignment: buttonAlignment }))}
			active={mediaData.alignment === buttonAlignment}
			icon={icon}
			iconLeftAlign
		/>
	);

	const handleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
		e.preventDefault();
		e.stopPropagation();
		isResizingRef.current = true;

		const startX = e.clientX;
		const startWidth = mediaRef.current?.offsetWidth || 0;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			if (!isResizingRef.current) return;

			const deltaX = moveEvent.clientX - startX;
			const newWidth =
				side === 'right'
					? Math.max(200, Math.min(startWidth + deltaX, 1200))
					: Math.max(200, Math.min(startWidth - deltaX, 1200));

			setMediaData((prevContent) => ({
				...prevContent,
				width: newWidth,
			}));
		};

		const handleMouseUp = () => {
			isResizingRef.current = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	function getInputWrapper() {
		if (showUploadConfirmation) {
			return (
				<TurboUploadConfirmation
					uploadCost={uploadCost}
					uploadDisabled={uploadDisabled}
					handleUpload={handleUpload}
					handleCancel={() => handleClear(language?.uploadCancelled)}
				/>
			);
		}

		return (
			<>
				<S.InputHeader>
					<ReactSVG src={config.icon} />
					<p>{config.label}</p>
				</S.InputHeader>
				<S.InputDescription>
					<span>{language?.mediaUploadInfo}</span>
				</S.InputDescription>
				<S.InputActions>
					<FormField
						label={language?.insertFromUrl}
						value={mediaUploaded && mediaData?.url ? mediaData.url : ''}
						onChange={(e) => handleUrlChange(e)}
						invalid={{ status: !isValidUrl, message: null }}
						disabled={false}
						hideErrorMessage
						sm
					/>
					<S.InputActionsFlex>
						<Button type={'primary'} label={language?.fromLibrary} handlePress={() => setShowMediaLibrary(true)} />
						<Button
							type={'alt1'}
							label={language?.upload}
							handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
							width={140}
						/>
					</S.InputActionsFlex>
					<input
						id={'media-file-input'}
						ref={inputRef}
						type={'file'}
						accept={config.acceptType}
						onChange={handleFileChange}
					/>
				</S.InputActions>
			</>
		);
	}

	return (
		<>
			<S.Wrapper>
				{!props.content ? (
					<S.InputWrapper className={'border-wrapper-alt2'}>
						{getInputWrapper()}
						{mediaLoading && (
							<S.InputOverlay className={'border-wrapper-primary'}>
								<Loader message={`${language?.uploadingMedia}...`} noOverlay />

								<p>This may take some time, please stay on this screen.</p>
							</S.InputOverlay>
						)}
					</S.InputWrapper>
				) : (
					<>
						<S.ContentWrapper>
							<S.Content>
								<S.MediaResizeWrapper ref={mediaRef} width={mediaData.width}>
									<S.ResizeHandle side="left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
									<div className={`portal-media-wrapper ${mediaData.alignment}`}>
										{mediaData.url && config.renderContent(mediaData.url)}
										{mediaData?.caption !== null && (
											<S.CaptionWrapper
												editMode={false}
												useColumn={
													mediaData.alignment === AlignmentEnum.Row || mediaData.alignment === AlignmentEnum.RowReverse
												}
											>
												<ContentEditable
													element={'p'}
													value={mediaData?.caption ?? ''}
													onChange={(value: string) => setMediaData({ ...mediaData, caption: value })}
													autoFocus
												/>
												<S.CaptionToolsInline editMode={false}>
													<IconButton
														type={'alt1'}
														active={false}
														src={ICONS.write}
														handlePress={() => setShowCaptionEdit(true)}
														dimensions={{ wrapper: 23.5, icon: 13.5 }}
														tooltip={language?.showMediaTools}
														tooltipPosition={'bottom-right'}
														noFocus
													/>
												</S.CaptionToolsInline>
											</S.CaptionWrapper>
										)}
									</div>
									{mediaData?.caption === null && (
										<S.CaptionEmpty>
											<p onClick={() => setMediaData({ ...mediaData, caption: '' })}>{language?.addCaption}</p>
										</S.CaptionEmpty>
									)}
									<S.ResizeHandle side="right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
								</S.MediaResizeWrapper>
							</S.Content>
						</S.ContentWrapper>
						{showCaptionEdit && (
							<Modal header={'Media Tools'} handleClose={() => setShowCaptionEdit(false)}>
								<S.ModalCaptionWrapper className={'modal-wrapper'}>
									<FormField
										value={mediaData?.caption || ''}
										onChange={(e: any) => setMediaData({ ...mediaData, caption: e.target.value })}
										label={language?.caption}
										invalid={{ status: false, message: null }}
										disabled={false}
										hideErrorMessage
									/>
									<S.ContentActionsWrapper alignment={mediaData.alignment}>
										<span>{language?.alignCaption}</span>
										<S.ContentActions useColumn={false}>{alignmentButtons.map(renderAlignmentButton)}</S.ContentActions>
									</S.ContentActionsWrapper>
									<S.ContentActionsWrapper alignment={mediaData.alignment}>
										<span>{'Size'}</span>
										<S.ContentActions useColumn={false}>
											{(['small', 'medium', 'large'] as ImageSize[]).map((key) => (
												<Button
													key={key}
													type={'alt3'}
													label={
														key === 'small'
															? language?.small ?? 'Small'
															: key === 'medium'
															? language?.medium ?? 'Medium'
															: language?.large ?? 'Large'
													}
													handlePress={() => setMediaData((prev) => ({ ...prev, width: SIZE_PRESETS[key] }))}
													active={snapWidthToPreset(mediaData.width) === key}
													iconLeftAlign
												/>
											))}
										</S.ContentActions>
									</S.ContentActionsWrapper>
									<S.ModalCaptionActionWrapper>
										<Button
											type={'primary'}
											label={language?.removeCaption}
											handlePress={() => {
												setMediaData((prevContent) => ({
													...prevContent,
													caption: null,
													alignment: AlignmentEnum.Column,
												}));
												setShowCaptionEdit(false);
											}}
											icon={ICONS.delete}
											iconLeftAlign
										/>
										<Button type={'alt1'} label={language?.done} handlePress={() => setShowCaptionEdit(false)} />
									</S.ModalCaptionActionWrapper>
								</S.ModalCaptionWrapper>
							</Modal>
						)}
					</>
				)}
			</S.Wrapper>
			<Panel
				open={showMediaLibrary}
				header={language?.mediaLibrary}
				handleClose={() => setShowMediaLibrary(false)}
				width={680}
				closeHandlerDisabled={true}
				className={'modal-wrapper'}
			>
				<MediaLibrary
					type={config.type}
					callback={(upload: PortalUploadType) => handleLibraryCallback(upload)}
					handleClose={() => setShowMediaLibrary(false)}
				/>
			</Panel>
		</>
	);
}
