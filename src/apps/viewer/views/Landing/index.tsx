import React from 'react';

import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { PortalAssetType } from 'helpers/types';
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
			setFeaturedPosts([...portalProvider.current.assets]);
			setPanelPosts([...portalProvider.current.assets]);
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
			return <p>{language.noPostsFound}</p>;
		}
	}

	function getPanelPosts() {
		if (!panelPosts) return <Loader sm relative />;
		if (panelPosts.length > 0) {
			return <PostList posts={panelPosts} hideImages />;
		} else {
			return <p>{language.noPostsFound}</p>;
		}
	}

	return (
		<S.Wrapper>
			<S.FeaturedWrapper>{getFeaturedPosts()}</S.FeaturedWrapper>
			<S.PanelWrapper>
				<S.PanelHeader>
					<p>Opinions</p>
				</S.PanelHeader>
				{getPanelPosts()}
			</S.PanelWrapper>
		</S.Wrapper>
	);
}
