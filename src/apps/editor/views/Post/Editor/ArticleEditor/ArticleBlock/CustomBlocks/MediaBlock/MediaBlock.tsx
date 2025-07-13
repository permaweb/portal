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
import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/atoms/Panel';
import { TurboUploadConfirmation } from 'components/molecules/TurboUploadConfirmation';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import {
	AlignmentButtonType,
	AlignmentEnum,
	MediaConfigType,
	PortalUploadOptionType,
	PortalUploadType,
} from 'helpers/types';
import { useUploadCost } from 'hooks/useUploadCost';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function MediaBlock(props: { type: 'image' | 'video'; content: any; data: any; onChange: any }) {
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];
	const { uploadCost, showUploadConfirmation, uploadResponse, setUploadResponse, calculateUploadCost, clearUploadState } = useUploadCost();

	const mediaConfig: Record<PortalUploadOptionType, MediaConfigType> = {
		image: {
			type: 'image',
			icon: ASSETS.image,
			label: language?.image,
			renderContent: (url) => <img src={url} />,
			acceptType: 'image/*',
		},
		video: {
			type: 'video',
			icon: ASSETS.video,
			label: language?.video,
			renderContent: (url) => <video controls src={url} />,
			acceptType: 'video/*',
		},
	};

	const config = mediaConfig[props.type];

	const inputRef = React.useRef(null);

	const [mediaData, setMediaData] = React.useState<{
		url?: string | null;
		file?: File | null;
		caption: string | null;
		alignment: AlignmentEnum | null;
	}>({
		url: null,
		caption: null,
		alignment: AlignmentEnum.Column,
	});
	const [showCaptionEdit, setShowCaptionEdit] = React.useState<boolean>(false);
	const [showMediaLibrary, setShowMediaLibrary] = React.useState<boolean>(false);
	const [isValidUrl, setIsValidUrl] = React.useState(true);

	const [mediaUploaded, setMediaUploaded] = React.useState<boolean>(false);
	const [mediaLoading, setMediaLoading] = React.useState<boolean>(false);
	const [uploadDisabled, setUploadDisabled] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (props.data && props.data !== mediaData) {
			setMediaData(props.data);
		}
	}, [props.data]);
	
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
		if (mediaData?.url && validateUrl(mediaData.url) && mediaData.url.startsWith('https://'))
			props.onChange(buildContent(mediaData), mediaData);
	}, [mediaData]);

	function buildContent(data: any) {
		return `
			<div class="portal-media-wrapper ${data.alignment}">
				<img src="${data.url}"/>
				${data.caption ? `<p>${data.caption}</p>` : ''}
			</div>
		`;
	}

	async function handleUpload() {
		setMediaLoading(true);
		try {
			const tx = await permawebProvider.libs.resolveTransaction(mediaData.file);

			if (portalProvider.permissions?.updatePortalMeta) {
				const mediaUpdateId = await permawebProvider.libs.addToZone(
					{
						path: 'Uploads',
						data: permawebProvider.libs.mapToProcessCase({
							tx: tx,
							type: props.type,
							dateUploaded: Date.now().toString(),
						}),
					},
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Media update: ${mediaUpdateId}`);
			}

			setMediaData((prevContent) => ({ ...prevContent, url: getTxEndpoint(tx) }));
			setMediaUploaded(true);
			setUploadResponse({ status: 'success', message: `${language?.mediaUploaded}!` });
		} catch (e: any) {
			handleClear(e.message ?? 'Error uploading media');
		}
		setMediaLoading(false);
	}

	function handleClear(message: string) {
		setUploadResponse({ status: 'warning', message: message });
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
		{ label: 'top', alignment: AlignmentEnum.ColumnReverse, icon: ASSETS.alignTop },
		{ label: 'right', alignment: AlignmentEnum.Row, icon: ASSETS.alignRight },
		{ label: 'bottom', alignment: AlignmentEnum.Column, icon: ASSETS.alignBottom },
		{ label: 'left', alignment: AlignmentEnum.RowReverse, icon: ASSETS.alignLeft },
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

	function getInputWrapper() {
		if (showUploadConfirmation) {
			return (
				<TurboUploadConfirmation
					uploadCost={uploadCost}
					uploadDisabled={uploadDisabled}
					handleUpload={handleUpload}
					handleCancel={() => handleClear(language?.uploadCancelled)}
				/>
			)
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
													src={ASSETS.write}
													handlePress={() => setShowCaptionEdit(true)}
													dimensions={{ wrapper: 23.5, icon: 13.5 }}
													tooltip={language?.showCaptionTools}
													tooltipPosition={'bottom-right'}
													noFocus
												/>
											</S.CaptionToolsInline>
										</S.CaptionWrapper>
									)}
								</div>
							</S.Content>
							{mediaData?.caption === null && (
								<S.CaptionEmpty>
									<p onClick={() => setMediaData({ ...mediaData, caption: '' })}>{language?.addCaption}</p>
								</S.CaptionEmpty>
							)}
						</S.ContentWrapper>
						{showCaptionEdit && (
							<Modal header={language?.editCaption} handleClose={() => setShowCaptionEdit(false)}>
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
											icon={ASSETS.delete}
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
			{uploadResponse && (
				<Notification
					type={uploadResponse.status}
					message={uploadResponse.message}
					callback={() => setUploadResponse(null)}
				/>
			)}
			<Panel
				open={showMediaLibrary}
				header={language?.mediaLibrary}
				handleClose={() => setShowMediaLibrary(false)}
				width={680}
				closeHandlerDisabled={true}
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
