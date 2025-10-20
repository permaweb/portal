import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { PageSection } from 'editor/components/molecules/PageSection';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { PageSectionEnum, PageSectionType } from 'helpers/types';
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

	const addSection = (type: PageSectionEnum) => {
		if (currentPage.editor.loading.active) return;

		const newSection: PageSectionType = {
			type: type,
			layout: null,
			content: [],
			width: 1,
		};

		const updatedSections = [...(currentPage.data.content || []), newSection];
		handleCurrentPageUpdate({ field: 'content', value: updatedSections });
	};

	const deleteSection = (index: number) => {
		if (currentPage.editor.loading.active) return;

		const updatedSections = (currentPage.data.content || []).filter((_, i) => i !== index);
		handleCurrentPageUpdate({ field: 'content', value: updatedSections });
	};

	const handleSectionChange = (updatedSection: PageSectionType, sectionIndex: number) => {
		const updatedSections = [...currentPage.data.content].map((section, index) =>
			index === sectionIndex ? { ...updatedSection } : section
		);
		handleCurrentPageUpdate({ field: 'content', value: updatedSections });
	};

	const onDragEnd = (result: any) => {
		if (!result.destination) {
			return;
		}

		// Handle section reordering
		const items = Array.from(currentPage.data.content);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		handleCurrentPageUpdate({ field: 'content', value: items });
	};

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
									{currentPage.data.content.map((section: PageSectionType, index: number) => (
										<PageSection
											key={index}
											id={index.toString()}
											index={index}
											section={section as PageSectionType}
											onChangeSection={handleSectionChange}
											onDeleteSection={deleteSection}
										/>
									))}
									{provided.placeholder}
								</S.Editor>
							)}
						</Droppable>
					</DragDropContext>
				) : (
					<S.BlocksEmpty className={'fade-in'}>
						<span>Add Section</span>
					</S.BlocksEmpty>
				)}
			</S.EditorWrapper>
		</S.Wrapper>
	);
}
