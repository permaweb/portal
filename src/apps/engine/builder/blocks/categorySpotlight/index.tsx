// import React from 'react';
import { NavLink } from 'react-router-dom';
import Placeholder from 'engine/components/placeholder';
import { usePosts } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';

import * as S from './styles';

export default function CategorySpotlight(props: any) {
	const { category, tag } = props;
	const { Posts, isLoading: isLoadingPosts } = usePosts({ category });

	const LeftRow = (props: any) => {
		const { post, index } = props;
		const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);

		return (
			<NavLink to={`post/${post.id}`} className={isLoadingPosts ? 'disabledLink' : ''}>
				<S.LeftEntry>
					<S.LeftThumbnail>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							src={!isLoadingPosts ? `https://arweave.net/${post?.metadata?.thumbnail}` : null}
						/>
						<span>{index + 1}</span>
					</S.LeftThumbnail>
					<S.LeftMeta>
						<S.LeftTitle>{isLoadingPosts ? <Placeholder /> : post.name}</S.LeftTitle>
						<S.LeftSource>
							<img
								className="loadingAvatar"
								onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
								src={!isLoadingProfile ? `https://arweave.net/${profile?.thumbnail}` : null}
							/>
							By <span>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</span>
						</S.LeftSource>
					</S.LeftMeta>
				</S.LeftEntry>
			</NavLink>
		);
	};

	const RightRow = (props: any) => {
		const { post, index } = props;
		const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || null);

		return (
			<NavLink to={`post/${post?.id}`} className={isLoadingPosts ? 'disabledLink' : ''}>
				<S.RightEntry>
					<S.RightThumbnail>
						<img
							className="loadingThumbnail"
							onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
							src={!isLoadingPosts ? `https://arweave.net/${post?.metadata?.thumbnail}` : null}
						/>
						<S.RightTitle>
							<span className={isLoadingPosts ? 'loadingPlaceholder' : ''}>
								{isLoadingPosts ? (
									<>
										&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									</>
								) : (
									post.name
								)}
							</span>
						</S.RightTitle>
						<S.RightSource>
							<img
								className="loadingAvatar"
								onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
								src={!isLoadingProfile ? `https://arweave.net/${profile?.thumbnail}` : null}
							/>
							By <span>{isLoadingProfile ? <Placeholder /> : profile?.displayName}</span>
						</S.RightSource>
					</S.RightThumbnail>
				</S.RightEntry>
			</NavLink>
		);
	};

	return (
		<S.CategorySpotlight>
			<h1>{isLoadingPosts ? <Placeholder width="200" /> : tag ? `#{tag}` : `${category}`}</h1>
			<S.CategorySpotlightGrid>
				<S.Left>
					{Object.values(Posts || [0, 1, 2, 3, 4, 5])
						?.slice(0, 6)
						.map((post: any, index: number) => (
							<LeftRow post={post} key={index} index={index} />
						))}
				</S.Left>
				<S.Right>
					{Object.values(Posts || [0, 1, 2, 3, 4, 5, 6, 7, 8])
						?.slice(6, 9)
						.map((post: any, index: number) => (
							<RightRow post={post} key={index} index={index} />
						))}
				</S.Right>
			</S.CategorySpotlightGrid>
		</S.CategorySpotlight>
	);
}
