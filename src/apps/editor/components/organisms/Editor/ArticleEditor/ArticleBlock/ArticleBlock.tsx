import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { Draggable } from '@hello-pangea/dnd';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ARTICLE_BLOCKS, ICONS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlockType } from 'helpers/types';
import { validateUrl } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { CloseHandler } from 'wrappers/CloseHandler';

import { ArticleBlocks } from '../ArticleBlocks';

import { MediaBlock } from './CustomBlocks/MediaBlock';
import * as S from './styles';

export default function ArticleBlock(props: {
	index: number;
	block: ArticleBlockType;
	onChangeBlock: (args: { id: string; content: string; type?: any; data?: any }) => void;
	onDeleteBlock: (id: string) => void;
	onFocus: () => void;
}) {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const editableRef = React.useRef<HTMLDivElement>(null);

	const [selectedText, setSelectedText] = React.useState<string>('');
	const [textToConvert, setTextToConvert] = React.useState<string>('');
	const [newLinkUrl, setNewLinkUrl] = React.useState<string>('');
	const [showBlockSelector, setShowBlockSelector] = React.useState<boolean>(false);
	const [showLinkModal, setShowLinkModal] = React.useState<boolean>(false);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	React.useEffect(() => {
		const currentBlockIndex = currentPost.data?.content?.findIndex(
			(block: ArticleBlockType) => block?.id === currentPost.editor?.focusedBlock?.id
		);
		const currentBlock = currentPost.data?.content?.[currentBlockIndex];
		if (currentBlock?.id === props.block?.id) {
			if (currentBlock.content === '/') {
				setShowBlockSelector(true);
				handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: true });
			} else {
				setShowBlockSelector(false);
				// Only set toggleBlockFocus to false if this block was the one that had it active
				if (currentPost.editor.toggleBlockFocus) {
					handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: false });
				}
			}
		} else {
			setShowBlockSelector(false);
			// Don't interfere with toggleBlockFocus if this block is not the focused one
		}
	}, [props.block?.id, currentPost.data?.content, currentPost.editor?.focusedBlock]);

	React.useEffect(() => {
		const handleSelectionChange = () => {
			const selection = window.getSelection();
			if (editableRef.current && editableRef.current.contains(selection?.anchorNode)) {
				setSelectedText(selection?.toString() || '');
			} else {
				setSelectedText('');
			}
		};

		document.addEventListener('selectionchange', handleSelectionChange);

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
		};
	}, []);

	React.useEffect(() => {
		const handleLinkClick = (e: MouseEvent) => {
			const target = e.target as HTMLAnchorElement;

			if (target.tagName === 'A') {
				e.stopPropagation();
				e.preventDefault();
				window.open(target.href, target.target || '_blank', 'noopener,noreferrer');
			}
		};

		const editableElement = editableRef.current;
		if (editableElement) {
			editableElement.addEventListener('click', handleLinkClick);
		}

		return () => {
			if (editableElement) {
				editableElement.removeEventListener('click', handleLinkClick);
			}
		};
	}, []);

	function handleChangeBlock(type: ArticleBlockEnum) {
		let content: string = '';

		// Set proper content for different block types
		switch (type) {
			case 'ordered-list':
			case 'unordered-list':
				content = '<li></li>';
				break;
			case 'paragraph':
			case 'quote':
			case 'code':
			case 'header-1':
			case 'header-2':
			case 'header-3':
			case 'header-4':
			case 'header-5':
			case 'header-6':
			case 'image':
			case 'video':
			default:
				content = '';
				break;
		}

		props.onChangeBlock({ id: props.block.id, type: type, content: content });
		setShowBlockSelector(false);
		handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: false });
		handleCurrentPostUpdate({ field: 'lastAddedBlockId', value: props.block.id });

		// Focus the ContentEditable after block type change
		setTimeout(() => {
			if (editableRef.current) {
				editableRef.current.focus();
			}
		}, 0);
	}

	const savedRangeRef = React.useRef<Range | null>(null);

	function restoreSelection() {
		if (savedRangeRef.current) {
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				selection.addRange(savedRangeRef.current);
			}
		}
	}

	function handleLinkModalOpen() {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			setTextToConvert(selectedText);
			savedRangeRef.current = selection.getRangeAt(0).cloneRange();
		}
		setShowLinkModal(true);
	}

	function handleLinkSave() {
		if (validateUrl(newLinkUrl)) {
			restoreSelection();
			if (!editableRef.current) {
				console.log('Editable element not found.');
				return;
			}

			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) {
				console.log('No selection available.');
				handleLinkClear();
				return;
			}

			const range = selection.getRangeAt(0);
			if (range.collapsed) {
				console.log('Selection is collapsed.');
				handleLinkClear();
				return;
			}

			if (!editableRef.current.contains(range.commonAncestorContainer)) {
				console.log('Selection is outside the editable area.');
				handleLinkClear();
				return;
			}

			const anchor = document.createElement('a');
			if (validateUrl(newLinkUrl)) {
				anchor.href = newLinkUrl;
				anchor.target = '_blank';
				anchor.rel = 'noopener noreferrer';
				anchor.setAttribute('data-link-id', `${Date.now()}`);
			}

			const extractedContent = range.extractContents();
			if (textToConvert && textToConvert !== extractedContent.textContent) {
				anchor.textContent = textToConvert;
			} else {
				anchor.appendChild(extractedContent);
			}

			range.insertNode(anchor);

			range.setStartAfter(anchor);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);

			const updatedContent = editableRef.current.innerHTML;
			console.log('Updated raw HTML content:', updatedContent);

			props.onChangeBlock({ id: props.block.id, content: updatedContent });
		}

		handleLinkClear();
	}

	function handleLinkClear() {
		setTextToConvert('');
		setShowLinkModal(false);
		setNewLinkUrl('');
	}

	function handleSelectorClose() {
		setShowBlockSelector(false);
		props.onChangeBlock({ id: props.block.id, content: '' });
	}

	let useCustom: boolean = false;
	let element: any = null;

	switch (props.block.type) {
		case 'paragraph':
			element = 'p';
			break;
		case 'quote':
			element = 'blockquote';
			break;
		case 'ordered-list':
			element = 'ol';
			break;
		case 'unordered-list':
			element = 'ul';
			break;
		case 'code':
			element = 'code';
			break;
		case 'header-1':
			element = 'h1';
			break;
		case 'header-2':
			element = 'h2';
			break;
		case 'header-3':
			element = 'h3';
			break;
		case 'header-4':
			element = 'h4';
			break;
		case 'header-5':
			element = 'h5';
			break;
		case 'header-6':
			element = 'h6';
			break;
		case 'image':
			useCustom = true;
			element = (
				<MediaBlock
					type={'image'}
					content={props.block.content}
					data={props.block.data ?? null}
					onChange={(newContent: any, data: any) =>
						props.onChangeBlock({ id: props.block.id, content: newContent, data: data })
					}
				/>
			);
			break;
		case 'video':
			useCustom = true;
			element = (
				<MediaBlock
					type={'video'}
					content={props.block.content}
					data={props.block.data ?? null}
					onChange={(newContent: any, data: any) =>
						props.onChangeBlock({ id: props.block.id, content: newContent, data: data })
					}
				/>
			);
			break;
		default:
			element = 'p';
			break;
	}

	function getElementToolbar() {
		return (
			<S.ElementToolbar tabIndex={-1}>
				<S.EToolbarHeader>
					<span>{ARTICLE_BLOCKS[props.block.type].label}</span>
				</S.EToolbarHeader>
				<S.EToolbarActions>
					{currentPost?.editor.focusedBlock?.id === props.block.id &&
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
						)}
					<IconButton
						type={'alt1'}
						active={false}
						src={ICONS.delete}
						handlePress={() => props.onDeleteBlock(props.block.id)}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language?.deleteBlock}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.EToolbarActions>
			</S.ElementToolbar>
		);
	}

	const invalidLink = newLinkUrl?.length > 0 && !validateUrl(newLinkUrl);

	function getElement() {
		const ToolbarWrapper: any = currentPost?.editor.blockEditMode ? S.ElementToolbarWrapper : S.ElementToolbarToggle;

		return (
			<>
				<S.ElementWrapper
					type={props.block.type}
					blockEditMode={currentPost?.editor.blockEditMode}
					onFocus={props.onFocus}
					className={'fade-in'}
				>
					<ToolbarWrapper className={'fade-in'} type={props.block.type}>
						{getElementToolbar()}
					</ToolbarWrapper>
					<S.Element blockEditMode={currentPost?.editor.blockEditMode} type={props.block.type}>
						{useCustom ? (
							element
						) : (
							<ContentEditable
								ref={editableRef}
								element={element}
								value={props.block.content}
								onChange={(newContent: any) => props.onChangeBlock({ id: props.block.id, content: newContent })}
								autoFocus={props.block?.id === currentPost?.editor.lastAddedBlockId}
							/>
						)}
					</S.Element>
					{!currentPost?.editor.blockEditMode && (
						<S.ElementIndicatorDivider type={props.block.type} className={'fade-in'} />
					)}
					{showBlockSelector && (
						<CloseHandler active={true} disabled={false} callback={handleSelectorClose}>
							<S.BlockSelector
								blockEditMode={currentPost.editor.blockEditMode}
								className={'border-wrapper-primary scroll-wrapper-hidden'}
							>
								<ArticleBlocks
									addBlock={(type: ArticleBlockEnum) => handleChangeBlock(type)}
									handleClose={handleSelectorClose}
									context={'inline'}
								/>
							</S.BlockSelector>
						</CloseHandler>
					)}
				</S.ElementWrapper>
				{showLinkModal && (
					<Modal header={language?.editLink} handleClose={() => setShowLinkModal(false)}>
						<S.ModalWrapper>
							<FormField
								value={textToConvert}
								onChange={(e: any) => setTextToConvert(e.target.value)}
								invalid={{ status: false, message: null }}
								label={language?.text}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<FormField
								value={newLinkUrl}
								onChange={(e: any) => setNewLinkUrl(e.target.value)}
								invalid={{ status: invalidLink, message: null }}
								label={language?.url}
								placeholder={'https://'}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<S.ModalActionsWrapper>
								<Button type={'primary'} label={language?.cancel} handlePress={() => handleLinkClear()} />
								<Button type={'alt1'} label={language?.save} handlePress={() => handleLinkSave()} disabled={false} />
							</S.ModalActionsWrapper>
						</S.ModalWrapper>
					</Modal>
				)}
			</>
		);
	}

	if (currentPost.editor.blockEditMode) {
		return (
			<Draggable draggableId={props.block.id} index={props.index}>
				{(provided) => (
					<S.ElementDragWrapper
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						onFocus={props.onFocus}
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
