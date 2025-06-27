import { Link } from 'react-router-dom';

import { URLS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function PostList(props: { posts: PortalAssetType[]; hideImages?: boolean }) {
	return (
		<S.Wrapper>
			{props.posts.map((post: PortalAssetType) => {
				const hasImage = post.metadata?.thumbnail && checkValidAddress(post.metadata.thumbnail) && !props.hideImages;

				return (
					<S.PostWrapper key={post.id}>
						<S.PostInfoWrapper hasImage={hasImage}>
							<Link to={URLS.post(post.id)}>
								<h4>{post.name}</h4>
							</Link>
							{post.metadata?.description && <p>{post.metadata.description}</p>}
						</S.PostInfoWrapper>
						{hasImage && (
							<S.PostImageWrapper>
								<Link to={URLS.post(post.id)}>
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
