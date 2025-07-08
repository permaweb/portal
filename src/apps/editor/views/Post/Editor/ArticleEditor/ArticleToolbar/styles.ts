import styled from 'styled-components';

import { getPostStatusBackground } from 'editor/styles';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

import { ARTICLE_TOOLBAR_WIDTH } from '../styles';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: space-between;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const TitleWrapper = styled.div`
	width: calc(50% - 10px);
	overflow: hidden;
	input {
		width: 100%;
		display: block;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		padding: 0;
		outline: 0;
		border: none;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const EndActions = styled.div`
	width: calc(50% - 10px);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 20px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

export const StatusAction = styled.div<{ status: ArticleStatusType }>`
	position: relative;

	button {
		padding: 0 32.5px 0 15px;
	}

	&::after {
		content: '';
		position: absolute;
		width: 11.5px;
		height: 11.5px;
		border-radius: 50%;
		right: 12.5px;
		top: 50%;
		transform: translateY(-48.5%);
		pointer-events: none;
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		background: ${(props) => getPostStatusBackground(props.status, props.theme)};
	}
`;

export const Panel = styled.div<{ open: boolean }>`
	width: ${ARTICLE_TOOLBAR_WIDTH};
	position: absolute;
	right: 0;
	z-index: 1;
	transform: translateX(${(props) => (props.open ? '0' : 'calc(100% + 40px)')});
	transition: transform ${transition2};
	top: 75px;
	padding: 13.5px 10px 10px 10px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		top: 40%;
		left: 50%;
		transform: translate(-50%, -40%);
		display: ${(props) => (props.open ? 'block' : 'none')};
		border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
	}

	@media (min-width: ${STYLING.cutoffs.max}) {
		display: ${(props) => (props.open ? 'block' : 'none')};
	}
`;

export const PanelCloseWrapper = styled.div`
	position: absolute;
	top: 10px;
	right: 10px;
`;

export const TabWrapper = styled.div<{ label: string; icon?: string }>``;

export const TabContent = styled.div`
	margin: 20px 0 0 0;
	max-height: calc(100vh - ${STYLING.dimensions.nav.height} - 155px);
`;

export const BADropdownBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const BADropdownSection = styled.div``;

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
		background: ${(props) => props.theme.colors.container.primary.background};
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;
		span {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xSmall};
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
