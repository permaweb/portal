import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { FormField } from 'components/atoms/FormField';
import { Select } from 'components/atoms/Select';
import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType, SelectOptionType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

const FALLBACK_DATA = {
	category: 'Category',
	title: 'Title',
	description: 'Description',
};

export default function PostSpotlightBlock(props: {
	index: number;
	block: PageBlockType;
	onChangeBlock: (block: PageBlockType, index: number) => void;
}) {
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [post, setPost] = React.useState<PortalAssetType | null>(null);
	const [filter, setFilter] = React.useState('');
	const [selectedPost, setSelectedPost] = React.useState<SelectOptionType>({ id: '', label: '' });

	React.useEffect(() => {
		const assets = portalProvider.current?.assets;
		if (props.block.txId && assets && assets.length > 0) {
			const found = assets.find((a: PortalAssetType) => a.id === props.block.txId);
			if (found) {
				setPost(found);
				setSelectedPost({ id: found.id, label: found.name });
			}
		} else if (!props.block.txId) {
			setPost(null);
			setSelectedPost({ id: '', label: language.selectPost || 'Select a post' });
		}
	}, [portalProvider.current?.assets, props.block.txId]);

	const postOptions = React.useMemo(() => {
		const assets = portalProvider.current?.assets || [];
		const filtered = filter
			? assets.filter((a: PortalAssetType) => a.name?.toLowerCase().includes(filter.toLowerCase()))
			: assets;
		return [
			{ id: '', label: language.selectPost || 'Select a post' },
			...filtered.map((a: PortalAssetType) => ({ id: a.id, label: a.name })),
		];
	}, [portalProvider.current?.assets, filter, language.selectPost]);

	const handleSave = () => {
		if (selectedPost && selectedPost.id) {
			props.onChangeBlock({ ...props.block, txId: selectedPost.id }, props.index);
		}
	};

	const postCategory = post?.metadata?.categories?.[0].name || FALLBACK_DATA.category;
	const postTitle = post?.name || FALLBACK_DATA.title;
	const postThumbnail = post?.metadata?.thumbnail;

	if (!post) {
		return (
			<S.Wrapper>
				<S.EmptyPostBlock>
					<FormField
						value={filter}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
						invalid={{ status: false, message: null }}
						disabled={false}
						placeholder={language.filterPosts || 'Filter posts...'}
						hideErrorMessage
					/>
					<Select
						activeOption={selectedPost}
						setActiveOption={setSelectedPost}
						options={postOptions}
						disabled={false}
					/>
					<S.EmptyPostAction>
						<Button
							type={'alt1'}
							label={language.save || 'Save'}
							handlePress={handleSave}
							disabled={!selectedPost || !selectedPost.id}
						/>
					</S.EmptyPostAction>
				</S.EmptyPostBlock>
			</S.Wrapper>
		);
	}

	return (
		<S.Wrapper>
			<S.PostWrapper>
				<S.PostContent>
					<S.PostImage>{postThumbnail && <img src={getTxEndpoint(postThumbnail)} alt={postTitle} />}</S.PostImage>
					<S.PostInfo>
						<p>{postCategory}</p>
						<h1>
							<span>{postTitle}</span>
						</h1>
					</S.PostInfo>
				</S.PostContent>
			</S.PostWrapper>
		</S.Wrapper>
	);
}
