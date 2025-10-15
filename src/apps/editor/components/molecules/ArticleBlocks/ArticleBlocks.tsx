import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';

import { EditorStoreRootState } from 'editor/store';
import { currentPostUpdate } from 'editor/store/post';

import { ARTICLE_BLOCKS } from 'helpers/config';
import { ArticleBlockEnum, ArticleBlocksContextType } from 'helpers/types';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';

export default function ArticleBlocks(props: {
	addBlock: (type: ArticleBlockEnum) => void;
	handleClose?: () => void;
	context?: ArticleBlocksContextType;
}) {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: EditorStoreRootState) => state.currentPost);

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const blockRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

	const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
	const [totalBlockCount, setTotalBlockCount] = React.useState(0);

	const handleCurrentPostUpdate = (updatedField: { field: string; value: any }) => {
		dispatch(currentPostUpdate(updatedField));
	};

	const BLOCK_TYPES: {
		label: string;
		blocks: { type: ArticleBlockEnum; label: string; icon: string }[];
	}[] = [
		{
			label: language.text,
			blocks: [
				ARTICLE_BLOCKS[ArticleBlockEnum.Paragraph],
				ARTICLE_BLOCKS[ArticleBlockEnum.Quote],
				ARTICLE_BLOCKS[ArticleBlockEnum.OrderedList],
				ARTICLE_BLOCKS[ArticleBlockEnum.UnorderedList],
				ARTICLE_BLOCKS[ArticleBlockEnum.Code],
			],
		},
		{
			label: language.headers,
			blocks: [
				ARTICLE_BLOCKS[ArticleBlockEnum.Header1],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header2],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header3],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header4],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header5],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header6],
			],
		},
		{
			label: language.media,
			blocks: [ARTICLE_BLOCKS[ArticleBlockEnum.Image], ARTICLE_BLOCKS[ArticleBlockEnum.Video]],
		},
		{
			label: language.design,
			blocks: [ARTICLE_BLOCKS[ArticleBlockEnum.DividerSolid], ARTICLE_BLOCKS[ArticleBlockEnum.DividerDashed]],
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
		if (props.context === 'toolbar' && currentPost.editor.panelOpen && currentPost.editor.toggleBlockFocus) {
			setFocusedIndex(0);
		} else if (props.context === 'inline' && currentPost.editor.toggleBlockFocus) {
			setFocusedIndex(0);
		} else if (props.context === 'toolbar' && !currentPost.editor.panelOpen) {
			setFocusedIndex(-1);
		}
	}, [currentPost.editor.toggleBlockFocus, currentPost.editor.panelOpen, props.context]);

	React.useEffect(() => {
		const handleBlur = (event: FocusEvent) => {
			requestAnimationFrame(() => {
				const relatedTarget = event.relatedTarget as Node | null;
				const isStillWithinContainer = blockRefs.current.some((ref) => ref?.contains(relatedTarget));

				if (!isStillWithinContainer) {
					// Only toggle focus for inline context, toolbar context should remain independent
					if (props.context === 'inline') {
						handleCurrentPostUpdate({ field: 'toggleBlockFocus', value: false });
					}
				}
			});
		};

		if (focusedIndex >= 0 && blockRefs.current[focusedIndex]) {
			if (currentPost.editor.toggleBlockFocus) {
				const shouldFocus = props.context === 'toolbar' ? currentPost.editor.panelOpen : props.context === 'inline';
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
	}, [currentPost.editor.toggleBlockFocus, focusedIndex, blockRefs, props.context]);

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
							props.addBlock(blockType as ArticleBlockEnum);
						}
					}
				}
			}
		},
		[focusedIndex, props.addBlock]
	);

	React.useEffect(() => {
		let ctrlSlashPressed = false;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === '/') {
				ctrlSlashPressed = true;
				event.preventDefault();
			} else if (ctrlSlashPressed) {
				switch (event.key.toLowerCase()) {
					case '1':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header1);
						break;
					case '2':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header2);
						break;
					case '3':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header3);
						break;
					case '4':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header4);
						break;
					case '5':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header5);
						break;
					case '6':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Header6);
						break;
					case 'p':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Paragraph);
						break;
					case 'q':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Quote);
						break;
					case 'c':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Code);
						break;
					case 'n':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.OrderedList);
						break;
					case 'b':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.UnorderedList);
						break;
					case 'i':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Image);
						break;
					case 'v':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.Video);
						break;
					case 's':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.DividerSolid);
						break;
					case 'd':
						event.preventDefault();
						props.addBlock(ArticleBlockEnum.DividerDashed);
						break;
					default:
						break;
				}
				ctrlSlashPressed = false;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [props.addBlock]);

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
									disabled={currentPost.editor.loading.active}
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
