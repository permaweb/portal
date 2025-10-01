import { NavLink } from 'react-router-dom';
import Placeholder from 'engine/components/placeholder';
import { usePost } from 'engine/hooks/posts';
import { useProfile } from 'engine/hooks/profiles';

import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { checkValidAddress } from 'helpers/utils';

import * as S from './styles';

export default function PostSpotlight(props: any) {
	const { txId } = props;
	var { post, isLoading: isLoadingPost } = usePost(txId);
	const { profile, isLoading: isLoadingProfile, error: errorProfile } = useProfile(post?.creator || '');

	return (
		<S.Wrapper id="PostSpotlight">
			<NavLink to={`/post/${post?.id}`} className={isLoadingPost ? 'disabledLink' : ''}>
				<S.Thumbnail>
					<img
						className="loadingThumbnail"
						onLoad={(e) => e.currentTarget.classList.remove('loadingThumbnail')}
						src={
							checkValidAddress(post?.metadata?.thumbnail)
								? getTxEndpoint(post?.metadata?.thumbnail)
								: post?.metadata?.thumbnail
						}
					/>
				</S.Thumbnail>
				<S.Data>
					<S.Type className={isLoadingPost ? 'loadingPlaceholder' : ''}>
						{isLoadingPost ? (
							<>
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							</>
						) : (
							post?.metadata?.categories[0].name
						)}
					</S.Type>
					<h2>
						<span className={isLoadingPost ? 'loadingPlaceholder' : ''}>
							{isLoadingPost ? (
								<>
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								</>
							) : (
								post?.name
							)}
						</span>
					</h2>
					<S.Meta>
						<img
							className="loadingAvatar"
							onLoad={(e) => e.currentTarget.classList.remove('loadingAvatar')}
							src={checkValidAddress(profile?.thumbnail) ? getTxEndpoint(profile?.thumbnail) : ICONS.user}
						/>
						By
						<span>{isLoadingProfile ? <Placeholder width="60" /> : profile?.displayName}</span>
						<span>
							·{' '}
							{isLoadingPost ? (
								<Placeholder width="90" />
							) : (
								new Date(Number(post?.dateCreated)).toLocaleString('en-US', {
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hour: '2-digit',
									minute: '2-digit',
									hour12: false,
								})
							)}
						</span>
					</S.Meta>
				</S.Data>
			</NavLink>
		</S.Wrapper>
	);
}
