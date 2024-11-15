import React from 'react';
import { ReactSVG } from 'react-svg';

import { buildStoreNamespace, resolveTransaction, updateZone } from '@permaweb/libs';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { Notification } from 'components/atoms/Notification';
import { Modal } from 'components/molecules/Modal';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';

import * as S from './styles';

enum AlignmentEnum {
	Row = 'portal-image-row',
	RowReverse = 'portal-image-row-reverse',
	Column = 'portal-image-column',
	ColumnReverse = 'portal-image-column-reverse',
}

type AlignmentButton = {
	label: string;
	alignment: AlignmentEnum;
	icon: string;
};

type MediaConfig = {
	icon: string;
	label: string;
	renderContent: (url: string) => JSX.Element;
};

const mediaConfig: Record<'image' | 'video', MediaConfig> = {
	image: {
		icon: ASSETS.image,
		label: 'Image',
		renderContent: (url) => <img src={url} alt="Uploaded media" />,
	},
	video: {
		icon: ASSETS.video,
		label: 'Video',
		renderContent: (url) => <video controls src={url} />,
	},
};

// TODO: Language
// TODO: Hide align actions on tablet / mobile (840px)
// TODO: Select from media library
// TODO: Alignment resetting on rerender
export default function MediaBlock(props: { type: 'image' | 'video'; content: any; data: any; onChange: any }) {
	const arProvider = useArweaveProvider();

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const config = mediaConfig[props.type];

	const inputRef = React.useRef(null);

	const [mediaData, setMediaData] = React.useState<{ url: string | null; caption: string | null }>({
		url: null,
		caption: null,
	});
	const [showCaptionEdit, setShowCaptionEdit] = React.useState<boolean>(false);
	const [showCaptionTools, setShowCaptionTools] = React.useState<boolean>(true);

	const [isValidUrl, setIsValidUrl] = React.useState(true);

	const [alignment, setAlignment] = React.useState<AlignmentEnum>(AlignmentEnum.Column);

	// React.useEffect(() => {
	// 	setMediaData({
	// 		url: 'https://7hl64x74lrd6ggjqq3xpz4myhe4vv2m37kf7skgjt6zinthif2ya.arweave.net/-dfuX_xcR-MZMIbu_PGYOTla6Zv6i_koyZ-yhszoLrA',
	// 		caption: null,
	// 	});
	// 	props.onChange(buildContent());
	// }, []);

	// console.log(mediaData);

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

					const mediaUpdateId = await updateZone(
						{
							[buildStoreNamespace('upload', tx)]: { src: tx, type: 'image', dateUploaded: Date.now().toString() },
						},
						portalProvider.current.id,
						arProvider.wallet
					);

					console.log(`Media update: ${mediaUpdateId}`);

					setMediaData((prevContent) => ({ ...prevContent, url: getTxEndpoint(tx) }));
					setMediaUploaded(true);
					setUploadResponse({ status: 'success', message: 'Media uploaded!' });
				} catch (e: any) {
					setUploadResponse({ status: 'warning', message: e.message ?? 'Error uploading media' });
					setMediaData((prevContent) => ({ ...prevContent, url: null }));
				}
				setMediaLoading(false);
			}
		})();
	}, [mediaData]);

	React.useEffect(() => {
		if (mediaData?.url && validateUrl(mediaData.url) && mediaData.url.startsWith('https://'))
			props.onChange(buildContent(mediaData, alignment), mediaData);
	}, [mediaData, alignment]);

	function buildContent(data: any, alignClass: string) {
		return `
			<div class="portal-image-wrapper ${alignClass}">
				<img src="${data.url}"/>
				${data.caption ? `<p>${data.caption}</p>` : ''}
			</div>
		`;
	}

	const validateUrl = (url: string) => {
		if (url.startsWith('data:image/')) {
			return true;
		}
		const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
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

	const alignmentButtons: AlignmentButton[] = [
		{ label: 'top', alignment: AlignmentEnum.ColumnReverse, icon: ASSETS.alignTop },
		{ label: 'right', alignment: AlignmentEnum.Row, icon: ASSETS.alignRight },
		{ label: 'bottom', alignment: AlignmentEnum.Column, icon: ASSETS.alignBottom },
		{ label: 'left', alignment: AlignmentEnum.RowReverse, icon: ASSETS.alignLeft },
	];

	const renderAlignmentButton = ({ label, alignment: buttonAlignment, icon }: AlignmentButton) => (
		<Button
			key={buttonAlignment}
			type={'alt3'}
			label={language[label]}
			handlePress={() => setAlignment(buttonAlignment)}
			active={alignment === buttonAlignment}
			icon={icon}
			iconLeftAlign
			width={140}
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
							<Button
								type={'alt1'}
								label={language.upload}
								handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
								height={41.5}
								width={140}
							/>
							<Button
								type={'primary'}
								label={'From library'}
								handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
								height={41.5}
								width={150}
							/>
							<FormField
								label={language.insertFromUrl}
								value={mediaData?.url ?? ''}
								onChange={(e) => handleUrlChange(e)}
								invalid={{ status: !isValidUrl, message: null }}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<input
								id={'media-file-input'}
								ref={inputRef}
								type={'file'}
								accept={props.type === 'image' ? 'image/*' : 'video/*'}
								onChange={handleFileChange}
							/>
						</S.InputActions>
						{mediaLoading && (
							<S.InputOverlay className={'border-wrapper-primary'}>
								<p>Uploading media...</p>
							</S.InputOverlay>
						)}
					</S.InputWrapper>
				) : (
					<>
						<S.ContentWrapper>
							<S.Content>
								<div className={`portal-image-wrapper ${alignment}`}>
									{mediaData.url && config.renderContent(mediaData.url)}
									{mediaData?.caption !== null && (
										<S.CaptionWrapper
											editMode={showCaptionTools}
											useColumn={alignment === AlignmentEnum.Row || alignment === AlignmentEnum.RowReverse}
										>
											<ContentEditable
												element={'p'}
												value={mediaData?.caption ?? ''}
												onChange={(value: string) => setMediaData({ ...mediaData, caption: value })}
												autoFocus
											/>
											{showCaptionTools && (
												<S.ContentActionsWrapper alignment={alignment} className={'fade-in border-wrapper-primary'}>
													<span>{language.alignCaption}</span>
													<S.ContentActions useColumn={true}>
														{alignmentButtons.map(renderAlignmentButton)}
													</S.ContentActions>
													<S.ContentActionsEnd useColumn={true}>
														<Button
															type={'alt3'}
															label={'Hide tools'}
															handlePress={() => setShowCaptionTools(false)}
															width={140}
														/>
														<Button
															type={'alt3'}
															label={'Delete caption'}
															handlePress={() => {
																setMediaData({ ...mediaData, caption: null });
																setAlignment(AlignmentEnum.Column);
															}}
															width={140}
														/>
													</S.ContentActionsEnd>
												</S.ContentActionsWrapper>
											)}
											{!showCaptionTools && (
												<S.CaptionToolsAction>
													<Button
														type={'alt3'}
														label={'Show caption tools'}
														handlePress={() => setShowCaptionTools(true)}
													/>
												</S.CaptionToolsAction>
											)}
										</S.CaptionWrapper>
									)}
								</div>
							</S.Content>
							{mediaData?.caption === null && (
								<S.CaptionEmpty>
									<p onClick={() => setMediaData({ ...mediaData, caption: '' })}>Add a caption</p>
								</S.CaptionEmpty>
							)}
						</S.ContentWrapper>
						{showCaptionEdit && (
							<Modal header={'Add a caption'} handleClose={() => setShowCaptionEdit(false)}>
								<S.ModalCaptionWrapper className={'modal-wrapper'}>
									<FormField
										value={mediaData?.caption || ''}
										onChange={(e: any) => setMediaData({ ...mediaData, caption: e.target.value })}
										label={'Caption'}
										invalid={{ status: false, message: null }}
										disabled={false}
										hideErrorMessage
									/>
									<S.ModalCaptionActionWrapper>
										<Button type={'alt1'} label={'Done'} handlePress={() => setShowCaptionEdit(false)} />
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
		</>
	);
}
