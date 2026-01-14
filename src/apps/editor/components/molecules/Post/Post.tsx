import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetType } from 'helpers/types';
import { formatAddress, formatDate, resolvePrimaryDomain } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Post(props: { post: PortalAssetType }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const unauthorized =
		!portalProvider?.permissions?.postAutoIndex &&
		!portalProvider?.permissions?.updatePostRequestStatus &&
		props.post?.creator !== permawebProvider.profile.id;

	React.useEffect(() => {
		// Only fetch if creator exists, is not the portal itself, and profile not already loaded
		if (
			props.post.creator &&
			props.post.creator !== portalProvider.current?.id &&
			!portalProvider.usersByPortalId?.[props.post.creator]
		) {
			portalProvider.fetchPortalUserProfile({
				address: props.post.creator,
			});
		}
	}, [props.post?.creator, portalProvider.current?.id, portalProvider.usersByPortalId]);

	const creatorName =
		props.post?.creator === portalProvider.current?.id
			? portalProvider.current?.name
			: portalProvider.usersByPortalId?.[props.post?.creator]?.username ?? formatAddress(props.post?.creator, false);

	return props.post ? (
		<Link
			to={`${resolvePrimaryDomain(portalProvider.current?.domains, portalProvider.current?.id)}/#/post/${
				props.post.metadata?.url ?? props.post?.id
			}`}
			target={'_blank'}
		>
			<S.PostWrapper className={'fade-in'}>
				<S.PostHeader>
					<p>{props.post.name}</p>
					<S.PostHeaderDetail>
						<ReactSVG src={ICONS.time} />
						<span>{`${formatDate(props.post.metadata?.releaseDate, true)} · ${creatorName}`}</span>
					</S.PostHeaderDetail>
				</S.PostHeader>
				<S.PostDetail>
					<S.PostActions>
						<Button
							type={'alt3'}
							label={language?.edit}
							handlePress={(e: any) => {
								e.preventDefault();
								e.stopPropagation();
								navigate(`${URLS.postEditArticle(portalProvider.current.id)}${props.post.id}`);
							}}
							disabled={unauthorized}
						/>
					</S.PostActions>
					{props.post.metadata?.status && (
						<S.PostStatus status={props.post.metadata?.status as ArticleStatusType}>
							<span>{props.post.metadata.status}</span>
							<div id={'post-status'} />
						</S.PostStatus>
					)}
				</S.PostDetail>
			</S.PostWrapper>
		</Link>
	) : null;
}
