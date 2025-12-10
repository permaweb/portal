import React from 'react';

import { usePortalProvider } from 'editor/providers/PortalProvider';

import { Button } from 'components/atoms/Button';
import { getTxEndpoint } from 'helpers/endpoints';
import { PageBlockType, PortalAssetType } from 'helpers/types';
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
	const [selectedPostId, setSelectedPostId] = React.useState<string | null>(props.block.txId || null);

	React.useEffect(() => {
		const assets = portalProvider.current?.assets;
		if (props.block.txId && assets && assets.length > 0) {
			const found = assets.find((a: PortalAssetType) => a.id === props.block.txId);
			if (found) {
				setPost(found);
			}
		} else if (!props.block.txId) {
			setPost(null);
		}
	}, [portalProvider.current?.assets, props.block.txId]);

	const filteredPosts = React.useMemo(() => {
		const assets = portalProvider.current?.assets || [];
		if (!filter) return assets;
		return assets.filter((a: PortalAssetType) => a.name?.toLowerCase().includes(filter.toLowerCase()));
	}, [portalProvider.current?.assets, filter]);

	const handleSave = () => {
		if (selectedPostId) {
			props.onChangeBlock({ ...props.block, txId: selectedPostId }, props.index);
		}
	};

	const postCategory = post?.metadata?.categories?.[0].name || FALLBACK_DATA.category;
	const postTitle = post?.name || FALLBACK_DATA.title;
	const postThumbnail = post?.metadata?.thumbnail;

	if (!post) {
		return (
			<S.Wrapper>
				<S.EmptyPostBlock>
					<S.FilterInput
						type="text"
						placeholder={language.filterPosts || 'Filter posts...'}
						value={filter}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
					/>
					<S.Select
						value={selectedPostId || ''}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPostId(e.target.value)}
					>
						<option value="">{language.selectPost || 'Select a post'}</option>
						{filteredPosts.map((asset: PortalAssetType) => (
							<option key={asset.id} value={asset.id}>
								{asset.name}
							</option>
						))}
					</S.Select>
					<Button type={'alt1'} label={language.save || 'Save'} handlePress={handleSave} disabled={!selectedPostId} />
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
