import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const NWrapper = styled.div`
	height: 100vh;
	width: ${STYLING.dimensions.nav.width};
	position: fixed;
	top: 0;
	left: 0;
	z-index: 4;

	background: ${(props) => props.theme.colors.container.alt1.background};
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		height: auto;
		width: 100%;
		position: absolute;
	}
`;

export const NContent = styled.div`
	height: 100%;
	width: 100%;
	z-index: 1;
	padding: 15px 20px;
	@media (max-width: ${STYLING.cutoffs.initial}) {
		position: relative;
		top: auto;
		padding: 0 15px;
		max-height: none;
		background: ${(props) => props.theme.colors.container.alt3.background};
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		border-radius: ${STYLING.dimensions.radius.primary};
	}
`;

export const NTitle = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin: 0 0 20px 0;
	p {
		font-family: ${(props) => props.theme.typography.family.alt1};
		font-size: 22px !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		color: ${(props) => props.theme.colors.font.primary} !important;
	}
`;

export const NTitleMobile = styled.button<{ open: boolean }>`
	height: 50px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	&:hover {
		cursor: pointer;
	}

	&:focus {
		outline: 0;
	}
	@media (max-width: ${STYLING.cutoffs.initial}) {
		height: 40px;
	}
	p {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		color: ${(props) => props.theme.colors.font.primary} !important;
	}
	svg {
		height: 12.5px;
		width: 12.5px;
		margin: 3.5px 0 0 0;
		transform: rotate(${(props) => (props.open ? '180deg' : '0deg')});
		fill: ${(props) => props.theme.colors.font.primary};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const NList = styled.ul`
	width: 100%;
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 20px;
	a {
		width: fit-content;
		text-decoration: none;
		display: block;
		&:hover {
			color: ${(props) => props.theme.colors.font.alt1} !important;
		}
	}
`;

export const NListItem = styled.li<{ disabled: boolean; active: boolean }>`
	pointer-events: ${(props) => (props.disabled ? 'none' : 'default')};
	text-align: center;
	display: flex;
	align-items: center;
	cursor: pointer;
	font-size: ${(props) => props.theme.typography.size.xSmall};
	color: ${(props) => (props.active ? props.theme.colors.font.alt5 : props.theme.colors.font.alt1)};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	margin: 0 0 7.5px 0;
	line-height: 1.75;
	text-align: left;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: transparent;

	&:hover {
		color: ${(props) => (props.active ? props.theme.colors.font.alt5 : props.theme.colors.font.primary)};
	}
`;

export const NGroup = styled.div``;

export const NSubHeader = styled(NTitle)`
	height: auto;
	justify-content: flex-start;
	font-size: ${(props) => props.theme.typography.size.small};
	border-top-left-radius: 0;
	border-top-right-radius: 0;
	margin: 0 0 10px 0;
	p {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small} !important;
		color: ${(props) => props.theme.colors.font.primary} !important;
	}
`;

export const NSubList = styled.div`
	padding: 0 0 0 15px;
	border-left: 1px solid ${(props) => props.theme.colors.border.primary};
`;
