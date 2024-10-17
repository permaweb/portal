import React from 'react';
import { ReactSVG } from 'react-svg';
import parse from 'html-react-parser';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { ASSETS } from 'helpers/config';

import * as S from './styles';

export default function Image(props: { content: any; onChange: any }) {
	const inputRef = React.useRef(null);

	const [imageUrl, setImageUrl] = React.useState(props.content);
	const [isValidUrl, setIsValidUrl] = React.useState(true);

	const validateUrl = (url: string) => {
		const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
		return urlPattern.test(url);
	};

	function buildContent(data: any) {
		return `
			<div class="portal-image-wrapper portal-image-column">
				<img src="${data}"/>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor, Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
			</div>
		`;
	}

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const url = e.target.value;
		setImageUrl(url);
		setIsValidUrl(validateUrl(url));
		if (validateUrl(url)) {
			props.onChange(buildContent(url));
		}

		if (url.length <= 0) {
			setIsValidUrl(true);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const dataUrl = event.target?.result as string;
				setImageUrl(dataUrl);
				props.onChange(buildContent(dataUrl));
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
							value={imageUrl}
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
				<S.Content>{parse(props.content)}</S.Content>
			)}
		</S.Wrapper>
	);
}
