import React from 'react';

import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { Loader } from 'components/atoms/Loader';
import { PortalAssetType, PortalCategoryType } from 'helpers/types';
import { shuffleArray } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function Landing() {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [featuredPosts, setFeaturedPosts] = React.useState<PortalAssetType[] | null>(null);
	const [panelPosts, setPanelPosts] = React.useState<PortalAssetType[] | null>(null);
	const [groupedPosts, setGroupedPosts] = React.useState<{ [key: string]: PortalAssetType[] } | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.assets?.length > 0) {
			const filteredFeaturedPosts =
				[...portalProvider.current.assets].filter((post: PortalAssetType) => post.metadata.status === 'published') ??
				[];

			const filteredPanelPosts = shuffleArray(filteredFeaturedPosts);

			const grouped = groupPostsByCategory(filteredFeaturedPosts);

			setFeaturedPosts(filteredFeaturedPosts);
			setPanelPosts(filteredPanelPosts);
			setGroupedPosts(grouped);
		} else {
			setFeaturedPosts([]);
			setPanelPosts([]);
			setGroupedPosts({});
		}
	}, [portalProvider.current?.assets]);

	function groupPostsByCategory(posts: PortalAssetType[]): { [key: string]: PortalAssetType[] } {
		const grouped: { [key: string]: PortalAssetType[] } = {};

		posts.forEach((post) => {
			if (post.metadata.categories && post.metadata.categories.length > 0) {
				post.metadata.categories.forEach((category: PortalCategoryType) => {
					if (!grouped[category.name]) {
						grouped[category.name] = [];
					}
					grouped[category.name].push(post);
				});
			} else {
				if (!grouped['Uncategorized']) {
					grouped['Uncategorized'] = [];
				}
				grouped['Uncategorized'].push(post);
			}
		});

		return grouped;
	}

	function getFeaturedPosts() {
		if (!groupedPosts) return <Loader sm relative />;

		const categoryNames = Object.keys(groupedPosts);
		if (categoryNames.length === 0) return null;

		return (
			<>
				{categoryNames.map((categoryName) => (
					<S.CategorySection key={categoryName}>
						<S.CategoryHeader>
							<span>{categoryName}</span>
						</S.CategoryHeader>
						<PostList posts={groupedPosts[categoryName]} />
					</S.CategorySection>
				))}
			</>
		);
	}

	function getPanelPosts() {
		if (!panelPosts) return <Loader sm relative />;
		if (panelPosts.length > 0) {
			return (
				<S.PanelWrapper>
					<S.PanelHeader>
						<span>{language?.mostRead}</span>
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