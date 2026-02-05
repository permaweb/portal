import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { PortalUserType } from 'helpers/types';
import { urlify } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function ArticlePostURL() {
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showForm, setShowForm] = React.useState<boolean>(false);
	const [urlValue, setUrlValue] = React.useState<string>(currentPost.data?.url || '');

	const handleCurrentPostUpdate = React.useCallback(
		(updatedField: { field: string; value: any }) => {
			dispatch(currentPostUpdate(updatedField));
		},
		[dispatch]
	);

	React.useEffect(() => {
		setUrlValue(currentPost.data?.url || '');
	}, [currentPost.data?.url]);

	// Generate URL on every title change for new posts only
	React.useEffect(() => {
		// Only generate URL for new posts when:
		// 1. No assetId (new post - post doesn't exist yet)
		// 2. Title exists
		// Regenerate on every title change for new posts (every character typed)
		if (!assetId && currentPost.data?.title) {
			const generatedUrl = urlify(currentPost.data.title);
			setUrlValue(generatedUrl);
			handleCurrentPostUpdate({ field: 'url', value: generatedUrl });
		}
	}, [assetId, currentPost.data?.title, handleCurrentPostUpdate]);

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUrlValue(value);
		handleCurrentPostUpdate({ field: 'url', value: urlify(value) });
	};

	/* If a contributor visits a post that they did not create, then disable updates */
	const currentUser = portalProvider.current?.users?.find(
		(user: PortalUserType) => user.address === permawebProvider.profile?.id
	);

	const submitUnauthorized =
		assetId && currentUser?.address !== currentPost.data?.creator && !portalProvider.permissions?.postAutoIndex;
	const requestUnauthorized = !portalProvider.permissions?.updatePostRequestStatus;
	const urlDisabled = requestUnauthorized || submitUnauthorized || currentPost.editor.loading.active;

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<p>
					<span className={'post-url-info'}>{`${language.url}:`}</span> {currentPost.data?.url || '-'}
				</p>
				<CloseHandler active={showForm} disabled={!showForm} callback={() => setShowForm(false)}>
					<IconButton
						type={'primary'}
						handlePress={() => setShowForm((prev) => !prev)}
						src={showForm ? ICONS.close : ICONS.write}
						disabled={urlDisabled}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={showForm ? null : language.edit}
					/>
					{showForm && (
						<S.Form>
							<FormField
								value={urlValue}
								onChange={handleUrlChange}
								invalid={{ status: false, message: null }}
								disabled={urlDisabled}
								placeholder={language.enterUrl || 'Enter URL'}
								autoFocus={true}
							/>
						</S.Form>
					)}
				</CloseHandler>
			</S.HeaderWrapper>
		</S.Wrapper>
	);
}
