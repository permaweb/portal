import React from 'react';
import { ReactSVG } from 'react-svg';

import { Button } from 'components/atoms/Button';
import { ASSETS } from 'helpers/config';
import { CloseHandler } from 'wrappers/CloseHandler';

import * as S from './styles';
import { IProps } from './types';

// TODO: Language
export default function ArticleToolbar(props: IProps) {
	const [showBlockAddDropdown, setShowBlockAddDropdown] = React.useState<boolean>(false);

	// TODO
	const BLOCK_TYPES = [
		{
			label: 'Text',
			blocks: [
				{ type: 'paragraph', label: 'Paragraph', icon: ASSETS.paragraph },
				{ type: 'paragraph', label: 'Quote', icon: ASSETS.quotes },
				{ type: 'paragraph', label: 'List', icon: ASSETS.list },
				{ type: 'paragraph', label: 'Code', icon: ASSETS.code },
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

	return (
		<S.Wrapper>
			<S.TitleWrapper>
				<p>Untitled post</p>
			</S.TitleWrapper>
			<S.EndActions>
				<Button
					type={'primary'}
					label={props.blockEditMode ? 'Hide block editor' : 'Edit blocks'}
					handlePress={() => props.toggleBlockEditMode()}
					active={props.blockEditMode}
					icon={props.blockEditMode ? ASSETS.close : ASSETS.write}
					iconLeftAlign
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
