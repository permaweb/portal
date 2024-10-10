import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ARTICLE_BLOCKS, ASSETS } from 'helpers/config';
import { ArticleBlockEnum } from 'helpers/types';
import { isMac } from 'helpers/utils';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

// TODO: Language
// TODO: Post title
export default function ArticleToolbar(props: IProps) {
	const [showBlockAddDropdown, setShowBlockAddDropdown] = React.useState<boolean>(false);

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
	];

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey) {
				if (event.key === 'b') {
					event.preventDefault();
					props.togglePanelOpen();
				}
				if (event.key === 'e') {
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
						props.addBlock(ArticleBlockEnum.Header5);
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
					return <p>{key}</p>;
				})}
			</S.BADropdownActionShortcut>
		);
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
						label={'Block editor'}
						handlePress={() => props.toggleBlockEditMode()}
						active={props.blockEditMode}
						icon={props.blockEditMode ? ASSETS.close : ASSETS.write}
						iconLeftAlign
						tooltip={isMac() ? '⌘ + E' : 'Ctrl + E'}
					/>
					<S.BlockAddWrapper>
						<CloseHandler
							active={showBlockAddDropdown}
							disabled={!showBlockAddDropdown}
							callback={() => setShowBlockAddDropdown(false)}
						>
							<Button
								type={'primary'}
								label={'Panel'}
								handlePress={() => props.togglePanelOpen()}
								active={props.panelOpen}
								icon={props.panelOpen ? ASSETS.close : ASSETS.add}
								iconLeftAlign
								tooltip={isMac() ? '⌘ + B' : 'Ctrl + B'}
							/>

							{/* {showBlockAddDropdown && (
								<S.BlockAddDropdown className={'border-wrapper-alt1 fade-in scroll-wrapper'}>
									<S.BADropdownBody>
										{BLOCK_TYPES.map((section: any) => (
											<S.BADropdownSection key={section.label}>
												<S.BADropdownSectionHeader>
													<p>{section.label}</p>
												</S.BADropdownSectionHeader>
												{section.blocks.map((block: any) => (
													<S.BADropdownAction key={block.label}>
														<button
															onClick={() => {
																props.addBlock(block.type);
																setShowBlockAddDropdown(false);
															}}
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
								</S.BlockAddDropdown>
							)} */}
						</CloseHandler>
					</S.BlockAddWrapper>
				</S.EndActions>
			</S.Wrapper>
			{props.panelOpen && (
				<S.Panel className={'border-wrapper-primary fade-in scroll-wrapper'}>
					<S.BADropdownBody>
						{BLOCK_TYPES.map((section: any) => (
							<S.BADropdownSection key={section.label}>
								<S.BADropdownSectionHeader>
									<p>{section.label}</p>
								</S.BADropdownSectionHeader>
								{section.blocks.map((block: any) => (
									<S.BADropdownAction key={block.label}>
										<button
											onClick={() => {
												props.addBlock(block.type);
												setShowBlockAddDropdown(false);
											}}
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
				</S.Panel>
			)}
		</>
	);
}
