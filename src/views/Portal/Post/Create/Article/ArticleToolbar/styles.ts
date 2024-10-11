import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 20px;
	position: relative;
`;

export const TitleWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const EndActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 20px;
	margin: 0 0 0 auto;
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
		top: 55px;
		border: 1px solid ${(props) => props.theme.colors.border.alt2} !important;
		box-shadow: 0 3.5px 7.5px 0 ${(props) => props.theme.colors.shadow.primary};
	}
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
			color: ${(props) => props.theme.colors.font.primary} !important;
			font-size: ${(props) => props.theme.typography.size.xSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.medium} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
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
			background: ${(props) => props.theme.colors.container.primary.active};
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
		background: ${(props) => props.theme.colors.container.alt4.background};
		border-radius: ${STYLING.dimensions.radius.alt3};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: 10px !important;
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;
