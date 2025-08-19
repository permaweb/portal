import styled from 'styled-components';

import { open, transition3 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	position: relative;
	animation: ${open} ${transition3};

	#wanderConnectButtonHost {
		display:none;
	}
`;

export const PWrapper = styled.div`
	display: flex;
	align-items: center;

	svg {
		padding: 2.5px 0 0 0;
		margin: 2.5px 0 0 0;
	}
`;

export const CAction = styled.div`
	margin: 0 15px 0 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;

export const LAction = styled.button`
	height: 35px;
	padding: 0 17.5px;
	margin: 0 15px 0 0;
	display: none;
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		display: block;
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
	@media (max-width: ${STYLING.cutoffs.initial}) {
		display: none;
	}
`;

export const FlexAction = styled.div`
	display: flex;
	align-items: center;
	svg {
		height: 25px;
		width: 20px;
		margin: 0 -2.5px 0 11.5px;
	}
`;

export const Dropdown = styled.div`
	max-height: 65vh;
	width: 325px;
	max-width: 75vw;
	padding: 11.5px 10px;
	position: absolute;
	z-index: 1;
	top: 40px;
	right: -1.5px;
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const DHeaderWrapper = styled.div`
	width: 100%;
`;

export const PDropdownHeader = styled.div`
	padding: 0 7.5px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const DHeaderFlex = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12.5px;
	margin: 7.5px 0 0 0;
	padding: 0 5px 15px 5px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	svg {
		padding: 2.5px 0 0 0;
		margin: 2.5px 0 0 0;
	}
`;

export const DHeader = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const DBalanceWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 15px 7.5px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
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
	align-items: center;
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
