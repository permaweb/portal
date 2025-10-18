import React from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { Draggable } from '@hello-pangea/dnd';

import { EditorStoreRootState } from 'editor/store';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Panel } from 'components/atoms/Panel';
import { ICONS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType, PageBlockEnum, PageBlockType, PageSectionType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleBlock } from '../ArticleBlock';
import { ArticleBlocks } from '../ArticleBlocks';
import { PageBlocks } from '../PageBlocks';

import { FeedBlock } from './FeedBlock';
import * as S from './styles';

// TODO: Row / column select
// TODO: Block width resize
// TODO: Delete block
// TODO: Article block
export default function PageBlock(props: {
	id: string;
	index: number;
	block: PageSectionType;
	onChangeSection: (block: PageSectionType, index: number) => void;
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
					<span>{props.block?.type ? capitalize(props.block.type) : '-'}</span>
				</S.EToolbarHeader>
				<S.EToolbarActions>
					{/* {currentPost?.editor.focusedBlock?.id === props.block.id &&
						(selectedText?.length || textToConvert.length) > 0 && (
							<S.SelectionWrapper className={'fade-in'}>
								<Button
									type={'alt3'}
									label={language?.link}
									handlePress={() => handleLinkModalOpen()}
									icon={ICONS.link}
									iconLeftAlign
								/>
							</S.SelectionWrapper>
						)} */}
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
						handlePress={() => {}}
						// handlePress={() => props.onDeleteBlock(props.block.id)}
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
			width: 1,
		};

		const updatedSection = {
			...props.block,
			content: [...(props.block.content ?? []), newBlock],
		};

		props.onChangeSection(updatedSection, props.index);

		if (showSelector) setShowSelector(false);
	};

	const handleBlockChange = (args: { id: string; content: string; type?: any; data?: any }) => {
		console.log(args);
		console.log(props.block);
		// const updatedBlocks = [...currentPost.data.content].map((block) =>
		// 	block.id === args.id
		// 		? { ...block, content: args.content, type: args.type ?? block.type, data: args.data ?? block.data ?? null }
		// 		: block
		// );
		// handleCurrentPostUpdate({ field: 'content', value: updatedBlocks });
	};

	const deleteBlock = (id: string) => {
		console.log(id);
		// const updatedBlocks = [...currentPost.data.content].filter((block) => block.id !== id);
		// const deletedIndex = [...currentPost.data.content].findIndex((block) => block.id === id);

		// if (deletedIndex > 0) {
		// 	handleCurrentPostUpdate({ field: 'focusedBlock', value: updatedBlocks[deletedIndex - 1] });
		// } else if (updatedBlocks.length > 0) {
		// 	handleCurrentPostUpdate({ field: 'focusedBlock', value: updatedBlocks[0] });
		// } else {
		// 	handleCurrentPostUpdate({ field: 'focusedBlock', value: null });
		// }

		// handleCurrentPostUpdate({ field: 'content', value: updatedBlocks });
	};

	function getSubElement(block: any, index: number) {
		if (!block) return null;

		if (articleBlockTypes.includes(block.type)) {
			return (
				<ArticleBlock
					index={index}
					type={'page'}
					key={block.id}
					block={block}
					onChangeBlock={handleBlockChange}
					onDeleteBlock={deleteBlock}
					// onFocus={() => handleCurrentPageUpdate({ field: 'focusedBlock', value: block })}
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

	console.log(currentPage);

	function getElement() {
		const ToolbarWrapper: any = currentPage?.editor.blockEditMode ? S.ElementToolbarWrapper : S.ElementToolbarToggle;

		return (
			<S.ElementWrapper
				type={props.block.type}
				blockEditMode={currentPage?.editor.blockEditMode}
				// onFocus={props.onFocus}
				className={'fade-in'}
			>
				<ToolbarWrapper className={'fade-in'} type={props.block.type}>
					{getElementToolbar()}
				</ToolbarWrapper>
				<S.Element blockEditMode={currentPage?.editor.blockEditMode} type={props.block.type}>
					{props.block.content?.length ? (
						props.block.content.map((subBlock: any, index: number) => {
							return (
								<S.SubElementWrapper key={index} width={subBlock?.width ?? 1}>
									{/* <S.SubElementHeader>
										<p>{capitalize(subBlock.type)}</p>
									</S.SubElementHeader> */}
									<S.SubElementBody>{getSubElement(subBlock, index)}</S.SubElementBody>
								</S.SubElementWrapper>
							);
						})
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

	let section;
	if (currentPage.editor.blockEditMode) {
		section = (
			<Draggable draggableId={props.id} index={props.index}>
				{(provided) => (
					<S.ElementDragWrapper
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						// onFocus={props.onFocus}
						tabIndex={-1}
					>
						<S.EDragWrapper>
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
