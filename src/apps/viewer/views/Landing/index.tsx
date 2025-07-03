import React from 'react';

import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { PortalAssetType } from 'helpers/types';
import { shuffleArray } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Landing() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [featuredPosts, setFeaturedPosts] = React.useState<PortalAssetType[] | null>(null);
	const [panelPosts, setPanelPosts] = React.useState<PortalAssetType[] | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.assets?.length > 0) {
			const filteredFeaturedPosts = [...portalProvider.current.assets].filter(
				(post: PortalAssetType) => post.metadata.status === 'published'
			) ?? [];

			const filteredPanelPosts = shuffleArray(filteredFeaturedPosts);

			setFeaturedPosts(filteredFeaturedPosts);
			setPanelPosts(filteredPanelPosts);
		} else {
			setFeaturedPosts([]);
			setPanelPosts([]);
		}
	}, [portalProvider.current?.assets]);

	function getFeaturedPosts() {
		if (!featuredPosts) return <Loader sm relative />;
		if (featuredPosts.length > 0) {
			return <PostList posts={featuredPosts} />;
		} else {
			return null;
		}
	}

	function getPanelPosts() {
		if (!panelPosts) return <Loader sm relative />;
		if (panelPosts.length > 0) {
			return (
				<S.PanelWrapper>
					<S.PanelHeader>
						<p>{language.mostRead}</p>
					</S.PanelHeader>
					<PostList posts={panelPosts} hideImages />
				</S.PanelWrapper>
			);
		} else {
			return null;
		}
	}

	return (
		<S.Wrapper>
			<S.FeaturedWrapper>{getFeaturedPosts()}</S.FeaturedWrapper>
			{getPanelPosts()}
		</S.Wrapper>
	);
}
