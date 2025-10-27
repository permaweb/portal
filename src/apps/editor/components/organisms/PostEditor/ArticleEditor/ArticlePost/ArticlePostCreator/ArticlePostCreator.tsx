import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { PortalUserType } from 'helpers/types';
import { checkValidAddress, formatAddress } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';

export default function ArticlePostCreator() {
	const { assetId } = useParams<{ assetId?: string }>();

	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);
	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [usersFetched, setUsersFetched] = React.useState<{ [address: string]: boolean }>({});
	const [showDropdown, setShowDropdown] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (!assetId && !currentPost.data?.creator && permawebProvider.profile?.id) {
			dispatch(currentPostUpdate({ field: 'creator', value: permawebProvider.profile.id }));
		}
	}, [currentPost.data?.creator, permawebProvider.profile.id]);

	React.useEffect(() => {
		(async function () {
			if (
				currentPost.data?.creator &&
				checkValidAddress(currentPost.data?.creator) &&
				!usersFetched[currentPost.data.creator] &&
				currentPost.data.creator !== portalProvider.current?.id
			) {
				portalProvider.fetchPortalUserProfile({ address: currentPost.data.creator });
				setUsersFetched((prev) => ({ ...prev, [currentPost.data.creator]: true }));
			}
		})();
	}, [currentPost.data?.creator, portalProvider.current?.id, usersFetched]);

	React.useEffect(() => {
		(async function () {
			if (portalProvider.current?.users) {
				portalProvider.current.users.forEach((user: PortalUserType) => {
					if (!usersFetched[user.address] && user.type !== 'wallet') {
						portalProvider.fetchPortalUserProfile(user);
						setUsersFetched((prev) => ({ ...prev, [user.address]: true }));
					}
				});
			}
		})();
	}, [portalProvider.current?.users, usersFetched]);

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
	const creatorDisabled = requestUnauthorized || submitUnauthorized || currentPost.editor.loading.active;

	const creator =
		currentPost.data.creator === portalProvider.current?.id
			? {
					name: portalProvider.current?.name,
			  }
			: portalProvider.usersByPortalId?.[currentPost.data.creator] ?? { id: currentPost.data.creator };

	const authors = React.useMemo(() => {
		const authorsList: string[] = [];
		portalProvider.current?.users
			?.filter((user: PortalUserType) => user.type !== 'wallet')
			.forEach((user: PortalUserType) => {
				if (
					!authorsList.includes(user.address) &&
					portalProvider.usersByPortalId?.[user.address]?.['owner'] === arProvider.walletAddress
				) {
					authorsList.push(user.address);
				}
			});
		return authorsList;
	}, [portalProvider.current, portalProvider.current?.users]);

	return (
		<S.Wrapper>
			<S.HeaderWrapper>
				<p>
					<span className={'post-creator-info'}>{`${language.author}:`}</span>{' '}
					{creator?.name ?? creator?.username ?? '-'}
				</p>
				<CloseHandler active={showDropdown} disabled={!showDropdown} callback={() => setShowDropdown(false)}>
					<IconButton
						type={'primary'}
						handlePress={() => setShowDropdown((prev) => !prev)}
						src={showDropdown ? ICONS.close : ICONS.write}
						disabled={creatorDisabled}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={showDropdown ? null : language.edit}
					/>
					{showDropdown && (
						<S.Dropdown className={'border-wrapper-alt1 scroll-wrapper-hidden'}>
							{authors.map((address: string, index: number) => {
								const userProfile = portalProvider.usersByPortalId?.[address] ?? { id: address };
								return (
									<S.Option
										active={address === currentPost?.data?.creator}
										key={index}
										onClick={() => {
											if (address !== currentPost?.data?.creator) {
												handleCurrentPostUpdate({ field: 'creator', value: address });
											}
											setShowDropdown(false);
										}}
									>
										{userProfile.username ?? formatAddress(userProfile.id, false)}
									</S.Option>
								);
							})}
							<S.Option
								active={portalProvider.current?.id === currentPost?.data?.creator}
								onClick={() => {
									if (portalProvider.current?.id !== currentPost?.data?.creator) {
										handleCurrentPostUpdate({ field: 'creator', value: portalProvider.current?.id });
									}
									setShowDropdown(false);
								}}
							>
								{portalProvider.current?.name ?? formatAddress(portalProvider.current?.id, false)}
							</S.Option>
						</S.Dropdown>
					)}
				</CloseHandler>
			</S.HeaderWrapper>
		</S.Wrapper>
	);
}
