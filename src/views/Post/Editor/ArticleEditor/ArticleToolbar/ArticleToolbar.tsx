import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Portal } from 'components/atoms/Portal';
import { Tabs } from 'components/atoms/Tabs';
import { ARTICLE_BLOCKS, ASSETS, DOM, STYLING } from 'helpers/config';
import { ArticleBlockEnum, PortalCategoryType } from 'helpers/types';
import { checkWindowCutoff, hideDocumentBody, showDocumentBody } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';
import { usePortalProvider } from 'providers/PortalProvider';
import { RootState } from 'store';
import { currentPostUpdate } from 'store/post';

import { ArticleToolbarPost } from './ArticleToolbarPost';
import * as S from './styles';
import { IProps } from './types';

export default function ArticleToolbar(props: IProps) {
	const dispatch = useDispatch();

	const currentPost = useSelector((state: RootState) => state.currentPost);

	const portalProvider = usePortalProvider();

	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const TABS = [{ label: language.post }, { label: language.blocks }];

	const titleRef = React.useRef<any>(null);
	const blockRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

	const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
	const [currentTab, setCurrentTab] = React.useState<string>(TABS[0]!.label);
	const [totalBlockCount, setTotalBlockCount] = React.useState(0);
	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.initial)));

	const handleDispatch = (updatedField: { field: string; value: any }) => {
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
	];

	function handleWindowResize() {
		if (checkWindowCutoff(parseInt(STYLING.cutoffs.initial))) {
			setDesktop(true);
		} else {
			setDesktop(false);
		}
	}

	const debouncedResize = React.useCallback(debounce(handleWindowResize, 0), []);

	React.useEffect(() => {
		window.addEventListener('resize', debouncedResize);

		return () => {
			window.removeEventListener('resize', debouncedResize);
		};
	}, [debouncedResize]);

	React.useEffect(() => {
		if (titleRef && titleRef.current) titleRef.current.focus();
	}, [titleRef]);

	React.useEffect(() => {
		if (!desktop) handleDispatch({ field: 'panelOpen', value: false });
	}, [desktop]);

	React.useEffect(() => {
		if (currentPost.editor.panelOpen && !desktop) {
			hideDocumentBody();
			return () => {
				showDocumentBody();
			};
		}
	}, [currentPost.editor.panelOpen, desktop]);

	React.useEffect(() => {
		const count = BLOCK_TYPES.reduce((acc, section) => acc + section.blocks.length, 0);
		setTotalBlockCount(count);
	}, [BLOCK_TYPES]);

	React.useEffect(() => {
		if (currentPost.editor.panelOpen && currentPost.editor.toggleBlockFocus) {
			setFocusedIndex(0);
		}
	}, [currentPost.editor.toggleBlockFocus, currentPost.editor.panelOpen]);

	React.useEffect(() => {
		const handleBlur = (event: FocusEvent) => {
			requestAnimationFrame(() => {
				const relatedTarget = event.relatedTarget as Node | null;
				const isStillWithinContainer = blockRefs.current.some((ref) => ref?.contains(relatedTarget));

				if (!isStillWithinContainer) {
					handleDispatch({ field: 'toggleBlockFocus', value: !currentPost.editor.toggleBlockFocus });
				}
			});
		};

		if (focusedIndex >= 0 && blockRefs.current[focusedIndex] && currentPost.editor.panelOpen) {
			if (currentPost.editor.toggleBlockFocus) blockRefs.current[focusedIndex]?.focus();
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
	}, [currentPost.editor.toggleBlockFocus, focusedIndex, currentPost.editor.panelOpen, blockRefs]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey) {
				if (event.key.toLowerCase() === 'k') {
					event.preventDefault();
					handleDispatch({ field: 'panelOpen', value: !currentPost.editor.panelOpen });
				}
				if (event.key.toLowerCase() === 'l') {
					event.preventDefault();
					handleDispatch({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode });
				}
			}
			if (
				event.key === 'Enter' ||
				((event.ctrlKey || event.metaKey) && event.key === 'Enter') ||
				event.key === 'Tab' ||
				event.key === 'ArrowDown'
			) {
				if (document.activeElement === titleRef.current) {
					event.preventDefault();
					props.handleInitAddBlock(event);
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentPost.editor.blockEditMode, currentPost.editor.panelOpen]);

	React.useEffect(() => {
		const handleFocus = () => {
			handleDispatch({ field: 'titleFocused', value: true });
		};

		const handleBlur = () => {
			handleDispatch({ field: 'titleFocused', value: false });
		};

		const titleElement = titleRef.current;
		if (titleElement) {
			titleElement.addEventListener('focus', handleFocus);
			titleElement.addEventListener('blur', handleBlur);
		}

		return () => {
			if (titleElement) {
				titleElement.removeEventListener('focus', handleFocus);
				titleElement.removeEventListener('blur', handleBlur);
			}
		};
	}, [titleRef]);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Tab') {
				event.preventDefault();
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

	function getCurrentTab() {
		switch (currentTab) {
			case 'Blocks':
				return (
					<S.BADropdownBody onKeyDown={handleKeyDown}>
						{BLOCK_TYPES.map((section: any, sectionIndex: number) => (
							<S.BADropdownSection key={section.label}>
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
			case 'Post':
				return (
					<ArticleToolbarPost
						categories={currentPost.data.categories}
						setCategories={(updatedCategories: PortalCategoryType[]) =>
							handleDispatch({ field: 'categories', value: updatedCategories })
						}
						topics={currentPost.data.topics}
						setTopics={(updatedTopics: string[]) => handleDispatch({ field: 'topics', value: updatedTopics })}
					/>
				);
			default:
				return null;
		}
	}

	const panel = React.useMemo(() => {
		const content = (
			<S.Panel className={'border-wrapper-primary fade-in'} open={currentPost.editor.panelOpen}>
				<Tabs onTabPropClick={(label: string) => setCurrentTab(label)} type={'alt1'}>
					{TABS.map((tab: { label: string; icon?: string }, index: number) => {
						return <S.TabWrapper key={index} label={tab.label} icon={tab.icon ? tab.icon : null} />;
					})}
				</Tabs>
				<S.TabContent className={'scroll-wrapper'}>{getCurrentTab()}</S.TabContent>
				<S.PanelCloseWrapper>
					<IconButton
						type={'primary'}
						src={ASSETS.close}
						handlePress={() => handleDispatch({ field: 'panelOpen', value: !currentPost.editor.panelOpen })}
						tooltip={language.closeToolkit}
						tooltipPosition={'bottom-right'}
						dimensions={{
							icon: 12.5,
							wrapper: 20,
						}}
						noFocus
						disabled={currentPost.editor.loading.active}
					/>
				</S.PanelCloseWrapper>
			</S.Panel>
		);
		if (!desktop)
			return currentPost.editor.panelOpen ? (
				<Portal node={DOM.overlay}>
					<div className={'overlay'}>{content}</div>
				</Portal>
			) : null;
		return content;
	}, [
		currentPost.editor.panelOpen,
		currentTab,
		props.addBlock,
		focusedIndex,
		desktop,
		currentPost.editor.loading.active,
	]);

	return (
		<>
			<S.Wrapper>
				<S.TitleWrapper>
					<input
						ref={titleRef}
						value={currentPost.data.title ?? ''}
						onChange={(e: any) => handleDispatch({ field: 'title', value: e.target.value })}
						placeholder={language.untitledPost}
						disabled={currentPost.editor.loading.active || !portalProvider.current?.id}
					/>
				</S.TitleWrapper>
				<S.EndActions>
					<S.StatusAction status={currentPost.data.status}>
						<Button
							type={'primary'}
							label={currentPost.data.status.toUpperCase()}
							handlePress={() =>
								handleDispatch({ field: 'status', value: currentPost.data.status === 'draft' ? 'published' : 'draft' })
							}
							active={false}
							disabled={currentPost.editor.loading.active}
							tooltip={`Mark as ${currentPost.data.status === 'draft' ? 'published' : 'draft'}`}
							noFocus
						/>
					</S.StatusAction>
					<Button
						type={'primary'}
						label={language.toolkit}
						handlePress={() => handleDispatch({ field: 'panelOpen', value: !currentPost.editor.panelOpen })}
						active={currentPost.editor.panelOpen}
						disabled={currentPost.editor.loading.active}
						icon={currentPost.editor.panelOpen ? ASSETS.close : ASSETS.tools}
						iconLeftAlign
						tooltip={'CTRL + K'}
						noFocus
					/>
					<Button
						type={'primary'}
						label={language.layout}
						handlePress={() => handleDispatch({ field: 'blockEditMode', value: !currentPost.editor.blockEditMode })}
						active={currentPost.editor.blockEditMode}
						disabled={currentPost.editor.loading.active}
						icon={currentPost.editor.blockEditMode ? ASSETS.close : ASSETS.layout}
						iconLeftAlign
						tooltip={'CTRL + L'}
						noFocus
					/>
					<Button
						type={'alt1'}
						label={language.save}
						handlePress={props.handleSubmit}
						active={false}
						disabled={currentPost.editor.loading.active || currentPost.editor.submitDisabled}
						noFocus
					/>
				</S.EndActions>
			</S.Wrapper>
			{panel}
		</>
	);
}
