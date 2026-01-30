import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const PageWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const Page = styled.div<{ collapsed: boolean; static: boolean }>`
	display: flex;
	padding: 15px 15px 15.5px 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	transition: all 100ms;
	background: ${(props) =>
		props.static ? props.theme.colors.container.primary.background : props.theme.colors.container.alt1.background};
	border-top-left-radius: calc(${STYLING.dimensions.radius.alt1} - 1.5px);
	border-top-right-radius: calc(${STYLING.dimensions.radius.alt1} - 1.5px);
	border-bottom-left-radius: ${(props) =>
		props.collapsed || props.static ? `calc(${STYLING.dimensions.radius.alt1} - 1.5px)` : '0'};
	border-bottom-right-radius: ${(props) =>
		props.collapsed || props.static ? `calc(${STYLING.dimensions.radius.alt1} - 1.5px)` : '0'};
	cursor: ${(props) => (props.static ? 'default' : 'pointer')};

	&:hover {
		background: ${(props) =>
			props.static
				? props.theme.colors.container.primary.background
				: props.theme.colors.button.primary.active.background};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const Arrow = styled.div<{ $open: boolean }>`
	display: flex;
	align-items: center;
	svg {
		width: 17.5px;
		height: 17.5px;
		margin: 0 3.5px -3.5px 0;
		transform: rotate(${(props) => (props.$open ? '0deg' : '270deg')});
		fill: ${(props) => props.theme.colors.font.primary};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const PageHeader = styled.div`
	max-width: 50%;
	display: flex;
	align-items: center;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
		min-width: 60px;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const PageDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const PageActions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const PageMenuWrapper = styled.div`
	position: relative;
`;

export const PageMenuAction = styled.div`
	button {
		padding: 3.5px 0 0 0 !important;
	}
`;

export const PageMenuDropdown = styled.div`
	max-height: 75vh;
	width: 265px;
	max-width: 80vw;
	position: absolute;
	z-index: 2;
	top: 30.5px;
	right: 0;
	padding: 10px;

	button {
		height: 35px;
		width: 100%;
		display: flex;
		gap: 12.5px;
		align-items: center;
		cursor: pointer;
		background: transparent;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;

		p {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.medium} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
			display: block;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: 85%;
			overflow: hidden;
			text-decoration: none !important;
		}

		svg {
			height: 14.5px;
			width: 14.5px;
			margin: 2.5px 0 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
`;

export const PageMenuWarning = styled.button`
	padding: 0 8.5px;

	p {
		color: ${(props) => props.theme.colors.warning.primary} !important;
	}

	svg {
		color: ${(props) => props.theme.colors.warning.primary} !important;
		fill: ${(props) => props.theme.colors.warning.primary} !important;
	}
`;

export const RemoveModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 20px 20px 20px !important;
`;

export const RemoveModalBodyWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const RemoveModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
	margin: 10px 0 0 0;
`;
