import React from 'react';
import { Link } from 'react-router-dom';

import { Types } from '@permaweb/libs';

import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType } from 'helpers/types';
import { checkValidAddress, formatAddress, formatDate, getRedirect } from 'helpers/utils';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

function Post(props: { post: PortalAssetType; hideImage?: boolean }) {
	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();

	const [creator, setCreator] = React.useState<Types.ProfileType | null>(null);

	React.useEffect(() => {
		(async function () {
			if (props.post?.creator && permawebProvider.libs) {
				try {
					const fetchedCreator = await portalProvider.fetchUserProfile(props.post.creator);
					setCreator(fetchedCreator);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [props.post?.creator, permawebProvider.libs]);

	const hasImage =
		props.post.metadata?.thumbnail && checkValidAddress(props.post.metadata.thumbnail) && !props.hideImage;

	return (
		<S.PostWrapper key={props.post.id}>
			<S.PostInfoWrapper hasImage={hasImage}>
				<Link to={getRedirect(URLS.post(props.post.id))}>
					<h4>{props.post.name}</h4>
				</Link>
				{props.post.metadata?.description && (
					<Link to={getRedirect(URLS.post(props.post.id))}>
						<p>{props.post.metadata.description}</p>
					</Link>
				)}
				<S.PostEndWrapper>
					{props.post?.creator && (
						<S.Author>
							<Link to={getRedirect(URLS.author(props.post.creator))}>
								<p>{creator?.displayName ?? formatAddress(props.post.creator, false)}</p>
							</Link>
						</S.Author>
					)}
					{props.post?.metadata?.releasedDate && (
						<S.ReleasedDate>
							<span>{formatDate(props.post.metadata.releasedDate, 'iso', true)}</span>
						</S.ReleasedDate>
					)}
				</S.PostEndWrapper>
			</S.PostInfoWrapper>
			{hasImage && (
				<S.PostImageWrapper>
					<Link to={getRedirect(URLS.post(props.post.id))}>
						<img src={getTxEndpoint(props.post.metadata.thumbnail)} alt={props.post.name} />
					</Link>
				</S.PostImageWrapper>
			)}
		</S.PostWrapper>
	);
}

export default function PostList(props: { posts: PortalAssetType[]; hideImages?: boolean }) {
	return (
		<S.Wrapper>
			{props.posts.map((post: PortalAssetType) => {
				return <Post key={post.id} post={post} hideImage={props.hideImages} />;
			})}
		</S.Wrapper>
	);
}
