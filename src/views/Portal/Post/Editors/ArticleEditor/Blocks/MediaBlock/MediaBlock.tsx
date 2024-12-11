import React from 'react';
import { ReactSVG } from 'react-svg';

import { addToZone, globalLog, mapToProcessCase, resolveTransaction } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { Notification } from 'components/atoms/Notification';
import { Panel } from 'components/atoms/Panel';
import { MediaLibrary } from 'components/organisms/MediaLibrary';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import {
	AlignmentButtonType,
	AlignmentEnum,
	MediaConfigType,
	NotificationType,
	PortalUploadOptionType,
	PortalUploadType,
} from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

export default function MediaBlock(props: { type: 'image' | 'video'; content: any; data: any; onChange: any }) {
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

	const config = mediaConfig[props.type];

	const inputRef = React.useRef(null);

	const [mediaData, setMediaData] = React.useState<{
		url: string | null;
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

	React.useEffect(() => {
		if (props.data && props.data !== mediaData) {
			setMediaData(props.data);
		}
	}, [props.data]);

	const [mediaUploaded, setMediaUploaded] = React.useState<boolean>(false);
	const [mediaLoading, setMediaLoading] = React.useState<boolean>(false);
	const [uploadResponse, setUploadResponse] = React.useState<NotificationType | null>(null);

	React.useEffect(() => {
		(async function () {
			if (
				mediaData?.url &&
				validateUrl(mediaData.url) &&
				mediaData.url.startsWith('data:image/') &&
				!mediaUploaded &&
				portalProvider.current?.id &&
				arProvider.wallet
			) {
				setMediaLoading(true);
				try {
					const tx = await resolveTransaction(mediaData.url);

					const mediaUpdateId = await addToZone(
						{
							path: 'Uploads',
							data: mapToProcessCase({ tx: tx, type: props.type, dateUploaded: Date.now().toString() }),
						},
						portalProvider.current.id,
						arProvider.wallet
					);

					globalLog(`Media update: ${mediaUpdateId}`);

					setMediaData((prevContent) => ({ ...prevContent, url: getTxEndpoint(tx) }));
					setMediaUploaded(true);
					setUploadResponse({ status: 'success', message: `${language.mediaUploaded}!` });
				} catch (e: any) {
					setUploadResponse({ status: 'warning', message: e.message ?? 'Error uploading media' });
					setMediaData((prevContent) => ({ ...prevContent, url: null }));
				}
				setMediaLoading(false);
			}
		})();
	}, [mediaData, portalProvider.current?.id, arProvider.wallet]);

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

	const validateUrl = (url: string) => {
		if (url.startsWith('data:image/')) {
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
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const url = event.target?.result as string;
				setMediaData((prevContent) => ({ ...prevContent, url }));
			};
			reader.readAsDataURL(file);
		}
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

	return (
		<>
			<S.Wrapper>
				{!props.content ? (
					<S.InputWrapper className={'border-wrapper-alt2'}>
						<S.InputHeader>
							<ReactSVG src={config.icon} />
							<p>{config.label}</p>
						</S.InputHeader>
						<S.InputDescription>
							<span>{language.mediaUploadInfo}</span>
						</S.InputDescription>
						<S.InputActions>
							<FormField
								label={language.insertFromUrl}
								value={mediaData?.url ?? ''}
								onChange={(e) => handleUrlChange(e)}
								invalid={{ status: !isValidUrl, message: null }}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<S.InputActionsFlex>
								<Button
									type={'alt1'}
									label={language.upload}
									handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
									width={140}
								/>
								<Button type={'primary'} label={language.fromLibrary} handlePress={() => setShowMediaLibrary(true)} />
							</S.InputActionsFlex>
							<input
								id={'media-file-input'}
								ref={inputRef}
								type={'file'}
								accept={config.acceptType}
								onChange={handleFileChange}
							/>
						</S.InputActions>
						{mediaLoading && (
							<S.InputOverlay className={'border-wrapper-primary'}>
								<p>{`${language.uploadingMedia}...`}</p>
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
													tooltip={language.showCaptionTools}
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
									<p onClick={() => setMediaData({ ...mediaData, caption: '' })}>{language.addCaption}</p>
								</S.CaptionEmpty>
							)}
						</S.ContentWrapper>
						{showCaptionEdit && (
							<Modal header={language.editCaption} handleClose={() => setShowCaptionEdit(false)}>
								<S.ModalCaptionWrapper className={'modal-wrapper'}>
									<FormField
										value={mediaData?.caption || ''}
										onChange={(e: any) => setMediaData({ ...mediaData, caption: e.target.value })}
										label={language.caption}
										invalid={{ status: false, message: null }}
										disabled={false}
										hideErrorMessage
									/>
									<S.ContentActionsWrapper alignment={mediaData.alignment}>
										<span>{language.alignCaption}</span>
										<S.ContentActions useColumn={false}>{alignmentButtons.map(renderAlignmentButton)}</S.ContentActions>
									</S.ContentActionsWrapper>
									<S.ModalCaptionActionWrapper>
										<Button
											type={'primary'}
											label={language.removeCaption}
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
										<Button type={'alt1'} label={language.done} handlePress={() => setShowCaptionEdit(false)} />
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
				header={language.mediaLibrary}
				handleClose={() => setShowMediaLibrary(false)}
				width={690}
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
