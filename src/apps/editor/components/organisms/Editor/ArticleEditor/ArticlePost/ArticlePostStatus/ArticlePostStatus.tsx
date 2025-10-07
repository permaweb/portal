import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { ArticleStatusEnum, PortalUserType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function ArticlePostStatus() {
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	/* If a contributor visits a post that they did not create, then disable updates */
	const currentUser = portalProvider.current?.users?.find(
		(user: PortalUserType) => user.address === permawebProvider.profile?.id
	);

	const submitUnauthorized =
		assetId && currentUser?.address !== currentPost.data?.creator && !portalProvider.permissions?.postAutoIndex;
	const requestUnauthorized = !portalProvider.permissions?.updatePostRequestStatus;
	const statusDisabled = requestUnauthorized || submitUnauthorized || currentPost.editor.loading.active;

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<p>
					<span className={'post-status-info'}>{`${language.status}:`}</span> {capitalize(currentPost?.data?.status)}
					<S.StatusIndicator status={currentPost?.data?.status} />
				</p>
				<IconButton
					type={'primary'}
					handlePress={() => setShowDropdown(true)}
					src={ICONS.write}
					disabled={statusDisabled}
					dimensions={{ wrapper: 23.5, icon: 13.5 }}
					tooltip={language.edit}
				/>
			</S.HeaderWrapper>
			{showDropdown && (
				<CloseHandler active={showDropdown} disabled={!showDropdown} callback={() => setShowDropdown(false)}>
					<S.Dropdown className="border-wrapper-alt1 scroll-wrapper-hidden">
						{Object.values(ArticleStatusEnum).map((status: ArticleStatusEnum, index: number) => (
							<S.Option
								active={status === currentPost?.data?.status}
								key={index}
								onClick={() => {
									if (status !== currentPost?.data?.status) {
										handleCurrentPostUpdate({ field: 'status', value: status });
									}
									setShowDropdown(false);
								}}
							>
								{capitalize(status)}
							</S.Option>
						))}
					</S.Dropdown>
				</CloseHandler>
			)}
		</S.Wrapper>
	);
}
