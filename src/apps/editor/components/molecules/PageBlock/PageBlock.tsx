import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { Draggable } from '@hello-pangea/dnd';

import { EditorStoreRootState } from 'editor/store';

import { IconButton } from 'components/atoms/IconButton';
import { ICONS } from 'helpers/config';
import { PageBlockType } from 'helpers/types';
import { capitalize } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import { ArticleBlocks } from '../ArticleBlocks';

import { FeedBlock } from './FeedBlock';
import * as S from './styles';

// TODO: Row / column select
// TODO: Block width resize
// TODO: Delete block
// TODO: Article block
export default function PageBlock(props: { id: string; block: PageBlockType; index: number }) {
	const currentPage = useSelector((state: EditorStoreRootState) => state.currentPage);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

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

	function getSubElement(block: any) {
		switch (block.type) {
			case 'feed':
				return <FeedBlock block={block} />;
			default:
				return null;
		}
	}

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
								<S.SubElementWrapper key={index} width={subBlock.width}>
									<S.SubElementHeader>
										<p>{capitalize(subBlock.type)}</p>
									</S.SubElementHeader>
									<S.SubElementBody>{getSubElement(subBlock)}</S.SubElementBody>
								</S.SubElementWrapper>
							);
						})
					) : (
						<S.BlockSelector>
							<ArticleBlocks addBlock={() => {}} context={'grid'} />
						</S.BlockSelector>
					)}
				</S.Element>
			</S.ElementWrapper>
		);
	}

	if (currentPage.editor.blockEditMode) {
		return (
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
	}

	return <S.DefaultElementWrapper>{getElement()}</S.DefaultElementWrapper>;
}
