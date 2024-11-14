import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { Modal } from 'components/molecules/Modal';
import { ASSETS } from 'helpers/config';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

enum AlignmentEnum {
	Row = 'portal-image-row',
	RowReverse = 'portal-image-row-reverse',
	Column = 'portal-image-column',
	ColumnReverse = 'portal-image-column-reverse',
}

interface AlignmentButton {
	label: string;
	alignment: AlignmentEnum;
	icon: string;
}

// TODO: Language
export default function Image(props: { content: any; data: any; onChange: any }) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef(null);

	const [mediaData, setMediaData] = React.useState<{ url: string | null; caption: string | null }>({
		url: null,
		caption: null,
	});
	const [showCaptionEdit, setShowCaptionEdit] = React.useState<boolean>(false);
	const [showCaptionTools, setShowCaptionTools] = React.useState<boolean>(true);
	// const [imageUrl, setImageUrl] = React.useState(props.content);
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

	const validateUrl = (url: string) => {
		const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		return urlPattern.test(url);
	};

	const buildContent = React.useCallback(() => {
		if (mediaData?.url) {
			return `
				<div class="portal-image-wrapper ${alignment}">
					<img src="${mediaData.url}"/>
					${mediaData.caption ? `<p>${mediaData.caption}</p>` : ''}
				</div>
			`;
		}
		return '';
	}, [mediaData, alignment]);

	React.useEffect(() => {
		if (props.data && props.data !== mediaData) {
			setMediaData(props.data);
		}
	}, [props.data]);

	React.useEffect(() => {
		if (mediaData?.url) props.onChange(buildContent(), mediaData);
	}, [mediaData, alignment, buildContent]);

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const url = e.target.value;
		setMediaData((prevContent) => ({ ...prevContent, url }));

		// setImageUrl(url);
		// setIsValidUrl(validateUrl(url));
		// if (validateUrl(url)) {
		// 	props.onChange(buildContent(url));
		// }

		// if (url.length <= 0) {
		// 	setIsValidUrl(true);
		// }
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const url = event.target?.result as string;
				// setImageUrl(url);
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

	const captionToolWidth = alignment === AlignmentEnum.Row || alignment === AlignmentEnum.RowReverse ? 140 : null;

	const renderAlignmentButton = ({ label, alignment: buttonAlignment, icon }: AlignmentButton) => (
		<Button
			key={buttonAlignment}
			type={'alt3'}
			label={language[label]}
			handlePress={() => setAlignment(buttonAlignment)}
			active={alignment === buttonAlignment}
			icon={icon}
			iconLeftAlign
			width={captionToolWidth}
		/>
	);

	return (
		<S.Wrapper>
			{!props.content ? (
				<S.InputWrapper className={'border-wrapper-alt2'}>
					<S.InputHeader>
						<ReactSVG src={ASSETS.image} />
						<p>{language.image}</p>
					</S.InputHeader>
					<S.InputDescription>
						<span>{language.imageUploadInfo}</span>
					</S.InputDescription>
					<S.InputActions>
						<Button
							type={'alt1'}
							label={language.upload}
							handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
							width={150}
						/>
						<S.InputActionsDivider>
							<span>{language.or}</span>
						</S.InputActionsDivider>
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
							id={'image-file-input'}
							ref={inputRef}
							type={'file'}
							accept={'image/*'}
							onChange={handleFileChange}
						/>
					</S.InputActions>
				</S.InputWrapper>
			) : (
				<>
					<S.ContentWrapper>
						<S.Content>
							<div className={`portal-image-wrapper ${alignment}`}>
								<img src={mediaData.url} />
								{mediaData?.caption !== null && (
									<S.CaptionWrapper>
										<ContentEditable
											element={'p'}
											value={mediaData?.caption ?? ''}
											onChange={(value: string) => setMediaData({ ...mediaData, caption: value })}
											autoFocus
										/>
										{showCaptionTools && (
											<S.ContentActionsWrapper alignment={alignment} className={'fade-in border-wrapper-primary'}>
												<span>{language.alignCaption}</span>
												<S.ContentActions
													useColumn={alignment === AlignmentEnum.Row || alignment === AlignmentEnum.RowReverse}
												>
													{alignmentButtons.map(renderAlignmentButton)}
												</S.ContentActions>
												<S.ContentActionsEnd
													useColumn={alignment === AlignmentEnum.Row || alignment === AlignmentEnum.RowReverse}
												>
													<Button
														type={'alt3'}
														label={'Hide tools'}
														handlePress={() => setShowCaptionTools(false)}
														width={captionToolWidth}
													/>
													<Button
														type={'alt3'}
														label={'Delete caption'}
														handlePress={() => setMediaData({ ...mediaData, caption: null })}
														width={captionToolWidth}
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
	);
}
