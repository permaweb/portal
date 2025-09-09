import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ASSETS, URLS } from 'helpers/config';
import { ArticleStatusType, PortalAssetType } from 'helpers/types';
import { formatAddress, formatDate } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import * as S from './styles';

export default function Post(props: { post: PortalAssetType }) {
	const navigate = useNavigate();

	const portalProvider = usePortalProvider();
	const permawebProvider = usePermawebProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [fetched, setFetched] = React.useState<boolean>(false);

	const unauthorized =
		!portalProvider?.permissions?.postAutoIndex &&
		!portalProvider?.permissions?.updatePostRequestStatus &&
		props.post?.creator !== permawebProvider.profile.id;

	React.useEffect(() => {
		(async function () {
			if (!fetched && props.post.creator) {
				portalProvider.fetchPortalUserProfile({
					address: props.post.creator,
				});
			}
			setFetched(true);
		})();
	}, [props.post?.creator, fetched]);

	return props.post ? (
		<S.PostWrapper className={'fade-in'}>
			<S.PostHeader>
				<p>{props.post.name}</p>
				<S.PostHeaderDetail>
					<ReactSVG src={ASSETS.time} />
					<span>
						{`${formatDate(props.post.dateCreated, 'epoch', true)} · ${
							portalProvider.usersByPortalId?.[props.post.creator]?.username ?? formatAddress(props.post.creator, false)
						}`}
					</span>
				</S.PostHeaderDetail>
			</S.PostHeader>
			<S.PostDetail>
				<S.PostActions>
					<Button
						type={'alt3'}
						label={language?.edit}
						handlePress={() => navigate(`${URLS.postEditArticle(portalProvider.current.id)}${props.post.id}`)}
						disabled={unauthorized}
					/>
				</S.PostActions>
				{props.post.metadata?.status && (
					<S.PostStatus status={props.post.metadata?.status as ArticleStatusType}>
						<p>{props.post.metadata.status}</p>
						<div id={'post-status'} />
					</S.PostStatus>
				)}
			</S.PostDetail>
		</S.PostWrapper>
	) : null;
}
