import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	position: relative;
`;

export const TitleWrapper = styled.div`
	input {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		padding: 0;
		outline: 0;
		border: none;
	}
`;

export const EndActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 20px;
`;

export const Panel = styled.div<{ open: boolean }>`
	max-height: calc(100vh - 65px - 100px);
	width: 300px;
	position: absolute;
	right: 0;
	z-index: 1;
	transform: translateX(${(props) => (props.open ? '0' : 'calc(100% + 20px)')});
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
`;

export const PanelCloseWrapper = styled.div`
	position: absolute;
	top: 10px;
	right: 10px;
`;

export const TabWrapper = styled.div<{ label: string; icon?: string }>``;

export const TabContent = styled.div`
	margin: 20px 0 0 0;
`;

/* Blocks */
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
		border-radius: ${STYLING.dimensions.radius.alt2};
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
		background: ${(props) => props.theme.colors.container.alt4.background};
		border-radius: ${STYLING.dimensions.radius.alt3};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: 10px !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;
