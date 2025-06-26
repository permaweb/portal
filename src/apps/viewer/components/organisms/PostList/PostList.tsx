import { Link } from 'react-router-dom';

import { getTxEndpoint } from 'helpers/endpoints';
import { PortalAssetType } from 'helpers/types';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function PostList(props: { posts: PortalAssetType[] }) {
	return (
		<S.Wrapper>
			{props.posts.map((post: PortalAssetType) => {
				console.log(post);
				return (
					<S.PostWrapper key={post.id}>
						<S.PostInfoWrapper>
							<Link to={'#'}>
							<h4>{post.name}</h4>
							</Link>
							{post.metadata?.description && (
								<p>{post.metadata.description}</p>
							)}
						</S.PostInfoWrapper>
						{post.metadata?.thumbnail && checkValidAddress(post.metadata.thumbnail) && (
							<S.PostImageWrapper>
								<Link to={'#'}>
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
