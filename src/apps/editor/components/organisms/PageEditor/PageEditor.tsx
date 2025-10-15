import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { PageBlock } from 'editor/components/molecules/PageBlock';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { ArticleBlockEnum, ArticleBlockType, PageBlockType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { PageToolbar } from './PageToolbar';
import * as S from './styles';

export default function PageEditor() {
	const dispatch = useDispatch();
	const { pageId } = useParams<{ pageId?: string }>();

	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const articleBlockTypes = Object.keys(ArticleBlockEnum).map((key) => ArticleBlockEnum[key]);

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (pageId && portalProvider.current?.pages?.[pageId]) {
				handleCurrentPageUpdate({ field: 'id', value: pageId });
				handleCurrentPageUpdate({ field: 'title', value: capitalize(pageId) });
				handleCurrentPageUpdate({ field: 'content', value: portalProvider.current?.pages?.[pageId].content });
			}
		}
	}, [pageId, portalProvider.current?.id, portalProvider.current?.pages]);

	const addSection = (type: string) => {
		if (currentPage.editor.loading.active) return;

		const newBlock: PageBlockType = {
			type,
			layout: null,
			content: [],
			width: 1,
		};

		const updatedBlocks = [...(currentPage.data.content || []), newBlock];
		handleCurrentPageUpdate({ field: 'content', value: updatedBlocks });
	};

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		const items = Array.from(currentPage.data.content);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		handleCurrentPageUpdate({ field: 'content', value: items });
	};

	function getBlock(block: PageBlockType | ArticleBlockType, index: number) {
		console.log(block);
		if (articleBlockTypes.includes(block.type)) {
			return <p key={index}>Article Block</p>;
		} else return <PageBlock id={index.toString()} block={block as PageBlockType} key={index} index={index} />;
	}

	return (
		<S.Wrapper>
			<S.ToolbarWrapper>
				<PageToolbar handleSubmit={() => console.log('Save Page')} addSection={addSection} />
			</S.ToolbarWrapper>
			<S.EditorWrapper>
				{currentPage.data.content?.length ? (
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId={'blocks'}>
							{(provided) => (
								<S.Editor
									{...provided.droppableProps}
									ref={provided.innerRef}
									blockEditMode={currentPage.editor.blockEditMode}
								>
									{currentPage.data.content.map((block: PageBlockType | ArticleBlockType, index: number) =>
										getBlock(block, index)
									)}
									{provided.placeholder}
								</S.Editor>
							)}
						</Droppable>
					</DragDropContext>
				) : (
					<S.BlocksEmpty className={'fade-in'}>
						<span>{language?.blocksEmpty}</span>
					</S.BlocksEmpty>
				)}
			</S.EditorWrapper>
		</S.Wrapper>
	);
}
