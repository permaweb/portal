import styled from 'styled-components';

import { getPostStatusBackground } from 'editor/styles';

import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

export const Wrapper = styled.div`
	width: 100%;
	position: relative;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;

	p {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-align: center;
		text-transform: none !important;
		display: flex;
		align-items: center;
		gap: 3.5px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.post-creator-info {
		color: ${(props) => props.theme.colors.font.alt2} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-align: center;
		text-transform: none !important;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	> * {
		height: fit-content;
		width: fit-content;
	}
`;

export const StatusIndicator = styled.span<{ status: ArticleStatusType }>`
	position: relative;
	width: 12.5px;
	height: 12.5px;
	border-radius: 50%;
	pointer-events: none;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	background: ${(props) => getPostStatusBackground(props.status, props.theme)};
	margin: 0 0 0 2.5px;
`;

export const Dropdown = styled.ul`
	width: 100%;
	position: absolute;
	top: 30px;
	left: 0;
	z-index: 2;
	padding: 10px 0;
	border-radius: ${STYLING.dimensions.radius.alt4} !important;
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const Option = styled.li<{ active: boolean }>`
	text-align: center;
	height: 37.5px;
	display: flex;
	align-items: center;
	cursor: ${(props) => (props.active ? 'default' : 'pointer')};
	pointer-events: ${(props) => (props.active ? 'none' : 'all')};
	color: ${(props) => (props.active ? props.theme.colors.font.primary : props.theme.colors.font.alt1)};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	background: ${(props) =>
		props.active ? props.theme.colors.container.primary.active : props.theme.colors.container.primary.background};
	border: 1px solid transparent;
	padding: 0 15px;
	transition: all 100ms;
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const Divider = styled.div`
	height: 1px;
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	margin: 7.5px 0 10px 0;
`;
