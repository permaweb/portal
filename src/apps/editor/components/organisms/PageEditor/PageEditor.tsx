import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import { PageSection, ResizeContext } from 'editor/components/molecules/PageSection';
import { usePortalProvider } from 'editor/providers/PortalProvider';
import { useSettingsProvider } from 'editor/providers/SettingsProvider';
import { EditorStoreRootState } from 'editor/store';
import { currentPageClear, currentPageUpdate, setOriginalData } from 'editor/store/page';

import { Loader } from 'components/atoms/Loader';
import { PageSectionEnum, PageSectionType, PortalPatchMapEnum } from 'helpers/types';
import { capitalize, debugLog, isMac, urlify } from 'helpers/utils';
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
	const { settings } = useSettingsProvider();

	const [resizingBlockId, setResizingBlockId] = React.useState<string | null>(null);
	const [hasBodyOverflow, setHasBodyOverflow] = React.useState(false);

	React.useEffect(() => {
		const checkOverflow = () => {
			const hasOverflow =
				document.documentElement.scrollHeight > document.documentElement.clientHeight ||
				window.innerHeight < document.documentElement.scrollHeight;
			setHasBodyOverflow(hasOverflow);
		};

		checkOverflow();
		window.addEventListener('resize', checkOverflow);
		const observer = new MutationObserver(checkOverflow);
		observer.observe(document.body, { childList: true, subtree: true, attributes: true });

		return () => {
			window.removeEventListener('resize', checkOverflow);
			observer.disconnect();
		};
	}, []);

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	React.useEffect(() => {
		const isEmpty =
			!currentPage.data.content ||
			currentPage.data.content.length === 0 ||
			currentPage.data.content.every((section) => !section.content || section.content.length === 0);

		const noTitle = !currentPage.data.title || currentPage.data.title.trim() === '';

		handleCurrentPageUpdate({ field: 'submitDisabled', value: isEmpty || noTitle });
	}, [currentPage.data.content, currentPage.data.title]);

	const previousPageIdRef = React.useRef<string | undefined>(undefined);

	React.useEffect(() => {
		if (portalProvider.current?.id) {
			if (pageId && portalProvider.current?.pages?.[pageId]) {
				const hasCurrentPageData = currentPage.data.id === pageId && currentPage.data.title;
				const pageIdChanged = previousPageIdRef.current !== pageId;

				if (!hasCurrentPageData || pageIdChanged) {
					dispatch(currentPageClear());

					const content = portalProvider.current?.pages?.[pageId].content;

					/* Add IDs to any elements missing them */
					if (Array.isArray(content)) {
						const makeId = () =>
							typeof crypto?.randomUUID === 'function'
								? crypto.randomUUID()
								: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

						for (const section of content) {
							if (Array.isArray(section.content)) {
								for (const block of section.content) {
									if (!block.id) block.id = makeId();
								}
							}
						}
					}

					const pageData = {
						id: pageId,
						title: capitalize(pageId),
						content: content,
					};

					// Update current data
					Object.keys(pageData).forEach((key) => {
						handleCurrentPageUpdate({ field: key, value: pageData[key as keyof typeof pageData] });
					});

					// Set original data for comparison
					dispatch(setOriginalData(pageData as any));
				}
			} else {
				// Clear the page if we're creating a new page (pageId is undefined)
				// But have content from an existing page (currentPage.data.id exists)
				// This handles the case where user navigates from editing an existing page to creating new
				if (currentPage.data.id) dispatch(currentPageClear());
			}
			previousPageIdRef.current = pageId;
		}
	}, [pageId, portalProvider.current?.id, portalProvider.current?.pages]);

	// Auto-add empty section when no content exists
	React.useEffect(() => {
		if (!currentPage.data.content || currentPage.data.content.length === 0) {
			const newSection: PageSectionType = {
				type: PageSectionEnum.Row,
				layout: null,
				content: [],
				width: 1,
			};
			handleCurrentPageUpdate({ field: 'content', value: [newSection] });
		}
	}, [currentPage.data.content]);

	// Keyboard shortcut: Cmd/Ctrl + Shift + S to save
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const modifier = isMac() ? e.metaKey : e.ctrlKey;
			if (modifier && e.shiftKey && e.key.toLowerCase() === 's') {
				e.preventDefault();
				if (!currentPage.editor.submitDisabled) {
					handleSubmit();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [currentPage.editor]);

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

				const updatedId = currentPage.data.id ?? urlify(currentPage.data.title);
				updatedPages[updatedId] = { content: currentPage.data.content, type: 'grid' };

				const portalUpdateId = await permawebProvider.libs.updateZone(
					{ Pages: permawebProvider.libs.mapToProcessCase(updatedPages) },
					portalProvider.current.id,
					arProvider.wallet
				);

				portalProvider.refreshCurrentPortal(PortalPatchMapEnum.Presentation);
				debugLog('info', 'PageEditor', `Portal update: ${portalUpdateId}`);
				addNotification(`${language?.pageSaved}!`, 'success');
			} catch (e: any) {
				debugLog('error', 'PageEditor', e);
				addNotification(e.message ?? 'Error saving page', 'warning');
			}

			handleCurrentPageUpdate({ field: 'loading', value: { active: false, message: null } });
		}
	}

	return (
		<>
			<S.Wrapper>
				<S.ToolbarWrapper id={'toolbar-wrapper'} navWidth={settings.navWidth} hasBodyOverflow={hasBodyOverflow}>
					<S.ToolbarContent className={'max-view-wrapper'} navWidth={settings.navWidth}>
						<PageToolbar handleSubmit={handleSubmit} addSection={addSection} />
					</S.ToolbarContent>
				</S.ToolbarWrapper>
				<ResizeContext.Provider value={{ resizingBlockId, setResizingBlockId }}>
					<S.EditorWrapper>
						<DragDropContext onDragEnd={onDragEnd}>
							<Droppable droppableId={'blocks'}>
								{(provided) => (
									<S.Editor
										{...provided.droppableProps}
										ref={provided.innerRef}
										blockEditMode={currentPage.editor.blockEditMode}
									>
										{currentPage.data.content?.map((section: PageSectionType, index: number) => (
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
					</S.EditorWrapper>
				</ResizeContext.Provider>
			</S.Wrapper>
			{currentPage.editor.loading.active && <Loader message={currentPage.editor.loading.message} />}
		</>
	);
}
