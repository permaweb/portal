import React from 'react';
import { ReactSVG } from 'react-svg';
import parse from 'html-react-parser';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';

import * as S from './styles';

// TODO: Language
export default function Image(props: { content: any; onChange: any }) {
	const inputRef = React.useRef(null);

	const [content, setContent] = React.useState<{ url: string | null; caption: string | null }>(null);
	// const [imageUrl, setImageUrl] = React.useState(props.content);
	const [isValidUrl, setIsValidUrl] = React.useState(true);

	const [alignment, setAlignment] = React.useState<'row' | 'row-reverse' | 'column' | 'column-reverse'>('column');

	// React.useEffect(() => {
	// 	setContent({
	// 		url: 'https://7hl64x74lrd6ggjqq3xpz4myhe4vv2m37kf7skgjt6zinthif2ya.arweave.net/-dfuX_xcR-MZMIbu_PGYOTla6Zv6i_koyZ-yhszoLrA',
	// 		caption: null,
	// 	});
	// 	props.onChange(buildContent());
	// }, []);

	React.useEffect(() => {
		if (content && (content.url || content.caption)) {
			props.onChange(buildContent());
		}
	}, [content, alignment]);

	const validateUrl = (url: string) => {
		const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		return urlPattern.test(url);
	};

	const buildContent = React.useCallback(() => {
		if (content) {
			let alignClass = '';
			switch (alignment) {
				case 'row':
					alignClass = 'portal-image-row';
					break;
				case 'row-reverse':
					alignClass = 'portal-image-row-reverse';
					break;
				case 'column':
					alignClass = 'portal-image-column';
					break;
				case 'column-reverse':
					alignClass = 'portal-image-column-reverse';
					break;
				default:
					break;
			}

			return `
				<div class="portal-image-wrapper ${alignClass}">
					<img src="${content.url}"/>
					<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor, Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
				</div>
			`;
		}
		return '';
	}, [content, alignment]);

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const url = e.target.value;
		setContent({ url: url, ...content });

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
				setContent({ url: url, ...content });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<S.Wrapper>
			{!props.content ? (
				<S.InputWrapper className={'border-wrapper-alt2'}>
					<S.InputHeader>
						<ReactSVG src={ASSETS.image} />
						<p>Image</p>
					</S.InputHeader>
					<S.InputDescription>
						<span>Upload an image or insert from a URL</span>
					</S.InputDescription>
					<S.InputActions>
						<Button
							type={'alt1'}
							label={'Upload'}
							handlePress={() => (inputRef && inputRef.current ? inputRef.current.click() : {})}
							width={150}
						/>
						<S.InputActionsDivider>
							<span>or</span>
						</S.InputActionsDivider>
						<FormField
							label={'Insert from URL'}
							value={content && content.url ? content.url : ''}
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
				<S.ContentWrapper>
					<S.Content>{parse(props.content)}</S.Content>
					<S.ContentActionsWrapper className={'fade-in border-wrapper-alt4'}>
						<span>Align caption</span>
						<S.ContentActions>
							<Button
								type={'primary'}
								label={'Top'}
								handlePress={() => setAlignment('column-reverse')}
								active={alignment === 'column-reverse'}
								icon={ASSETS.alignTop}
								iconLeftAlign
							/>
							<Button
								type={'primary'}
								label={'Right'}
								handlePress={() => setAlignment('row')}
								active={alignment === 'row'}
								icon={ASSETS.alignRight}
								iconLeftAlign
							/>
							<Button
								type={'primary'}
								label={'Bottom'}
								handlePress={() => setAlignment('column')}
								active={alignment === 'column'}
								icon={ASSETS.alignBottom}
								iconLeftAlign
							/>
							<Button
								type={'primary'}
								label={'Left'}
								handlePress={() => setAlignment('row-reverse')}
								active={alignment === 'row-reverse'}
								icon={ASSETS.alignLeft}
								iconLeftAlign
							/>
						</S.ContentActions>
					</S.ContentActionsWrapper>
				</S.ContentWrapper>
			)}
		</S.Wrapper>
	);
}
