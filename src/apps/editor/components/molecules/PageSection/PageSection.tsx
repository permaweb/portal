import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { ARTICLE_BLOCKS, ICONS, PAGE_BLOCKS } from 'helpers/config';
import { ArticleBlockEnum, PageBlockEnum, PageBlockType, PageSectionEnum, PageSectionType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleBlock } from '../ArticleBlock';
import { ArticleBlocks } from '../ArticleBlocks';
import { PageBlocks } from '../PageBlocks';

import { CategorySpotlightBlock } from './CategorySpotlightBlock';
import { FeedBlock } from './FeedBlock';
import { PostBlock } from './PostBlock';
import { PostSpotlightBlock } from './PostSpotlightBlock';
import { SidebarBlock } from './SidebarBlock';
import * as S from './styles';
import { SupportersBlock } from './SupportersBlock';
import { TipsBlock } from './TipsBlock';

export const ResizeContext = React.createContext<{
	resizingBlockId: string | null;
	setResizingBlockId: (id: string | null) => void;
}>({
	resizingBlockId: null,
	setResizingBlockId: () => {},
});

export default function PageSection(props: {
	id: string;
	index: number;
	section: PageSectionType;
	onChangeSection: (section: PageSectionType, index: number) => void;
	onDeleteSection: (index: number) => void;
	parentDragHandleProps?: any;
}) {
	const dispatch = useDispatch();
	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);
	const { resizingBlockId: globalResizingBlockId, setResizingBlockId: setGlobalResizingBlockId } =
		React.useContext(ResizeContext);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const handleCurrentPageUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPageUpdate(updatedField));
	};

	const [showSelector, setShowSelector] = React.useState<boolean>(false);
	const [resizingBlock, setResizingBlock] = React.useState<{
		id: string;
		startX: number;
		startWidth: number;
		containerWidth: number;
		isLast: boolean;
		side: 'left' | 'right';
	} | null>(null);
	const [dragStartPosition, setDragStartPosition] = React.useState<{ x: number; y: number } | null>(null);
	const dragCurrentPositionRef = React.useRef<{ x: number; y: number } | null>(null);

	const articleBlockTypes = Object.keys(ArticleBlockEnum).map((key) => ArticleBlockEnum[key]);

	React.useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (dragStartPosition) {
				dragCurrentPositionRef.current = { x: e.clientX, y: e.clientY };
			}
		};

		if (dragStartPosition) {
			document.addEventListener('mousemove', handleMouseMove);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
		};
	}, [dragStartPosition]);

	const toggleSectionLayout = () => {
		if (!props.section.content) return;

		let newType: PageSectionEnum;
		if (props.section.type === PageSectionEnum.Row) {
			newType = PageSectionEnum.Column;
		} else {
			newType = PageSectionEnum.Row;
		}

		const updatedSection = {
			...props.section,
			type: newType,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	function getElementToolbar() {
		const isOnlySection = currentPage.data.content?.length === 1;

		return (
			<S.ElementToolbar tabIndex={-1}>
				<S.EToolbarHeader>
					<span>{props.section?.type ? capitalize(props.section.type) : '-'}</span>
				</S.EToolbarHeader>
				<S.EToolbarActions>
					<IconButton
						type={'alt1'}
						active={false}
						src={props.section.type === PageSectionEnum.Row ? ICONS.columns : ICONS.rows}
						handlePress={toggleSectionLayout}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={`${props.section.type === PageSectionEnum.Row ? 'Column' : 'Row'} Layout`}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
					<IconButton
						type={'alt1'}
						active={false}
						src={ICONS.plus}
						handlePress={() => setShowSelector((prev) => !prev)}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language?.addBlock}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
					{!isOnlySection && (
						<IconButton
							type={'alt1'}
							active={false}
							src={ICONS.delete}
							handlePress={() => props.onDeleteSection(props.index)}
							dimensions={{ wrapper: 23.5, icon: 13.5 }}
							tooltip={language?.deleteSection}
							tooltipPosition={'bottom-right'}
							noFocus
						/>
					)}
				</S.EToolbarActions>
			</S.ElementToolbar>
		);
	}

	const addBlock = (type: PageBlockEnum | ArticleBlockEnum | 'section') => {
		if (currentPage.editor.loading.active) return;

		let newBlock: any = null;
		let content: any = null;

		if (type === 'section') {
			// Create a nested section
			newBlock = {
				id: Date.now().toString(),
				type: 'section',
				content: {
					type: PageSectionEnum.Row,
					layout: null,
					content: [],
					width: 1,
				},
				width: 1,
			};
		} else if (articleBlockTypes.includes(type)) {
			switch (type) {
				case 'ordered-list':
				case 'unordered-list':
					content = '<li></li>';
					break;
				default:
					content = '';
					break;
			}

			newBlock = {
				id: Date.now().toString(),
				type: type as ArticleBlockEnum,
				content: content,
				width: 1,
			};
		} else {
			newBlock = {
				id: Date.now().toString(),
				type: type as PageBlockEnum,
				content: content,
				width: 1,
			};
		}

		const updatedSection = {
			...props.section,
			content: [...(props.section.content ?? []), newBlock],
		};

		props.onChangeSection(updatedSection, props.index);

		if (showSelector) setShowSelector(false);
	};

	const handleArticleBlockChange = (args: { id: string; content: string; type?: any; data?: any }) => {
		const updatedBlocks = [...props.section.content].map((block) =>
			block.id === args.id
				? { ...block, content: args.content, type: args.type ?? block.type, data: args.data ?? block.data ?? null }
				: block
		);

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	const handlePageBlockChange = (block: PageBlockType, index: number) => {
		const updatedBlocks = [...props.section.content];
		updatedBlocks[index] = block;

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	const deleteBlock = (index: number) => {
		const updatedBlocks = (props.section.content || []).filter((_, i) => i !== index);

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	const handleBlockDragEnd = (result: any) => {
		if (!result.destination) {
			setDragStartPosition(null);
			dragCurrentPositionRef.current = null;
			return;
		}

		const items = Array.from(props.section.content || []);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		// Determine the new section type based on block count
		// Maintain current type, only reset to row if single block
		let newType: PageSectionEnum = props.section.type;

		if (items.length === 1) {
			// Single block should always be row
			newType = PageSectionEnum.Row;
		}
		// For 2+ blocks, maintain the current type unless it's not set
		else if (!newType) {
			// Default new multi-block sections to row
			newType = PageSectionEnum.Row;
		}

		const updatedSection = {
			...props.section,
			content: items,
			type: newType,
		};

		props.onChangeSection(updatedSection, props.index);

		// Reset drag tracking
		setDragStartPosition(null);
		dragCurrentPositionRef.current = null;
	};

	const handleResizeStart = (
		e: React.MouseEvent,
		blockId: string,
		currentWidth: number,
		isLast: boolean,
		side: 'left' | 'right'
	) => {
		e.preventDefault();
		e.stopPropagation();

		const container = (e.target as HTMLElement).closest('[data-rfd-droppable-id]');
		if (!container) return;

		setResizingBlock({
			id: blockId,
			startX: e.clientX,
			startWidth: currentWidth,
			containerWidth: (container as HTMLElement).offsetWidth,
			isLast,
			side,
		});

		// Set global resize state
		setGlobalResizingBlockId(blockId);
	};

	React.useEffect(() => {
		if (!resizingBlock) return;

		// Create a style element to override cursor globally
		const styleElement = document.createElement('style');
		styleElement.id = 'resize-cursor-override';
		styleElement.innerHTML = `
			* {
				cursor: col-resize !important;
			}
		`;
		document.head.appendChild(styleElement);
		document.body.style.userSelect = 'none';

		const handleMouseMove = (e: MouseEvent) => {
			if (!resizingBlock) return;

			const deltaX = e.clientX - resizingBlock.startX;
			const totalBlocks = props.section.content?.length || 1;
			const averageBlockWidth = resizingBlock.containerWidth / totalBlocks;
			// Invert deltaWidth for left-side handles (dragging left makes it bigger)
			const deltaWidth = resizingBlock.side === 'left' ? -deltaX / averageBlockWidth : deltaX / averageBlockWidth;

			const newWidth = Math.max(0.5, Math.min(5, resizingBlock.startWidth + deltaWidth));

			const updatedBlocks = [...props.section.content].map((block) =>
				block.id === resizingBlock.id ? { ...block, width: newWidth } : block
			);

			const updatedSection = {
				...props.section,
				content: updatedBlocks,
			};

			props.onChangeSection(updatedSection, props.index);
		};

		const handleMouseUp = () => {
			setResizingBlock(null);
			setGlobalResizingBlockId(null);
			// Remove the style element and restore user select
			const styleEl = document.getElementById('resize-cursor-override');
			if (styleEl) {
				styleEl.remove();
			}
			document.body.style.userSelect = '';
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			// Cleanup in case component unmounts during resize
			const styleEl = document.getElementById('resize-cursor-override');
			if (styleEl) {
				styleEl.remove();
			}
			document.body.style.userSelect = '';
		};
	}, [resizingBlock, props.section, props.index]);

	const handleNestedSectionChange = (updatedNestedSection: PageSectionType, blockId: string) => {
		const updatedBlocks = [...props.section.content].map((block) =>
			block.id === blockId ? { ...block, content: updatedNestedSection } : block
		);

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	const deleteNestedSection = (blockId: string) => {
		const updatedBlocks = props.section.content.filter((block: any) => block.id !== blockId);

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	function getBlock(block: any, index: number) {
		if (!block) return null;

		if (block.type === 'section') {
			return (
				<S.NestedSectionWrapper key={block.id}>
					<PageSection
						id={block.id}
						index={index}
						section={block.content}
						onChangeSection={(updatedNestedSection) => handleNestedSectionChange(updatedNestedSection, block.id)}
						onDeleteSection={() => deleteNestedSection(block.id)}
						parentDragHandleProps={block.parentDragHandleProps}
					/>
				</S.NestedSectionWrapper>
			);
		}

		if (articleBlockTypes.includes(block.type)) {
			return (
				<ArticleBlock
					index={index}
					type={'page'}
					key={block.id}
					block={block}
					onChangeBlock={handleArticleBlockChange}
					onDeleteBlock={() => {}}
					onFocus={() => handleCurrentPageUpdate({ field: 'focusedBlock', value: block })}
				/>
			);
		}
		switch (block.type) {
			case 'feed':
				return <FeedBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			case 'post':
				return <PostBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			case 'postSpotlight':
				return <PostSpotlightBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			case 'categorySpotlight':
				return (
					<CategorySpotlightBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />
				);
			case 'sidebar':
				return <SidebarBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			case 'monetizationButton':
				return <TipsBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			case 'supporters':
				return <SupportersBlock index={index} key={block.id} block={block} onChangeBlock={handlePageBlockChange} />;
			default:
				return null;
		}
	}

	function getBlockLabel(type: string) {
		if (type === 'section') return 'Section';
		if (ARTICLE_BLOCKS[type]) return ARTICLE_BLOCKS[type].label;
		if (PAGE_BLOCKS[type]) return PAGE_BLOCKS[type].label;
		return type;
	}

	function getElement() {
		const ToolbarWrapper: any = currentPage?.editor.blockEditMode ? S.ElementToolbarWrapper : S.ElementToolbarToggle;

		return (
			<S.ElementWrapper
				type={props.section.type}
				blockEditMode={currentPage?.editor.blockEditMode}
				className={'fade-in'}
			>
				<ToolbarWrapper className={'fade-in'} type={props.section.type}>
					{getElementToolbar()}
				</ToolbarWrapper>
				<S.Element blockEditMode={currentPage?.editor.blockEditMode} type={props.section.type}>
					{props.section.content?.length ? (
						<DragDropContext
							onDragStart={(_start) => {
								const event = window.event as MouseEvent;
								if (event) {
									setDragStartPosition({ x: event.clientX, y: event.clientY });
									dragCurrentPositionRef.current = { x: event.clientX, y: event.clientY };
								}
							}}
							onDragEnd={handleBlockDragEnd}
						>
							<Droppable
								droppableId={`section-${props.id}`}
								direction={props.section.type === 'column' ? 'vertical' : 'horizontal'}
								type={`BLOCK-${props.id}`}
							>
								{(provided, _snapshot) => (
									<S.DroppableContainer
										ref={provided.innerRef}
										{...provided.droppableProps}
										$direction={props.section.type ?? ('row' as any)}
									>
										{(props.section.content || [])
											.filter((block) => block)
											.map((block: any, index: number) => {
												return (
													<Draggable
														key={block.id}
														draggableId={`block-${block.id}`}
														index={index}
														isDragDisabled={!currentPage?.editor.blockEditMode}
													>
														{(provided, _snapshot) => (
															<S.SubElementWrapper
																ref={provided.innerRef}
																{...provided.draggableProps}
																blockEditMode={currentPage.editor.blockEditMode}
																width={block?.width ?? 1}
															>
																{currentPage?.editor.blockEditMode &&
																	props.section.type !== 'column' &&
																	(!globalResizingBlockId || globalResizingBlockId === block.id) && (
																		<>
																			{(props.section.content?.length || 0) > 1 && index > 0 && (
																				<S.ResizeHandle
																					onMouseDown={(e) =>
																						handleResizeStart(e, block.id, block?.width ?? 1, false, 'left')
																					}
																					$side={'left'}
																				/>
																			)}
																			{index < (props.section.content?.length || 0) - 1 && (
																				<S.ResizeHandle
																					onMouseDown={(e) =>
																						handleResizeStart(e, block.id, block?.width ?? 1, false, 'right')
																					}
																					$side={'right'}
																				/>
																			)}
																		</>
																	)}

																{currentPage.editor.blockEditMode && (
																	<S.SubElementHeader
																		{...provided.dragHandleProps}
																		style={block.type === 'section' ? { display: 'none' } : undefined}
																	>
																		<S.SubElementHeaderAction>
																			<S.EDragWrapper>
																				<S.EDragHandler tabIndex={-1}>
																					<ReactSVG src={ICONS.drag} />
																				</S.EDragHandler>
																			</S.EDragWrapper>
																			<p>{getBlockLabel(block.type)}</p>
																		</S.SubElementHeaderAction>
																		<S.SubElementHeaderActions>
																			{(block.type === 'post' || block.type === 'postSpotlight') && block.txId && (
																				<IconButton
																					type={'alt1'}
																					active={false}
																					src={ICONS.edit}
																					handlePress={() => {
																						handlePageBlockChange({ ...block, txId: undefined }, index);
																					}}
																					dimensions={{ wrapper: 23.5, icon: 13.5 }}
																					tooltip={language?.editBlock}
																					tooltipPosition={'bottom-right'}
																					noFocus
																				/>
																			)}
																			{block.type === 'categorySpotlight' && block.categoryId && (
																				<IconButton
																					type={'alt1'}
																					active={false}
																					src={ICONS.edit}
																					handlePress={() => {
																						handlePageBlockChange({ ...block, categoryId: undefined }, index);
																					}}
																					dimensions={{ wrapper: 23.5, icon: 13.5 }}
																					tooltip={language?.editBlock}
																					tooltipPosition={'bottom-right'}
																					noFocus
																				/>
																			)}
																			<IconButton
																				type={'alt1'}
																				active={false}
																				src={ICONS.delete}
																				handlePress={() => deleteBlock(index)}
																				dimensions={{ wrapper: 23.5, icon: 13.5 }}
																				tooltip={language?.deleteBlock}
																				tooltipPosition={'bottom-right'}
																				noFocus
																			/>
																		</S.SubElementHeaderActions>
																	</S.SubElementHeader>
																)}

																<S.SubElementBody>
																	{getBlock(
																		{
																			...block,
																			parentDragHandleProps:
																				block.type === 'section' ? provided.dragHandleProps : undefined,
																		},
																		index
																	)}
																</S.SubElementBody>
															</S.SubElementWrapper>
														)}
													</Draggable>
												);
											})}
										{provided.placeholder}
									</S.DroppableContainer>
								)}
							</Droppable>
						</DragDropContext>
					) : (
						<S.BlockSelector>
							<S.ArticleBlocks>
								<ArticleBlocks type={'page'} addBlock={addBlock} context={'grid'} />
							</S.ArticleBlocks>
							<S.PageBlocks>
								<PageBlocks type={'page'} addBlock={addBlock} context={'grid'} />
								<Button
									type={'alt1'}
									label={language.addSection}
									handlePress={() => addBlock('section')}
									height={42.5}
									fullWidth
								/>
							</S.PageBlocks>
						</S.BlockSelector>
					)}
				</S.Element>
			</S.ElementWrapper>
		);
	}

	let section: React.ReactNode;
	if (currentPage.editor.blockEditMode) {
		section = (
			<Draggable draggableId={props.id} index={props.index}>
				{(provided) => (
					<S.ElementDragWrapper ref={provided.innerRef} {...provided.draggableProps} tabIndex={-1}>
						<S.EDragWrapper {...(props.parentDragHandleProps || provided.dragHandleProps)}>
							<S.EDragHandler tabIndex={-1}>
								<ReactSVG src={ICONS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
						{getElement()}
					</S.ElementDragWrapper>
				)}
			</Draggable>
		);
	} else section = <S.DefaultElementWrapper>{getElement()}</S.DefaultElementWrapper>;

	return (
		<>
			<Panel
				open={showSelector}
				header={language?.addBlock}
				handleClose={() => setShowSelector(false)}
				width={500}
				className={'modal-wrapper'}
			>
				<S.BlockSelectorColumn>
					<PageBlocks type={'page'} addBlock={addBlock} context={'grid'} />
					<ArticleBlocks type={'page'} addBlock={addBlock} context={'grid'} />
					<S.BlockSelectorActions>
						<Button
							type={'alt1'}
							label={language.addSection}
							handlePress={() => addBlock('section')}
							height={42.5}
							fullWidth
						/>
						<Button
							type={'primary'}
							label={language.close}
							handlePress={() => setShowSelector(false)}
							height={42.5}
							fullWidth
						/>
					</S.BlockSelectorActions>
				</S.BlockSelectorColumn>
			</Panel>
			{section}
		</>
	);
}
