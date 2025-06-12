import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { Notification } from 'components/atoms/Notification';
import { ASSETS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { NotificationType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import * as S from './styles';

const ALLOWED_THUMBNAIL_TYPES = 'image/png, image/jpeg, image/gif';

export default function ArticleToolbarPostThumbnail() {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const inputRef = React.useRef<any>(null);

	const [loading, _setLoading] = React.useState<boolean>(false);
	const [response, setResponse] = React.useState<NotificationType | null>(null);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
		setResponse({ status: 'success', message: `${language.thumbnailUpdated}!` });
	};

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail') {
		if (e.target.files && e.target.files.length) {
			const file = e.target.files[0];
			if (file.type.startsWith('image/')) {
				const reader = new FileReader();

				reader.onload = (event: ProgressEvent<FileReader>) => {
					if (event.target?.result) {
						switch (type) {
							case 'thumbnail':
								handleCurrentPostUpdate({ field: 'thumbnail', value: event.target.result });
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
		if (currentPost?.data?.thumbnail)
			return (
				<img
					src={
						checkValidAddress(currentPost?.data?.thumbnail)
							? getTxEndpoint(currentPost?.data?.thumbnail)
							: currentPost?.data?.thumbnail
					}
				/>
			);
		return (
			<>
				<ReactSVG src={ASSETS.image} />
				<span>{language.uploadThumbnail}</span>
			</>
		);
	}

	return (
		<>
			<S.Wrapper>
				<S.InputWrapper>
					<S.Input
						hasInput={!!currentPost?.data?.thumbnail}
						onClick={() => inputRef.current.click()}
						disabled={loading}
					>
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
				<S.FooterWrapper>
					<Button
						type={'alt2'}
						label={language.remove}
						handlePress={() => handleCurrentPostUpdate({ field: 'thumbnail', value: null })}
						disabled={!currentPost?.data?.thumbnail}
						loading={false}
						icon={ASSETS.delete}
						iconLeftAlign
						warning
					/>
				</S.FooterWrapper>
			</S.Wrapper>
			{response && (
				<Notification type={response.status} message={response.message} callback={() => setResponse(null)} />
			)}
		</>
	);
}
