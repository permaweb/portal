import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { ICONS } from 'helpers/config';
import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Category',
	title: 'Title',
	description: 'Description',
};

export default function FeedBlock(props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [posts, setPosts] = React.useState<PortalAssetType[]>([]);

	React.useEffect(() => {
		if (portalProvider.current?.assets && portalProvider.current.assets.length > 0) {
			setPosts(portalProvider.current.assets);
		}
	}, [portalProvider.current?.assets]);

	const displayPosts = posts.length > 0 ? posts.slice(0, 2) : [null, null];

	// Ensure we always display both categories from the two posts
	const categoryNames = displayPosts.map((post) => post?.metadata?.categories?.[0]?.name || FALLBACK_DATA.category);

	const options = [
		{ name: language.journal, value: 'journal' },
		{ name: language.blog, value: 'blog' },
		{ name: language.minimal, value: 'minimal' },
	];

	const [currentOptionIndex, setCurrentOptionIndex] = React.useState(0);

	React.useEffect(() => {
		if (props.block?.layout) {
			const index = options.findIndex((opt) => opt.value === props.block.layout);
			if (index !== -1 && index !== currentOptionIndex) {
				setCurrentOptionIndex(index);
			}
		}
	}, [props.block?.layout]);

	const handleRotate = () => {
		const nextIndex = (currentOptionIndex + 1) % options.length;
		setCurrentOptionIndex(nextIndex);

		props.onChangeBlock(
			{
				...props.block,
				layout: options[nextIndex].value,
			},
			props.index
		);
	};

	const currentOption = options[currentOptionIndex];
	const currentLayout = props.block?.layout ?? options[0].value;
	const nextOption = options[(currentOptionIndex + 1) % options.length];

	return (
		<S.Wrapper>
			<S.ContentWrapper layout={currentLayout}>
				{displayPosts.map((post, index) => {
					const categoryName = categoryNames[index];
					const postTitle = post?.name || FALLBACK_DATA.title;
					const postDescription = post?.metadata?.description || FALLBACK_DATA.description;
					const postThumbnail = post?.metadata?.thumbnail;

					const image = (
						<S.PostImage hasImage={!!postThumbnail}>
							{postThumbnail ? <img src={getTxEndpoint(postThumbnail)} alt={postTitle} /> : <span>Post Image</span>}
						</S.PostImage>
					);

					return (
						<S.CategoryWrapper key={index} layout={currentLayout}>
							<S.CategoryHeader layout={currentLayout}>
								<p>{categoryName}</p>
							</S.CategoryHeader>
							<S.CategoryBody>
								<S.PostWrapper>
									<S.PostInfo layout={currentLayout}>
										{props.block?.layout === 'blog' && image}
										<p>{postTitle}</p>
										{props.block?.layout !== 'blog' && <span>{postDescription}</span>}
									</S.PostInfo>
									{props.block?.layout === 'journal' && image}
								</S.PostWrapper>
							</S.CategoryBody>
						</S.CategoryWrapper>
					);
				})}
			</S.ContentWrapper>
			<S.ActionsWrapper>
				<Button
					type={'alt3'}
					label={`Layout: ${currentOption.name}`}
					handlePress={handleRotate}
					icon={ICONS.rotate}
					tooltip={`${language.switchTo} ${nextOption.name}`}
				/>
			</S.ActionsWrapper>
		</S.Wrapper>
	);
}
