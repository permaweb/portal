import styled from 'styled-components';

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

export const BlockAddWrapper = styled.div``;

export const Panel = styled.div`
	max-height: calc(100vh - 65px - 100px);
	width: 300px;
	position: absolute;
	right: 0;
	z-index: 1;
	top: 75px;
	padding: 15px 10px 10px 10px;
`;

export const BlockAddDropdown = styled.div`
	max-height: 65vh;
	width: 350px;
	max-width: 80vw;
	position: absolute;
	z-index: 1;
	top: 45px;
	right: 0;
	padding: 11.5px 10px;
`;

export const BADropdownBody = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const BADropdownSection = styled.div``;

export const BADropdownSectionHeader = styled.div`
	width: 100%;
	padding: 0 10px;
	margin: 0 0 2.5px 0;
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
		height: 40px;
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
