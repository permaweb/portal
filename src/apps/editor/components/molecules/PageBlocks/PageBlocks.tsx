import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { EditorStoreRootState } from 'editor/store';
import { currentPageUpdate } from 'editor/store/page';
import { currentPostUpdate } from 'editor/store/post';

import { PAGE_BLOCKS } from 'helpers/config';
import { ArticleBlocksContextType, PageBlockEnum } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function PageBlocks(props: {
	type: 'post' | 'page';
	addBlock: (type: PageBlockEnum) => void;
	handleClose?: () => void;
	context?: ArticleBlocksContextType;
}) {
	const dispatch = useDispatch();

	const currentReducer = useSelector((state: EditorStoreRootState) => {
		switch (props.type) {
			case 'post':
				return state.currentPost;
			case 'page':
				return state.currentPage;
			default:
				return state.currentPost;
		}
	});

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const blockRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

	const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
	const [totalBlockCount, setTotalBlockCount] = React.useState(0);

	const handleCurrentReducerUpdate = (updatedField: { field: string; value: any }) => {
		let currentReducerUpdate = null;
		switch (props.type) {
			case 'post':
				currentReducerUpdate = currentPostUpdate;
				break;
			case 'page':
				currentReducerUpdate = currentPageUpdate;
				break;
			default:
				currentReducerUpdate = currentPostUpdate;
				break;
		}
		dispatch(currentReducerUpdate(updatedField));
	};

	const BLOCK_TYPES: {
		label: string;
		blocks: { type: PageBlockEnum; label: string; icon: string }[];
	}[] = [
		{
			label: language.dynamicElements,
			blocks: [PAGE_BLOCKS[PageBlockEnum.Feed]],
		},
	];

	const escFunction = React.useCallback(
		(e: any) => {
			if (e.key === 'Escape' && props.context === 'inline' && props.handleClose) {
				props.handleClose();
			}
		},
		[props.context, props.handleClose]
	);

	React.useEffect(() => {
		document.addEventListener('keydown', escFunction, false);

		return () => {
			document.removeEventListener('keydown', escFunction, false);
		};
	}, [escFunction]);

	React.useEffect(() => {
		const count = BLOCK_TYPES.reduce((acc, section) => acc + section.blocks.length, 0);
		setTotalBlockCount(count);
	}, [BLOCK_TYPES]);

	React.useEffect(() => {
		if (props.context === 'toolbar' && currentReducer.editor.panelOpen && currentReducer.editor.toggleBlockFocus) {
			setFocusedIndex(0);
		} else if (props.context === 'inline' && currentReducer.editor.toggleBlockFocus) {
			setFocusedIndex(0);
		} else if (props.context === 'toolbar' && !currentReducer.editor.panelOpen) {
			setFocusedIndex(-1);
		}
	}, [currentReducer.editor.toggleBlockFocus, currentReducer.editor.panelOpen, props.context]);

	React.useEffect(() => {
		const handleBlur = (event: FocusEvent) => {
			requestAnimationFrame(() => {
				const relatedTarget = event.relatedTarget as Node | null;
				const isStillWithinContainer = blockRefs.current.some((ref) => ref?.contains(relatedTarget));

				if (!isStillWithinContainer) {
					// Only toggle focus for inline context, toolbar context should remain independent
					if (props.context === 'inline') {
						handleCurrentReducerUpdate({ field: 'toggleBlockFocus', value: false });
					}
				}
			});
		};

		if (focusedIndex >= 0 && blockRefs.current[focusedIndex]) {
			if (currentReducer.editor.toggleBlockFocus) {
				const shouldFocus = props.context === 'toolbar' ? currentReducer.editor.panelOpen : props.context === 'inline';
				if (shouldFocus) blockRefs.current[focusedIndex]?.focus();
			}
		}

		blockRefs.current.forEach((ref) => {
			if (ref) {
				ref.addEventListener('blur', handleBlur);
			}
		});

		return () => {
			blockRefs.current.forEach((ref) => {
				if (ref) {
					ref.removeEventListener('blur', handleBlur);
				}
			});
		};
	}, [currentReducer.editor.toggleBlockFocus, focusedIndex, blockRefs, props.context]);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Tab') {
				event.preventDefault();
				event.stopPropagation();
				const direction = event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey) ? 1 : -1;
				setFocusedIndex((prevIndex) => {
					let newIndex = prevIndex;
					do {
						newIndex += direction;
						if (newIndex < 0) newIndex = totalBlockCount - 1;
						if (newIndex >= totalBlockCount) newIndex = 0;
					} while (!blockRefs.current[newIndex]);
					return newIndex;
				});
			} else if (event.key === 'Enter') {
				event.stopPropagation();
				event.preventDefault();
				if (focusedIndex >= 0 && focusedIndex < blockRefs.current.length) {
					const focusedButton = blockRefs.current[focusedIndex];
					if (focusedButton) {
						const blockType = focusedButton.getAttribute('data-block-type');
						if (blockType) {
							props.addBlock(blockType as PageBlockEnum);
						}
					}
				}
			}
		},
		[focusedIndex, props.addBlock]
	);

	function getShortcut(shortcut: string) {
		const keys = shortcut.split(' ');
		return (
			<S.BADropdownActionShortcut>
				{keys.map((key: string) => {
					return <p key={key}>{key}</p>;
				})}
			</S.BADropdownActionShortcut>
		);
	}

	return (
		<S.BADropdownBody onKeyDown={handleKeyDown} context={props.context}>
			{BLOCK_TYPES.map((section: any, sectionIndex: number) => (
				<S.BADropdownSection
					key={section.label}
					context={props.context}
					className={props.context === 'grid' ? 'border-wrapper-alt3' : ''}
				>
					<S.BADropdownSectionHeader>
						<p>{section.label}</p>
					</S.BADropdownSectionHeader>
					{section.blocks.map((block: any, blockIndex: number) => {
						const globalBlockIndex =
							BLOCK_TYPES.slice(0, sectionIndex).reduce((acc, s) => acc + s.blocks.length, 0) + blockIndex;
						return (
							<S.BADropdownAction key={`${section.label}-${block.label}`}>
								<button
									onClick={() => props.addBlock(block.type)}
									ref={(el) => {
										blockRefs.current[globalBlockIndex] = el;
									}}
									data-block-type={block.type}
									disabled={currentReducer.editor.loading.active}
								>
									<ReactSVG src={block.icon} />
									<span>{block.label}</span>
									{block.shortcut && getShortcut(block.shortcut)}
								</button>
							</S.BADropdownAction>
						);
					})}
				</S.BADropdownSection>
			))}
		</S.BADropdownBody>
	);
}
