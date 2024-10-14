import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { Tabs } from 'components/molecules/Tabs';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { ArticleBlockEnum } from 'helpers/types';

import * as S from './styles';
import { IProps } from './types';

// TODO: Language
// TODO: Post title
export default function ArticleToolbar(props: IProps) {
	const TABS = [{ label: 'Blocks' }]; // TODO: { label: 'Post' }

	const [currentTab, setCurrentTab] = React.useState<string>(TABS[0]!.label);

	const BLOCK_TYPES: {
		label: string;
		blocks: { type: ArticleBlockEnum; label: string; icon: string }[];
	}[] = [
		{
			label: 'Text',
			blocks: [
				ARTICLE_BLOCKS[ArticleBlockEnum.Paragraph],
				ARTICLE_BLOCKS[ArticleBlockEnum.Quote],
				ARTICLE_BLOCKS[ArticleBlockEnum.OrderedList],
				ARTICLE_BLOCKS[ArticleBlockEnum.UnorderedList],
				ARTICLE_BLOCKS[ArticleBlockEnum.Code],
			],
		},
		{
			label: 'Headers',
			blocks: [
				ARTICLE_BLOCKS[ArticleBlockEnum.Header1],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header2],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header3],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header4],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header5],
				ARTICLE_BLOCKS[ArticleBlockEnum.Header6],
			],
		},
		// {
		// 	label: 'Media', // TODO
		// 	blocks: [
		// 		ARTICLE_BLOCKS[ArticleBlockEnum.Header1],
		// 		ARTICLE_BLOCKS[ArticleBlockEnum.Header2],
		// 		ARTICLE_BLOCKS[ArticleBlockEnum.Header3],
		// 	],
		// },
	];

	const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
	const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

	React.useEffect(() => {
		if (props.toggleBlockFocus && props.panelOpen) {
			console.log('Attempting to focus first button');
			setFocusedIndex(0);
		}
	}, [props.toggleBlockFocus, props.panelOpen]);

	React.useEffect(() => {
		if (focusedIndex >= 0 && buttonRefs.current[focusedIndex]) {
			buttonRefs.current[focusedIndex]?.focus();
			console.log(`Button at index ${focusedIndex} focused`);
		}
	}, [focusedIndex]);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				const direction = event.key === 'ArrowDown' ? 1 : -1;
				setFocusedIndex((prevIndex) => {
					const newIndex = prevIndex + direction;
					if (newIndex < 0) return buttonRefs.current.length - 1;
					if (newIndex >= buttonRefs.current.length) return 0;
					return newIndex;
				});
			} else if (event.key === 'Enter') {
				event.preventDefault();
				if (focusedIndex >= 0 && focusedIndex < buttonRefs.current.length) {
					const focusedButton = buttonRefs.current[focusedIndex];
					if (focusedButton) {
						console.log(focusedButton);
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
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [props.toggleBlockEditMode, props.togglePanelOpen]);

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
								{section.blocks.map((block: any, blockIndex: number) => (
									<S.BADropdownAction key={`${section.label}-${block.label}`}>
										<button
											onClick={() => props.addBlock(block.type)}
											ref={(el) => {
												buttonRefs.current[sectionIndex * section.blocks.length + blockIndex] = el;
											}}
											data-block-type={block.type}
										>
											<ReactSVG src={block.icon} />
											<span>{block.label}</span>
											{block.shortcut && getShortcut(block.shortcut)}
										</button>
									</S.BADropdownAction>
								))}
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

	return (
		<>
			<S.Wrapper>
				<S.TitleWrapper>
					<p>Untitled post</p>
				</S.TitleWrapper>
				<S.EndActions>
					<Button
						type={'primary'}
						label={'Toolkit'}
						handlePress={() => props.togglePanelOpen()}
						active={props.panelOpen}
						icon={props.panelOpen ? ASSETS.close : ASSETS.tools}
						iconLeftAlign
						tooltip={'CTRL + K'}
					/>
					<Button
						type={'primary'}
						label={'Layout'}
						handlePress={() => props.toggleBlockEditMode()}
						active={props.blockEditMode}
						icon={props.blockEditMode ? ASSETS.close : ASSETS.layout}
						iconLeftAlign
						tooltip={'CTRL + L'}
					/>
					<Button type={'alt1'} label={'Publish'} handlePress={() => alert('Publish this post!')} active={false} />
				</S.EndActions>
			</S.Wrapper>
			<S.Panel open={props.panelOpen} className={'border-wrapper-primary fade-in scroll-wrapper'}>
				<Tabs onTabPropClick={(label: string) => setCurrentTab(label)} type={'alt1'}>
					{TABS.map((tab: { label: string; icon?: string }, index: number) => {
						return <S.TabWrapper key={index} label={tab.label} icon={tab.icon ? tab.icon : null} />;
					})}
				</Tabs>
				<S.TabContent>{getCurrentTab()}</S.TabContent>
			</S.Panel>
		</>
	);
}
