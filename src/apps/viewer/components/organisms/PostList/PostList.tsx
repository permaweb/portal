import { Link, useParams } from 'react-router-dom';

import { URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function PostList(props: { posts: PortalAssetType[]; hideImages?: boolean }) {
	const { portalId } = useParams<{ portalId?: string }>();

	function getRedirect(postId: string) {
		if (portalId) return `${URLS.portalBase(portalId)}${URLS.post(postId)}`;
		return URLS.post(postId);
	}

	return (
		<S.Wrapper>
			{props.posts.map((post: PortalAssetType) => {
				const hasImage = post.metadata?.thumbnail && checkValidAddress(post.metadata.thumbnail) && !props.hideImages;

				return (
					<S.PostWrapper key={post.id}>
						<S.PostInfoWrapper hasImage={hasImage}>
							<Link to={getRedirect(post.id)}>
								<h4>{post.name}</h4>
							</Link>
							{post.metadata?.description && <p>{post.metadata.description}</p>}
						</S.PostInfoWrapper>
						{hasImage && (
							<S.PostImageWrapper>
								<Link to={getRedirect(post.id)}>
									<img src={getTxEndpoint(post.metadata.thumbnail)} alt={post.name} />
								</Link>
							</S.PostImageWrapper>
						)}
					</S.PostWrapper>
				);
			})}
		</S.Wrapper>
	);
}
