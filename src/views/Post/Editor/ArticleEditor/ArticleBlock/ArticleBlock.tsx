import React from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { Draggable } from '@hello-pangea/dnd';

import { Button } from 'components/atoms/Button';
import { ContentEditable } from 'components/atoms/ContentEditable';
import { FormField } from 'components/atoms/FormField';
import { IconButton } from 'components/atoms/IconButton';
import { Modal } from 'components/atoms/Modal';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { validateUrl } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { RootState } from 'store';

import { MediaBlock } from './CustomBlocks/MediaBlock';
import * as S from './styles';
import { IProps } from './types';

export default function ArticleBlock(props: IProps) {
	const currentPost = useSelector((state: RootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const [selectedText, setSelectedText] = React.useState<string>('');
	const [textToConvert, setTextToConvert] = React.useState<string>('');
	const [newLinkUrl, setNewLinkUrl] = React.useState<string>('');
	const [showLinkModal, setShowLinkModal] = React.useState<boolean>(false);

	const editableRef = React.useRef<HTMLDivElement>(null);

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

			props.onChangeBlock(props.block.id, updatedContent);
		}

		handleLinkClear();
	}

	function handleLinkClear() {
		setTextToConvert('');
		setShowLinkModal(false);
		setNewLinkUrl('');
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
					onChange={(newContent: any, data: any) => props.onChangeBlock(props.block.id, newContent, data)}
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
					onChange={(newContent: any, data: any) => props.onChangeBlock(props.block.id, newContent, data)}
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
									label={language.link}
									handlePress={() => handleLinkModalOpen()}
									icon={ASSETS.link}
									iconLeftAlign
								/>
							</S.SelectionWrapper>
						)}
					<IconButton
						type={'alt1'}
						active={false}
						src={ASSETS.delete}
						handlePress={() => props.onDeleteBlock(props.block.id)}
						dimensions={{ wrapper: 23.5, icon: 13.5 }}
						tooltip={language.deleteBlock}
						tooltipPosition={'bottom-right'}
						noFocus
					/>
				</S.EToolbarActions>
			</S.ElementToolbar>
		);
	}

	const invalidLink = newLinkUrl?.length > 0 && !validateUrl(newLinkUrl);

	function getElement() {
		const ToolbarWrapper = currentPost?.editor.blockEditMode ? S.ElementToolbarWrapper : S.ElementToolbarToggle;

		return (
			<>
				<S.ElementWrapper
					type={props.block.type}
					blockEditMode={currentPost?.editor.blockEditMode}
					onFocus={props.onFocus}
					className={'fade-in'}
				>
					<ToolbarWrapper className={'fade-in'}>{getElementToolbar()}</ToolbarWrapper>
					<S.Element blockEditMode={currentPost?.editor.blockEditMode} type={props.block.type}>
						{useCustom ? (
							element
						) : (
							<ContentEditable
								ref={editableRef}
								element={element}
								value={props.block.content}
								onChange={(newContent: any) => props.onChangeBlock(props.block.id, newContent)}
								autoFocus={props.block?.id === currentPost?.editor.lastAddedBlockId}
							/>
						)}
					</S.Element>
					{!currentPost?.editor.blockEditMode && <S.ElementIndicatorDivider className={'fade-in'} />}
				</S.ElementWrapper>
				{showLinkModal && (
					<Modal header={language.editLink} handleClose={() => setShowLinkModal(false)}>
						<S.ModalWrapper>
							<FormField
								value={textToConvert}
								onChange={(e: any) => setTextToConvert(e.target.value)}
								invalid={{ status: false, message: null }}
								label={language.text}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<FormField
								value={newLinkUrl}
								onChange={(e: any) => setNewLinkUrl(e.target.value)}
								invalid={{ status: invalidLink, message: null }}
								label={language.url}
								placeholder={'https://'}
								disabled={false}
								hideErrorMessage
								sm
							/>
							<S.ModalActionsWrapper>
								<Button type={'primary'} label={language.cancel} handlePress={() => handleLinkClear()} />
								<Button type={'alt1'} label={language.save} handlePress={() => handleLinkSave()} disabled={false} />
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
								<ReactSVG src={ASSETS.drag} />
							</S.EDragHandler>
						</S.EDragWrapper>
						{getElement()}
					</S.ElementDragWrapper>
				)}
			</Draggable>
		);
	}

	return getElement();
}
