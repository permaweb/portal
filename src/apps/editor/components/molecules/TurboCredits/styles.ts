import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const DBalanceWrapper = styled.div<{ showBorderBottom: boolean }>`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 15px 0;
	border-bottom: ${(props) => (props.showBorderBottom ? `1px solid ${props.theme.colors.border.primary}` : 'none')};
`;

export const DBalanceHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const DBalanceBody = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const DBodyWrapper = styled.ul`
	width: 100%;
	padding: 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	li {
		text-align: center;
		height: 40px;
		display: flex;
		align-items: center;
		cursor: pointer;
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 7.5px;

		svg {
			height: 16.5px;
			width: 16.5px;
			margin: 5.5px 9.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.primary.active};
		}

		a {
			height: 100%;
			width: 100%;
			display: flex;
			align-items: center;
			border-radius: ${STYLING.dimensions.radius.primary};
			&:hover {
				color: ${(props) => props.theme.colors.font.primary};
				background: ${(props) => props.theme.colors.container.primary.active};
			}
		}
	}
`;

export const DFooterWrapper = styled(DBodyWrapper)`
	border-bottom: none;
	padding: 10px 0 0 0;
`;

export const MWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const MSection = styled.div``;

export const ThemeSectionHeader = styled.div`
	display: flex;
	margin: 0 0 10px 0;
	svg {
		height: 16.5px;
		width: 16.5px;
		margin: 3.5px 9.5px 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const ThemeSectionBody = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 20px;
`;

export const Indicator = styled.div<{ active: boolean }>`
	height: 12.5px;
	width: 12.5px;
	border-radius: 50%;
	background: ${(props) => (props.active ? props.theme.colors.indicator.active : 'transparent')};
	border: 1px solid ${(props) => props.theme.colors.border.alt4};
	transition: all 150ms;
`;

export const MSectionBodyElement = styled.button`
	width: 175px;

	display: flex;
	flex-direction: column;
	gap: 10px;

	border-radius: ${STYLING.dimensions.radius.alt4} !important;

	&:hover {
		${Indicator} {
			background: ${(props) => props.theme.colors.indicator.active} !important;
		}
	}

	div {
		display: flex;
		align-items: center;
		gap: 10px;
		p {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.bold} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
		}
	}
`;

export const Preview = styled.div<{ background: string; accent: string }>`
	position: relative;
	height: 100px;
	width: 100%;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.background};
	border: 1.25px solid ${(props) => props.theme.colors.border.alt4};

	#preview-accent-1 {
		height: 32.5px;
		width: 32.5px;
		position: absolute;
		top: 10px;
		right: 10px;
		border-radius: ${STYLING.dimensions.radius.alt4};
		background: ${(props) => props.accent};
	}
`;

export const WalletListContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	flex-wrap: wrap;
	padding: 20px 0;
`;

export const WalletListItem = styled.button`
	width: 200px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 15px;
	img {
		width: 40px;
		border-radius: 50%;
		margin: 3.5px 0 15px 0;
	}
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const WalletLink = styled.div`
	margin: 10px 0;
	padding: 0 20px;
	text-align: center;
	a,
	span {
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
	span {
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
`;

export const Actions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const AccordionContent = styled.div`
	color: ${(p) => p.theme.colors.font.primary};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.xxSmall};
	margin: 5px 0 0 0;
`;

export const MetaRow = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 6px 0;
	border-bottom: 1px dashed ${(p) => p.theme.colors.border.primary};

	&:last-child {
		border-bottom: none;
	}

	span:first-child {
		color: ${(p) => p.theme.colors.font.alt1};
	}

	span:last-child {
		color: ${(p) => p.theme.colors.font.primary};
		font-weight: ${(p) => p.theme.typography.weight.semiBold};
	}
`;

export const ApprovalsWrapper = styled.div`
	margin-top: 8px;
	padding: 8px 10px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.alt2.background};
`;

export const ApprovalsHeaderRow = styled.div`
	display: grid;
	grid-template-columns: 1fr 1.2fr 1.2fr 0.6fr auto;
	gap: 8px;
	font-weight: 600;
	font-size: ${(p) => p.theme.typography.size.xSmall};
	opacity: 0.8;
	padding: 4px 0;
`;

export const ApprovalRow = styled.div`
	display: grid;
	grid-template-columns: 1.6fr 0.6fr 1fr auto;
	gap: 8px;
	align-items: center;
	padding: 8px 0;
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};
`;

export const ApprovalAddress = styled.div`
	font-family: monospace;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const HeaderRow = styled(Row)`
	font-weight: 600;
	font-size: ${(p) => p.theme.typography.size.xSmall};
	opacity: 0.85;
	padding: 4px 0 6px;
`;

export const Address = styled.div`
	min-width: 0; /* allow ellipsis in grid */
	font-family: monospace;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const Num = styled.div`
	justify-self: end; /* right-align within the grid cell */
	white-space: nowrap; /* keep "0.1688 Credits" on one line */
`;

export const ApprovalsCount = styled.small<{ clickable?: boolean }>`
	opacity: 0.7;
	${(p) =>
		p.clickable &&
		`
      cursor: pointer;
      color: ${p.theme.colors.link};
      text-decoration: underline;
    `}
`;
