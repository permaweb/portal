import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { PageSection } from 'editor/components/molecules/PageSection';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { Loader } from 'components/atoms/Loader';
import { PageSectionEnum, PageSectionType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useArweaveProvider } from 'providers/ArweaveProvider';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { useNotifications } from 'providers/NotificationProvider';
import { usePermawebProvider } from 'providers/PermawebProvider';

import { PageToolbar } from './PageToolbar';
import * as S from './styles';

export default function PageEditor() {
	const dispatch = useDispatch();
	const { pageId } = useParams<{ pageId?: string }>();

	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const arProvider = useArweaveProvider();
	const permawebProvider = usePermawebProvider();
	const portalProvider = usePortalProvider();
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const { addNotification } = useNotifications();

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

	async function handleSubmit() {
		if (
			arProvider.wallet &&
			permawebProvider.profile?.id &&
			portalProvider.current?.id &&
			portalProvider.permissions?.updatePortalMeta
		) {
			handleCurrentPageUpdate({ field: 'loading', value: { active: true, message: `${language?.saving}...` } });

			try {
				const updatedPages: any = { ...portalProvider.current?.pages };
				updatedPages[currentPage.data.id] = { content: currentPage.data.content, type: 'grid' };
				console.log(updatedPages);
				const portalUpdateId = await permawebProvider.libs.updateZone(
					{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
					portalProvider.current.id,
					arProvider.wallet
				);

				console.log(`Portal update: ${portalUpdateId}`);

				addNotification(`${language?.pageSaved}!`, 'success');
			} catch (e: any) {
				console.error(e);
				addNotification(e.message ?? 'Error saving page', 'warning');
			}

			handleCurrentPageUpdate({ field: 'loading', value: { active: false, message: null } });
		}
	}

	return (
		<>
			<S.Wrapper>
				<S.ToolbarWrapper>
					<PageToolbar handleSubmit={handleSubmit} addSection={addSection} />
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
			{currentPage.editor.loading.active && <Loader message={currentPage.editor.loading.message} />}
		</>
	);
}
