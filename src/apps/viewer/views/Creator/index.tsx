import React from 'react';
import { useParams } from 'react-router-dom';

import { Types } from '@permaweb/libs';

import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Avatar } from 'components/atoms/Avatar';
import { Loader } from 'components/atoms/Loader';
import { PortalAssetType } from 'helpers/types';
import { scrollTo } from 'helpers/window';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Creator() {
	const { creatorId } = useParams<{ creatorId?: string }>();

	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();

	const [creator, setCreator] = React.useState<Types.ProfileType | null>(null);
	const [creatorPosts, setCreatorPosts] = React.useState<PortalAssetType[]>([]);

	React.useEffect(() => {
		scrollTo(0, 0, 'smooth');
	}, [creatorId]);

	React.useEffect(() => {
		(async function () {
			if (creatorId && permawebProvider.libs) {
				try {
					const fetchedCreator = await portalProvider.fetchUserProfile(creatorId);
					setCreator(fetchedCreator);
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [creatorId, permawebProvider.libs]);

	React.useEffect(() => {
		if (creatorId && portalProvider.current.assets) {
			const filteredPosts = portalProvider.current.assets.filter(
				(post: PortalAssetType) => post.creator === creatorId
			);
			setCreatorPosts(filteredPosts);
		}
	}, [creatorId, portalProvider.current.assets]);

	console.log(creator);

	return creator ? (
		<S.Wrapper className={'fade-in'}>
			<S.HeaderWrapper>
				<S.HeaderAvatarWrapper>
				<Avatar
					owner={creator}
					dimensions={{
						wrapper: 175,
						icon: 85,
					}}
				/>
				</S.HeaderAvatarWrapper>
				<S.HeaderInfoWrapper>
					<h4>{creator.displayName ?? '-'}</h4>
					<p>{creator.description ?? '-'}</p>
				</S.HeaderInfoWrapper>
			</S.HeaderWrapper>
			{creatorPosts.length > 0 && (
				<S.BodyWrapper>
					<PostList posts={creatorPosts} />
				</S.BodyWrapper>
			)}
		</S.Wrapper>
	) : (
		<Loader sm relative />
	);
}
