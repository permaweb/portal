import React from 'react';
import { ReactSVG } from 'react-svg';

import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const ALLOWED_THUMBNAIL_TYPES = 'image/png, image/jpeg, image/gif';

// TODO
export default function ArticleToolbarPostThumbnail() {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<any>(null);

	const [thumbnail, setThumbnail] = React.useState<any>(null);
	const [loading, _setLoading] = React.useState<boolean>(false);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'thumbnail':
								setThumbnail(event.target.result);
								break;
							default:
								break;
						}
					}
				};

				reader.readAsDataURL(file);
			}
			e.target.value = '';
		}
	}

	function getInputWrapper() {
		if (thumbnail) return <img src={checkValidAddress(thumbnail) ? getTxEndpoint(thumbnail) : thumbnail} />;
		return (
			<>
				<ReactSVG src={ASSETS.image} />
				<span>{language.uploadThumbnail}</span>
			</>
		);
	}

	return (
		<S.Wrapper>
			<S.InputWrapper>
				<S.Input hasInput={thumbnail !== null} onClick={() => inputRef.current.click()} disabled={loading}>
					{getInputWrapper()}
				</S.Input>
				<input
					ref={inputRef}
					type={'file'}
					onChange={(e: any) => handleFileChange(e, 'thumbnail')}
					disabled={loading}
					accept={ALLOWED_THUMBNAIL_TYPES}
				/>
			</S.InputWrapper>
		</S.Wrapper>
	);
}
