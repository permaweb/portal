import React from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';

import { EditorStoreRootState } from 'editor/store';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { ARTICLE_BLOCKS, ICONS, PAGE_BLOCKS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType, PageBlockEnum, PageBlockType, PageSectionType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleBlock } from '../ArticleBlock';
import { ArticleBlocks } from '../ArticleBlocks';
import { PageBlocks } from '../PageBlocks';

import { FeedBlock } from './FeedBlock';
import * as S from './styles';

// TODO: Block width resize
// TODO: Custom HTML ArticleBlock
// TODO: Block / Text Alignment
// TODO: Row / column select
export default function PageSection(props: {
	id: string;
	index: number;
	section: PageSectionType;
	onChangeSection: (section: PageSectionType, index: number) => void;
	onDeleteSection: (index: number) => void;
}) {
	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [showSelector, setShowSelector] = React.useState<boolean>(false);

	const articleBlockTypes = Object.keys(ArticleBlockEnum).map((key) => ArticleBlockEnum[key]);

	function getElementToolbar() {
		return (
			<S.ElementToolbar tabIndex={-1}>
				<S.EToolbarHeader>
					<span>{props.section?.type ? capitalize(props.section.type) : '-'}</span>
				</S.EToolbarHeader>
				<S.EToolbarActions>
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
				</S.EToolbarActions>
			</S.ElementToolbar>
		);
	}

	const addBlock = (type: PageBlockEnum | ArticleBlockEnum) => {
		if (currentPage.editor.loading.active) return;

		let newBlock: PageBlockType | ArticleBlockType = null;
		let content: any = null;

		if (articleBlockTypes.includes(type)) {
			switch (type) {
				case 'ordered-list':
				case 'unordered-list':
					content = '<li></li>';
					break;
				default:
					content = '';
					break;
			}
		}

		newBlock = {
			id: Date.now().toString(),
			type: type as ArticleBlockEnum,
			content: content,
			layout: { separation: true },
			width: 1,
		};

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

	const deleteBlock = (index: number) => {
		const updatedBlocks = (props.section.content || []).filter((_, i) => i !== index);

		const updatedSection = {
			...props.section,
			content: updatedBlocks,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	const handleBlockDragEnd = (result: any) => {
		console.log('Block drag end in section', props.id, result);

		if (!result.destination) return;

		const items = Array.from(props.section.content || []);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		console.log('Reordered items:', items);

		const updatedSection = {
			...props.section,
			content: items,
		};

		props.onChangeSection(updatedSection, props.index);
	};

	function getBlock(block: any, index: number) {
		if (!block) return null;

		if (articleBlockTypes.includes(block.type)) {
			return (
				<ArticleBlock
					index={index}
					type={'page'}
					key={block.id}
					block={block}
					onChangeBlock={handleArticleBlockChange}
					onDeleteBlock={() => {}}
					onFocus={() => {}}
				/>
			);
		}
		switch (block.type) {
			case 'feed':
				return <FeedBlock block={block} />;
			default:
				return <p>{block.type}</p>;
		}
	}

	function getBlockLabel(type: string) {
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
						<DragDropContext onDragEnd={handleBlockDragEnd}>
							<Droppable
								droppableId={`section-${props.id}`}
								direction={props.section.type === 'column' ? 'vertical' : 'horizontal'}
							>
								{(provided, _snapshot) => (
									<S.DroppableContainer
										ref={provided.innerRef}
										{...provided.droppableProps}
										$direction={props.section.type ?? 'row'}
									>
										{props.section.content.map((block: any, index: number) => {
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
															width={block?.width ?? 1}
														>
															<S.SubElementHeader {...provided.dragHandleProps}>
																<S.SubElementHeaderAction>
																	<S.EDragWrapper>
																		<S.EDragHandler tabIndex={-1}>
																			<ReactSVG src={ICONS.drag} />
																		</S.EDragHandler>
																	</S.EDragWrapper>
																	<p>{getBlockLabel(block.type)}</p>
																</S.SubElementHeaderAction>
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
															</S.SubElementHeader>
															<S.SubElementBody>{getBlock(block, index)}</S.SubElementBody>
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
							<PageBlocks type={'page'} addBlock={addBlock} context={'grid'} />
							<ArticleBlocks type={'page'} addBlock={addBlock} context={'grid'} />
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
						<S.EDragWrapper {...provided.dragHandleProps}>
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
				closeHandlerDisabled={true}
				className={'modal-wrapper'}
			>
				<S.BlockSelectorColumn>
					<PageBlocks type={'page'} addBlock={addBlock} context={'grid'} />
					<ArticleBlocks type={'page'} addBlock={addBlock} context={'grid'} />
					<S.BlockSelectorActions>
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
