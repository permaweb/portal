import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { ArticleBlocksContextType } from 'helpers/types';

export const BADropdownBody = styled.div<{ $context: ArticleBlocksContextType }>`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: ${(props) => (props.$context === 'grid' ? 'row' : 'column')};
	flex-wrap: wrap;
	gap: 10px;
`;

export const BADropdownSection = styled.div<{ $context: ArticleBlocksContextType }>`
	min-width: ${(props) => (props.$context === 'grid' ? '265px' : '0')};
	flex: 1;
	max-width: 100%;
	padding: ${(props) => (props.$context === 'grid' ? '15px 10px 10px 10px' : '0')};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const BADropdownSectionHeader = styled.div`
	width: 100%;
	margin: 0 0 3.5px 0;
	padding: 0 10px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const BADropdownAction = styled.div`
	button {
		height: 35px;
		width: 100%;
		display: flex;
		align-items: center;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;
		span {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xxSmall};
			font-weight: ${(props) => props.theme.typography.weight.medium};
			font-family: ${(props) => props.theme.typography.family.primary};
			display: block;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: 85%;
			overflow: hidden;
		}
		svg {
			height: 15px;
			width: 15px;
			margin: 5px 10px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		&:hover {
			background: ${(props) => props.theme.colors.button.alt1.background};
			span {
				color: ${(props) => props.theme.colors.button.alt1.color};
			}
			svg {
				color: ${(props) => props.theme.colors.button.alt1.color};
				fill: ${(props) => props.theme.colors.button.alt1.color};
			}
			p {
				background: ${(props) => props.theme.colors.button.alt1.background};
				color: ${(props) => props.theme.colors.button.alt1.color};
				border: 1px solid ${(props) => props.theme.colors.border.alt6};
			}
		}
		&:focus {
			border: 0;
			outline: 0;
			background: ${(props) => props.theme.colors.button.alt1.background};
			span {
				color: ${(props) => props.theme.colors.button.alt1.color};
			}
			svg {
				color: ${(props) => props.theme.colors.button.alt1.color};
				fill: ${(props) => props.theme.colors.button.alt1.color};
			}
			p {
				background: ${(props) => props.theme.colors.button.alt1.background};
				color: ${(props) => props.theme.colors.button.alt1.color};
				border: 1px solid ${(props) => props.theme.colors.border.alt6};
			}
		}

		&:disabled {
			background: ${(props) => props.theme.colors.container.primary.background};

			span {
				color: ${(props) => props.theme.colors.font.primary};
			}

			svg {
				color: ${(props) => props.theme.colors.font.primary};
				fill: ${(props) => props.theme.colors.font.primary};
			}

			p {
				color: ${(props) => props.theme.colors.font.primary};
				border: 1px solid transparent;
				background: ${(props) => props.theme.colors.container.alt4.background};
			}
		}
	}
`;

export const BADropdownActionShortcut = styled.div`
	display: flex;
	align-items: center;
	gap: 3.5px;
	margin: 0 0 0 auto;
	p {
		text-transform: uppercase;
		padding: 2.5px 6.5px;
		border: 1px solid transparent;
		background: ${(props) => props.theme.colors.container.alt2.background};
		border-radius: ${STYLING.dimensions.radius.alt3};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: 10px !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;
