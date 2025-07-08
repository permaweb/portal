import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { PostList } from 'viewer/components/organisms/PostList';
import { usePortalProvider } from 'viewer/providers/PortalProvider';

import { URLS } from 'helpers/config';
import { PortalAssetType, PortalCategoryType } from 'helpers/types';
import { getPortalIdFromURL } from 'helpers/utils';

import * as S from './styles';

export default function Category() {
	const { categoryId } = useParams<{ categoryId?: string }>();

	const portalProvider = usePortalProvider();

	const [currentCategory, setCurrentCategory] = React.useState<PortalCategoryType | null>(null);
	const [currentPosts, setCurrentPosts] = React.useState<PortalAssetType[] | null>(null);

	React.useEffect(() => {
		if (portalProvider.current?.categories) {
			const foundCategory = getCategoryById(categoryId, portalProvider.current.categories);
			setCurrentCategory(foundCategory);
		}
	}, [categoryId, portalProvider.current?.categories]);

	React.useEffect(() => {
		if (currentCategory && portalProvider.current?.categories && portalProvider.current?.assets) {
			const foundPosts = getPostsForCategory(
				currentCategory.id,
				portalProvider.current.categories,
				portalProvider.current.assets
			);
			setCurrentPosts(foundPosts);
		}
	}, [currentCategory, portalProvider.current?.categories, portalProvider.current?.assets]);

	function getRedirect(categoryId: string) {
		const portalId = getPortalIdFromURL();
		if (portalId) return `${URLS.portalBase(portalId)}${URLS.category(categoryId)}`;
		return URLS.category(categoryId);
	}

	function getCategoryById(id: string, categories: PortalCategoryType[]) {
		for (const category of categories) {
			if (category.id === id) {
				return category;
			}
			if (category.children) {
				const found = getCategoryById(id, category.children);
				if (found) {
					return found;
				}
			}
		}

		return null;
	}

	function getDescendantCategoryIds(catId: string, categories: PortalCategoryType[]): string[] {
		let ids: string[] = [];
		for (const cat of categories) {
			if (cat.id === catId) {
				// Found the node — collect all of its subtree IDs:
				collect(cat);
				break;
			} else if (cat.children) {
				// Otherwise search deeper:
				const deeper = getDescendantCategoryIds(catId, cat.children);
				if (deeper.length) {
					// We found it inside this branch — and `deeper` already
					// includes the catId itself + its subtree
					return deeper;
				}
			}
		}

		return ids;

		function collect(node: PortalCategoryType) {
			ids.push(node.id);
			if (node.children) {
				for (const child of node.children) {
					collect(child);
				}
			}
		}
	}

	/**
	 * Given a categoryId, your full category-tree, and a flat list of posts,
	 * return only those posts which list *any* of those IDs.
	 */
	function getPostsForCategory(
		categoryId: string,
		allCategories: PortalCategoryType[],
		allPosts: PortalAssetType[]
	): PortalAssetType[] {
		// 1) gather that category + all its descendants
		const validIds = getDescendantCategoryIds(categoryId, allCategories);

		// 2) filter posts whose metadata.categories contains one of those IDs
		return allPosts.filter((post) => post.metadata.categories.some((c) => validIds.includes(c.id)));
	}

	return currentCategory ? (
		<S.Wrapper>
			<S.HeaderWrapper className={'fade-in'}>
				<h4>{currentCategory.name ?? '-'}</h4>
				{currentCategory.children && (
					<S.SubheaderWrapper className={'fade-in'}>
						{currentCategory.children.map((child: PortalCategoryType) => {
							return (
								<Link key={child.id} to={getRedirect(child.id)}>
									{child.name}
								</Link>
							);
						})}
					</S.SubheaderWrapper>
				)}
			</S.HeaderWrapper>
			{currentPosts && (
				<S.BodyWrapper className={'fade-in'}>
					<PostList posts={currentPosts} />
				</S.BodyWrapper>
			)}
		</S.Wrapper>
	) : null;
}
