import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { ArticleBlockElementType } from 'helpers/types';
import { isMac } from 'helpers/utils';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

type BlockConfigType = {
	label: string;
	blocks: { type: ArticleBlockElementType; label: string; icon: string }[];
}[];

// TODO: Language
// TODO: Post title
export default function ArticleToolbar(props: IProps) {
	const [showBlockAddDropdown, setShowBlockAddDropdown] = React.useState<boolean>(false);

	const BLOCK_TYPES: BlockConfigType = [
		{
			label: 'Text',
			blocks: [
				{ type: 'paragraph', label: 'Paragraph', icon: ASSETS.paragraph },
				{ type: 'quote', label: 'Quote', icon: ASSETS.quotes },
				{ type: 'ordered-list', label: 'Numbered List', icon: ASSETS.listOrdered },
				{ type: 'unordered-list', label: 'Bulleted List', icon: ASSETS.listUnordered },
				{ type: 'code', label: 'Code', icon: ASSETS.code },
			],
		},
		{
			label: 'Headers',
			blocks: [
				{ type: 'header-1', label: 'Header 1', icon: ASSETS.header1 },
				{ type: 'header-2', label: 'Header 2', icon: ASSETS.header2 },
				{ type: 'header-3', label: 'Header 3', icon: ASSETS.header3 },
				{ type: 'header-4', label: 'Header 4', icon: ASSETS.header4 },
				{ type: 'header-5', label: 'Header 5', icon: ASSETS.header5 },
				{ type: 'header-6', label: 'Header 6', icon: ASSETS.header6 },
			],
		},
	];

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
				event.preventDefault();
				props.toggleBlockEditMode();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [props.toggleBlockEditMode]);

	React.useEffect(() => {
		let ctrlSlashPressed = false;

		const handleKeyDown = (event: KeyboardEvent) => {
			console.log(event.key);
			if (event.ctrlKey && event.key === '/') {
				ctrlSlashPressed = true;
				event.preventDefault();
			} else if (ctrlSlashPressed) {
				switch (event.key.toLowerCase()) {
					case '1':
						event.preventDefault();
						props.addBlock('header-1');
						break;
					case '2':
						event.preventDefault();
						props.addBlock('header-2');
						break;
					case '3':
						event.preventDefault();
						props.addBlock('header-3');
						break;
					case '4':
						event.preventDefault();
						props.addBlock('header-4');
						break;
					case '5':
						event.preventDefault();
						props.addBlock('header-5');
						break;
					case '6':
						event.preventDefault();
						props.addBlock('header-6');
						break;
					case 'p':
						event.preventDefault();
						props.addBlock('paragraph');
						break;
					case 'q':
						event.preventDefault();
						props.addBlock('quote');
						break;
					case 'c':
						event.preventDefault();
						props.addBlock('code');
						break;
					case 'o':
						event.preventDefault();
						props.addBlock('ordered-list');
						break;
					case 'u':
						event.preventDefault();
						props.addBlock('unordered-list');
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

	return (
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
							label={'Add block'}
							handlePress={() => setShowBlockAddDropdown(!showBlockAddDropdown)}
							icon={ASSETS.add}
							iconLeftAlign
						/>

						{showBlockAddDropdown && (
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
													</button>
												</S.BADropdownAction>
											))}
										</S.BADropdownSection>
									))}
								</S.BADropdownBody>
							</S.BlockAddDropdown>
						)}
					</CloseHandler>
				</S.BlockAddWrapper>
			</S.EndActions>
		</S.Wrapper>
	);
}
