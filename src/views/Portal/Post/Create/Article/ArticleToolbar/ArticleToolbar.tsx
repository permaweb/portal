import React from 'react';
import { ReactSVG } from 'react-svg';
import { debounce } from 'lodash';

import { Button } from 'components/atoms/Button';
import { IconButton } from 'components/atoms/IconButton';
import { Portal } from 'components/atoms/Portal';
import { Tabs } from 'components/molecules/Tabs';
import { ARTICLE_BLOCKS, ASSETS, DOM, STYLING } from 'helpers/config';
import { ArticleBlockEnum } from 'helpers/types';
import { checkWindowCutoff } from 'helpers/window';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { IProps } from './types';

export default function ArticleToolbar(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const TABS = [{ label: language.blocks }]; // TODO: { label: 'Post' }

	const titleRef = React.useRef<any>(null);
	const blockRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

	const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);
	const [currentTab, setCurrentTab] = React.useState<string>(TABS[0]!.label);
	const [totalBlockCount, setTotalBlockCount] = React.useState(0);
	const [desktop, setDesktop] = React.useState(checkWindowCutoff(parseInt(STYLING.cutoffs.initial)));

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
			blocks: [ARTICLE_BLOCKS[ArticleBlockEnum.Image]],
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
		if (!desktop) props.togglePanelOpen();
	}, [desktop]);

	React.useEffect(() => {
		const count = BLOCK_TYPES.reduce((acc, section) => acc + section.blocks.length, 0);
		setTotalBlockCount(count);
	}, [BLOCK_TYPES]);

	React.useEffect(() => {
		if (props.panelOpen && props.toggleBlockFocus) {
			setFocusedIndex(0);
		}
	}, [props.toggleBlockFocus, props.panelOpen]);

	React.useEffect(() => {
		const handleBlur = (event: FocusEvent) => {
			requestAnimationFrame(() => {
				const relatedTarget = event.relatedTarget as Node | null;
				const isStillWithinContainer = blockRefs.current.some((ref) => ref?.contains(relatedTarget));

				if (!isStillWithinContainer) {
					props.setToggleBlockFocus();
				}
			});
		};

		if (focusedIndex >= 0 && blockRefs.current[focusedIndex] && props.panelOpen) {
			if (props.toggleBlockFocus) blockRefs.current[focusedIndex]?.focus();
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
	}, [props.toggleBlockFocus, focusedIndex, props.panelOpen, props.setToggleBlockFocus, blockRefs]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey) {
				if (event.key.toLowerCase() === 'k') {
					event.preventDefault();
					props.togglePanelOpen();
				}
				if (event.key.toLowerCase() === 'l') {
					event.preventDefault();
					props.toggleBlockEditMode();
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
	}, [props.toggleBlockEditMode, props.togglePanelOpen]);

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
												disabled={props.loading}
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
				return <p>Post actions</p>;
			default:
				return null;
		}
	}

	const panel = React.useMemo(() => {
		const content = (
			<S.Panel className={'border-wrapper-primary fade-in'} open={props.panelOpen}>
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
						handlePress={() => props.togglePanelOpen()}
						tooltip={language.closeToolkit}
						tooltipPosition={'bottom-right'}
						dimensions={{
							icon: 12.5,
							wrapper: 20,
						}}
						noFocus
						disabled={props.loading}
					/>
				</S.PanelCloseWrapper>
			</S.Panel>
		);
		if (!desktop)
			return props.panelOpen ? (
				<Portal node={DOM.overlay}>
					<div className={'overlay'}>{content}</div>
				</Portal>
			) : null;
		return content;
	}, [props.panelOpen, currentTab, props.addBlock, focusedIndex, desktop, props.loading]);

	return (
		<>
			<S.Wrapper>
				<S.TitleWrapper>
					<input
						ref={titleRef}
						value={props.postTitle}
						onChange={(e: any) => props.setPostTitle(e.target.value)}
						placeholder={language.untitledPost}
						disabled={props.loading}
					/>
				</S.TitleWrapper>
				<S.EndActions>
					<S.StatusAction status={props.status}>
						<Button
							type={'primary'}
							label={props.status.toUpperCase()}
							handlePress={() => props.setStatus(props.status === 'draft' ? 'published' : 'draft')}
							active={false}
							disabled={props.loading}
							tooltip={`Mark as ${props.status === 'draft' ? 'published' : 'draft'}`}
							noFocus
						/>
					</S.StatusAction>
					<Button
						type={'primary'}
						label={language.toolkit}
						handlePress={() => props.togglePanelOpen()}
						active={props.panelOpen}
						disabled={props.loading}
						icon={props.panelOpen ? ASSETS.close : ASSETS.tools}
						iconLeftAlign
						tooltip={'CTRL + K'}
						noFocus
					/>
					<Button
						type={'primary'}
						label={language.layout}
						handlePress={() => props.toggleBlockEditMode()}
						active={props.blockEditMode}
						disabled={props.loading}
						icon={props.blockEditMode ? ASSETS.close : ASSETS.layout}
						iconLeftAlign
						tooltip={'CTRL + L'}
						noFocus
					/>
					<Button
						type={'alt1'}
						label={language.save}
						handlePress={props.handleSubmit}
						active={false}
						disabled={props.loading || props.submitDisabled}
						noFocus
					/>
				</S.EndActions>
			</S.Wrapper>
			{panel}
		</>
	);
}
