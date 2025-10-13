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
	const [blockSelectorPosition, setBlockSelectorPosition] = React.useState<'below' | 'above'>('below');

	const prevMarkupRef = React.useRef(currentPost.editor.markup);
	const isApplyingMarkupRef = React.useRef(false);
	const wasEmptyRef = React.useRef(false);
	const isUserInitiatedChangeRef = React.useRef(false);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	// Apply markup formatting to selected text
	function applyMarkup(markupType: 'bold' | 'italic' | 'underline' | 'strikethrough') {
		if (!editableRef.current) return;

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		// Only apply if there's a selection or cursor is in this block
		if (!editableRef.current.contains(selection.anchorNode)) return;

		// Don't allow markup in code blocks
		if (props.block.type === 'code') {
			return;
		}

		// Map markup types to execCommand names
		const commandMap = {
			bold: 'bold',
			italic: 'italic',
			underline: 'underline',
			strikethrough: 'strikethrough',
		};

		// Set flag to prevent state update loop
		isApplyingMarkupRef.current = true;

		// Check if this is a selection (not just cursor position)
		if (!selection.isCollapsed) {
			// Check if we have mixed content by using the current Redux state
			// If button is inactive, it means not ALL text has the formatting (mixed or none)
			const buttonIsActive = currentPost.editor.markup[markupType];

			// Only apply formatting if button is active (all text has it - remove it)
			// or if button is inactive AND no text has it (apply it)
			// Skip if button is inactive but some text has it (mixed state)

			const range = selection.getRangeAt(0);
			const fragment = range.cloneContents();
			const div = document.createElement('div');
			div.appendChild(fragment);

			const tagMap = {
				bold: ['B', 'STRONG'],
				italic: ['I', 'EM'],
				underline: ['U'],
				strikethrough: ['STRIKE', 'S', 'DEL'],
			};

			const tags = tagMap[markupType];
			const hasAnyFormatting = tags.some((tag) => div.querySelector(tag) !== null);

			// If button is inactive (not all has formatting) and some parts DO have formatting = mixed state
			// In this case, don't apply any changes
			if (!buttonIsActive && hasAnyFormatting) {
				// Mixed content - don't change anything
				isApplyingMarkupRef.current = false;
				return;
			}
		}

		// Execute the command
		document.execCommand(commandMap[markupType], false);

		// Update block content with new HTML
		const updatedContent = editableRef.current.innerHTML;
		props.onChangeBlock({ id: props.block.id, content: updatedContent });

		// Reset flag after a short delay
		setTimeout(() => {
			isApplyingMarkupRef.current = false;
		}, 100);
	}

	// Detect active formatting at cursor/selection and update Redux state
	const updateMarkupState = React.useCallback(() => {
		if (!editableRef.current || isApplyingMarkupRef.current) return;

		const selection = window.getSelection();
		if (!selection || !editableRef.current.contains(selection.anchorNode)) return;

		// Only update if this block is focused
		if (currentPost.editor.focusedBlock?.id !== props.block.id) return;

		// For code blocks, always set markup to false
		if (props.block.type === 'code') {
			const markupState = {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
			};

			Object.entries(markupState).forEach(([key, value]) => {
				if (currentPost.editor.markup[key as keyof typeof markupState] !== value) {
					handleCurrentPostUpdate({ field: `markup.${key}`, value });
				}
			});
			return;
		}

		// Check formatting state for the selection
		const markupState = {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
		};

		if (!selection.isCollapsed && selection.rangeCount > 0) {
			// For selections, check if the ENTIRE selection has the formatting
			const range = selection.getRangeAt(0);

			// Map of format types to their possible HTML tags
			const tagMap = {
				bold: ['B', 'STRONG'],
				italic: ['I', 'EM'],
				underline: ['U'],
				strikethrough: ['STRIKE', 'S', 'DEL'],
			};

			// Check each format type by walking through the selection
			Object.keys(tagMap).forEach((formatType) => {
				const tags = tagMap[formatType as keyof typeof tagMap];

				// Create a tree walker to iterate through all text nodes in the selection
				const fragment = range.cloneContents();
				const div = document.createElement('div');
				div.appendChild(fragment);

				// Get all text nodes
				const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null);

				let hasUnformattedText = false;
				let node;

				while ((node = walker.nextNode())) {
					const textNode = node as Text;
					const text = textNode.textContent || '';

					// Skip empty or whitespace-only text nodes
					if (text.trim().length === 0) continue;

					// Check if this text node has a formatting ancestor
					let hasFormatting = false;
					let parent = textNode.parentElement;

					while (parent && parent !== div) {
						if (tags.includes(parent.tagName)) {
							hasFormatting = true;
							break;
						}
						parent = parent.parentElement;
					}

					if (!hasFormatting) {
						hasUnformattedText = true;
						break;
					}
				}

				// Button is active only if ALL text has the formatting
				markupState[formatType as keyof typeof markupState] =
					!hasUnformattedText && div.textContent?.trim().length! > 0;
			});
		} else {
			// For cursor position (no selection), use queryCommandState
			markupState.bold = document.queryCommandState('bold');
			markupState.italic = document.queryCommandState('italic');
			markupState.underline = document.queryCommandState('underline');
			markupState.strikethrough = document.queryCommandState('strikethrough');
		}

		// Update Redux only if changed to avoid loops
		Object.entries(markupState).forEach(([key, value]) => {
			if (currentPost.editor.markup[key as keyof typeof markupState] !== value) {
				handleCurrentPostUpdate({ field: `markup.${key}`, value });
			}
		});
	}, [currentPost.editor.focusedBlock?.id, currentPost.editor.markup, props.block.id, props.block.type]);

	React.useEffect(() => {
		const currentBlockIndex = currentPost.data?.content?.findIndex(
			(block: ArticleBlockType) => block?.id === currentPost.editor?.focusedBlock?.id
		);
		const currentBlock = currentPost.data?.content?.[currentBlockIndex];
		if (currentBlock?.id === props.block?.id) {
			if (currentBlock.content === '/') {
				// Determine position based on block's location in viewport
				if (editableRef.current) {
					const rect = editableRef.current.getBoundingClientRect();
					const windowHeight = window.innerHeight;
					const blockMiddle = rect.top + rect.height / 2;

					// If block is in bottom half of screen, show selector above
					setBlockSelectorPosition(blockMiddle > windowHeight / 2 ? 'above' : 'below');
				}

				setShowBlockSelector(true);
				handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: true });
			} else if (currentBlock.content === '-' || currentBlock.content === '- ') {
				// Shortcut: Convert to unordered list when user types '-'
				handleChangeBlock(ArticleBlockEnum.UnorderedList);
			} else if (currentBlock.content === '+' || currentBlock.content === '+ ') {
				// Shortcut: Convert to solid divider when user types '+'
				handleChangeBlock(ArticleBlockEnum.DividerSolid);
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
				// Update markup state when selection changes
				// Use setTimeout to ensure state updates happen after selection is finalized
				setTimeout(() => updateMarkupState(), 0);
			} else {
				setSelectedText('');
			}
		};

		document.addEventListener('selectionchange', handleSelectionChange);

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
		};
	}, [currentPost.editor.focusedBlock?.id, props.block.id, updateMarkupState]);

	// Force markup state update when content changes (e.g., after applying formatting)
	React.useEffect(() => {
		// Only update if this block is focused and not currently applying markup
		if (currentPost.editor.focusedBlock?.id === props.block.id && !isApplyingMarkupRef.current) {
			// Small delay to ensure DOM has updated
			const timeoutId = setTimeout(() => {
				updateMarkupState();
			}, 50);
			return () => clearTimeout(timeoutId);
		}
	}, [props.block.content, currentPost.editor.focusedBlock?.id, props.block.id, updateMarkupState]);

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

	// Handle keyboard shortcuts for markup (Cmd/Ctrl + B/I/U/X) and Enter in lists
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle if this block is focused
			if (currentPost.editor.focusedBlock?.id !== props.block.id) return;

			// Handle Enter key in list items to clear formatting
			if (e.key === 'Enter' && (props.block.type === 'ordered-list' || props.block.type === 'unordered-list')) {
				// Don't prevent default - let the browser create the new <li>
				// But clear all formatting after the new line is created
				setTimeout(() => {
					// Clear all markup state
					['bold', 'italic', 'underline', 'strikethrough'].forEach((type) => {
						handleCurrentPostUpdate({ field: `markup.${type}`, value: false });
					});

					// Also use execCommand to remove any lingering formatting context
					if (editableRef.current && document.activeElement === editableRef.current) {
						['bold', 'italic', 'underline', 'strikethrough'].forEach((format) => {
							if (document.queryCommandState(format)) {
								document.execCommand(format, false);
							}
						});
					}
				}, 0);
			}

			// Check for Cmd (Mac) or Ctrl (Windows/Linux)
			if (e.metaKey || e.ctrlKey) {
				let markupType: 'bold' | 'italic' | 'underline' | 'strikethrough' | null = null;

				switch (e.key.toLowerCase()) {
					case 'b':
						markupType = 'bold';
						break;
					case 'i':
						markupType = 'italic';
						break;
					case 'u':
						markupType = 'underline';
						break;
					case 'x':
						markupType = 'strikethrough';
						break;
				}

				if (markupType) {
					e.preventDefault();
					// Mark this as a user-initiated change
					isUserInitiatedChangeRef.current = true;
					// Toggle the markup state in Redux
					const currentState = currentPost.editor.markup[markupType];
					handleCurrentPostUpdate({ field: `markup.${markupType}`, value: !currentState });
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentPost.editor.focusedBlock?.id, currentPost.editor.markup, props.block.id, props.block.type]);

	// Listen for markup state changes from Redux and apply formatting
	React.useEffect(() => {
		const prevMarkup = prevMarkupRef.current;
		const currentMarkup = currentPost.editor.markup;

		// Only apply if this block is focused
		if (currentPost.editor.focusedBlock?.id !== props.block.id) return;

		// Check if this change was user-initiated (keyboard or toolbar button)
		const isUserInitiated = isUserInitiatedChangeRef.current || currentPost.editor.markupUserInitiated;

		// Check each markup type and apply if it changed
		const markupTypes: Array<'bold' | 'italic' | 'underline' | 'strikethrough'> = [
			'bold',
			'italic',
			'underline',
			'strikethrough',
		];

		markupTypes.forEach((type) => {
			if (prevMarkup[type] !== currentMarkup[type]) {
				// Only apply markup if this was a user-initiated change (keyboard/toolbar)
				// Don't apply if the change was just from updateMarkupState detecting selection
				if (isUserInitiated) {
					applyMarkup(type);
				}
			}
		});

		// Reset the flags after processing
		isUserInitiatedChangeRef.current = false;
		if (currentPost.editor.markupUserInitiated) {
			handleCurrentPostUpdate({ field: 'markupUserInitiated', value: false });
		}

		// Update ref with current values
		prevMarkupRef.current = currentMarkup;
	}, [
		currentPost.editor.markup,
		currentPost.editor.markupUserInitiated,
		currentPost.editor.focusedBlock?.id,
		props.block.id,
	]);

	// Clear markup state when this block becomes focused and is empty or new
	React.useEffect(() => {
		if (currentPost.editor.focusedBlock?.id === props.block.id) {
			// Small delay to ensure editable ref is ready
			setTimeout(() => {
				// If this is a newly added empty block, force clear all markup
				if (props.block.id === currentPost.editor.lastAddedBlockId && !props.block.content) {
					// Force all markup to false for new blocks
					['bold', 'italic', 'underline', 'strikethrough'].forEach((type) => {
						if (currentPost.editor.markup[type as keyof typeof currentPost.editor.markup]) {
							handleCurrentPostUpdate({ field: `markup.${type}`, value: false });
						}
					});

					// Also clear the browser's formatting state
					if (editableRef.current) {
						['bold', 'italic', 'underline', 'strikethrough'].forEach((format) => {
							if (document.queryCommandState(format)) {
								document.execCommand(format, false);
							}
						});
					}
				} else {
					// For existing blocks, detect the actual formatting
					updateMarkupState();
				}
			}, 50);
		}
	}, [currentPost.editor.focusedBlock?.id, props.block.id, currentPost.editor.lastAddedBlockId]);

	// Clear markup toggles when block content transitions from non-empty to empty
	React.useEffect(() => {
		// Only check if this block is focused
		if (currentPost.editor.focusedBlock?.id !== props.block.id) {
			wasEmptyRef.current = false;
			return;
		}
		if (!editableRef.current) return;

		// Check if content is empty (empty string, just whitespace, or empty HTML tags)
		const isEmpty =
			!props.block.content ||
			props.block.content.trim() === '' ||
			props.block.content === '<br>' ||
			props.block.content === '<li></li>' ||
			props.block.content.replace(/<[^>]*>/g, '').trim() === '';

		// Only clear formatting if content JUST became empty (transition)
		if (isEmpty && !wasEmptyRef.current) {
			wasEmptyRef.current = true;

			// Clear ALL markup state when content becomes empty (force all to false)
			(['bold', 'italic', 'underline', 'strikethrough'] as const).forEach((type) => {
				handleCurrentPostUpdate({ field: `markup.${type}`, value: false });
			});

			// Nuclear option: completely reset the element's innerHTML to clear formatting context
			// Save selection position
			const selection = window.getSelection();
			const wasInside = selection && editableRef.current.contains(document.activeElement);

			if (wasInside) {
				// Clear the innerHTML completely
				editableRef.current.innerHTML = '';

				// Trigger the onChange to sync with parent state
				props.onChangeBlock({ id: props.block.id, content: '' });

				// Restore focus and cursor position
				setTimeout(() => {
					if (editableRef.current) {
						editableRef.current.focus();
						const range = document.createRange();
						const sel = window.getSelection();
						range.selectNodeContents(editableRef.current);
						range.collapse(true);
						sel?.removeAllRanges();
						sel?.addRange(range);

						// Double-check: clear any formatting commands
						['bold', 'italic', 'underline', 'strikethrough'].forEach((format) => {
							if (document.queryCommandState(format)) {
								document.execCommand(format, false);
							}
						});
						document.execCommand('removeFormat', false);

						// Force update markup state after everything is cleared
						updateMarkupState();
					}
				}, 0);
			}
		} else if (!isEmpty) {
			wasEmptyRef.current = false;
		}
	}, [props.block.content, currentPost.editor.focusedBlock?.id, props.block.id]);

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
		case 'divider-solid':
			useCustom = true;
			element = <div className={'article-divider-solid'} />;
			break;
		case 'divider-dashed':
			useCustom = true;
			element = <div className={'article-divider-dashed'} />;
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
								position={blockSelectorPosition}
								className={'border-wrapper-alt1 scroll-wrapper-hidden'}
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
