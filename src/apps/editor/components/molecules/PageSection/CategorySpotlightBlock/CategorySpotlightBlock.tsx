import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType, PortalCategoryType, SelectOptionType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Investigative series',
};

export default function CategorySpotlightBlock(props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [category, setCategory] = React.useState<PortalCategoryType | null>(null);
	const [posts, setPosts] = React.useState<PortalAssetType[]>([]);
	const [filter, setFilter] = React.useState('');
	const [selectedCategory, setSelectedCategory] = React.useState<SelectOptionType>({ id: '', label: '' });

	React.useEffect(() => {
		if (props.block.categoryId && portalProvider.current?.categories && portalProvider.current.categories.length > 0) {
			const found = portalProvider.current.categories.find((c: PortalCategoryType) => c.id === props.block.categoryId);
			if (found) {
				setCategory(found);
				setSelectedCategory({ id: found.id, label: found.name });

				if (portalProvider.current?.assets) {
					const categoryPosts = portalProvider.current.assets
						.filter((asset) => asset.metadata?.categories?.some((c) => c.id === found.id))
						.slice(0, 6);
					setPosts(categoryPosts);
				}
			}
		} else if (!props.block.categoryId) {
			setCategory(null);
			setPosts([]);
			setSelectedCategory({ id: '', label: language.selectCategory || 'Select a category' });
		}
	}, [
		portalProvider.current?.categories,
		portalProvider.current?.assets,
		props.block.categoryId,
		language.selectCategory,
	]);

	const categoryOptions = React.useMemo(() => {
		const categories = portalProvider.current?.categories || [];
		const filtered = filter
			? categories.filter((c: PortalCategoryType) => c.name?.toLowerCase().includes(filter.toLowerCase()))
			: categories;
		return [
			{ id: '', label: language.selectCategory || 'Select a category' },
			...filtered.map((c: PortalCategoryType) => ({ id: c.id, label: c.name })),
		];
	}, [portalProvider.current?.categories, filter, language.selectCategory]);

	const handleSave = () => {
		if (selectedCategory && selectedCategory.id) {
			props.onChangeBlock({ ...props.block, categoryId: selectedCategory.id }, props.index);
		}
	};

	const categoryName = category?.name || FALLBACK_DATA.category;

	// Split posts: 2 list items on left, 1 featured on right
	const listPosts = posts.slice(0, 3);
	const featuredPost = posts.length > 0 ? posts[0] : null;

	if (!category) {
		return (
			<S.Wrapper>
				<S.EmptyCategoryBlock>
					<FormField
						value={filter}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
						invalid={{ status: false, message: null }}
						disabled={false}
						placeholder={language.filterCategories || 'Filter categories...'}
						hideErrorMessage
					/>
					<Select
						activeOption={selectedCategory}
						setActiveOption={setSelectedCategory}
						options={categoryOptions}
						disabled={false}
					/>
					<S.EmptyCategoryAction>
						<Button
							type={'alt1'}
							label={language.save || 'Save'}
							handlePress={handleSave}
							disabled={!selectedCategory || !selectedCategory.id}
						/>
					</S.EmptyCategoryAction>
				</S.EmptyCategoryBlock>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.Header>
				<h2>{categoryName}</h2>
			</S.Header>
			<S.Content>
				<S.LeftColumn>
					{listPosts.map((post, index) => {
						const postTitle = post?.name || 'Title';
						const postThumbnail = post?.metadata?.thumbnail;

						return (
							<S.ListPost key={post.id}>
								{postThumbnail && (
									<S.ListPostImage>
										<img src={getTxEndpoint(postThumbnail)} alt={postTitle} />
										<S.ListPostNumber>{index + 1}</S.ListPostNumber>
									</S.ListPostImage>
								)}
								<S.ListPostContent>
									<S.ListPostInfo>
										<S.ListPostTitle>{postTitle}</S.ListPostTitle>
										{/* <S.PostCreator>BY {postCreator}</S.PostCreator> */}
									</S.ListPostInfo>
								</S.ListPostContent>
							</S.ListPost>
						);
					})}
				</S.LeftColumn>
				<S.RightColumn>
					{featuredPost && (
						<S.FeaturedPost>
							{featuredPost.metadata?.thumbnail && (
								<S.PostImage>
									<img src={getTxEndpoint(featuredPost.metadata.thumbnail)} alt={featuredPost.name} />
								</S.PostImage>
							)}
							<S.PostOverlay>
								<S.PostTitle>
									<span>{featuredPost.name || 'Title'}</span>
								</S.PostTitle>
							</S.PostOverlay>
						</S.FeaturedPost>
					)}
				</S.RightColumn>
			</S.Content>
		</S.Wrapper>
	);
}
