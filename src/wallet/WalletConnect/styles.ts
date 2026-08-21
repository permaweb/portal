import styled from 'styled-components';

import { open, transition3 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	position: relative;
	animation: ${open} ${transition3};

	#wanderConnectButtonHost {
		display: none;
	}
`;

export const PWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	position: relative;

	svg {
		padding: 2.5px 0 0 0;
		margin: 2.5px 0 0 0;
	}
`;

export const PendingControl = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	margin: 0 12px 0 0;
`;

export const PendingButton = styled.button`
	width: auto;
	height: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 0;
	background: transparent;
	border: 0;
	cursor: pointer;
	transition: opacity ${transition3};

	&:hover {
		opacity: 0.65;
	}
`;

export const PendingLabel = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	white-space: nowrap;
`;

export const PendingSpinner = styled.span`
	width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 2px solid ${(props) => props.theme.colors.indicator.neutral};
	border-right-color: transparent;
	animation: pending-spin 0.85s linear infinite;

	@keyframes pending-spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

export const PendingDropdown = styled.div`
	width: 430px;
	max-width: calc(100vw - 24px);
	padding: 0 12px;
	position: absolute;
	z-index: 2;
	top: 28px;
	right: -5px;
`;

export const PendingHeader = styled.div`
	padding: 12px 4px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const PendingList = styled.ul`
	max-height: 280px;
	overflow-y: auto;
	padding: 0;

	li:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}

	li button {
		width: 100%;
		padding: 12px 4px;
		text-align: left;
		border-radius: ${STYLING.dimensions.radius.alt4};
		background: transparent;
		border: 0;
		cursor: pointer;

		&:hover {
			background: transparent;

			span,
			code {
				color: ${(props) => props.theme.colors.font.alt1};
				text-decoration: underline;
				text-decoration-thickness: 1.25px;
			}
		}

		code {
			display: block;
			margin-top: 9px;
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xxxSmall};
			line-height: 1.35;
			white-space: nowrap;
		}
	}
`;

export const PendingTransactionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		text-transform: uppercase;
	}

	time {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
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
	width: 300px;
	max-width: 75vw;
	padding: 11.5px 10px;
	position: absolute;
	z-index: 1;
	top: 42.5px;
	right: -1.5px;
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
	padding: 0 7.5px 2.5px 7.5px;

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

export const MenuBadge = styled.span`
	position: absolute;
	right: 10px;
	background: ${(props) => props.theme.colors.warning.primary};
	color: ${(props) => props.theme.colors.font.light1};
	border-radius: 10px;
	padding: 1px 6px;
	font-size: 11px;
	font-weight: bold;
	min-width: 18px;
	text-align: center;
`;

export const NotificationBubble = styled.div`
	position: absolute;
	top: -5px;
	right: -7.5px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: ${(props) => props.theme.colors.warning.primary};
	display: flex;
	align-items: center;
	justify-content: center;
	animation: pulse 2s infinite;
	color: ${(props) => props.theme.colors.font.light1};
	font-size: 10px;
	font-weight: bold;
	font-family: ${(props) => props.theme.typography.family.primary};

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 ${(props) => props.theme.colors.warning.primary};
		}
		70% {
			box-shadow: 0 0 0 8px transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
`;

export const BackupNotice = styled.div`
	width: 100%;
	padding: 10px;
	margin: 10px 0;
	background: ${(props) => `${props.theme.colors.indicator.neutral}20`};
	border: 1px solid ${(props) => props.theme.colors.indicator.neutral};
	border-radius: ${STYLING.dimensions.radius.primary};
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	transition: all 200ms;

	svg {
		height: 18px;
		width: 18px;
		color: ${(props) => props.theme.colors.indicator.neutral};
		fill: ${(props) => props.theme.colors.indicator.neutral};
		flex-shrink: 0;
	}

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		line-height: 1.4;
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
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
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
			fill: none !important;

			[fill='none'] {
				fill: none !important;
			}
		}

		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.primary.active};
		}

		&[aria-disabled='true'] {
			opacity: 0.45;
			cursor: not-allowed;

			&:hover {
				background: transparent;
			}
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

export const AppearanceSection = styled.section`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const AppearanceTitle = styled.p`
	padding: 0 7.5px;
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
`;

export const AppearanceOptions = styled.div`
	display: flex;
	flex-direction: column;
`;

export const AppearanceOption = styled.button`
	width: 100%;
	height: 40px;
	display: flex;
	align-items: center;
	padding: 0 7.5px;
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-align: left;
	background: transparent;
	border: 1px solid transparent;
	border-radius: ${STYLING.dimensions.radius.alt4};
	cursor: pointer;
	transition: all 100ms;

	> div,
	> svg {
		width: 16.5px;
		height: 16.5px;
		margin-right: 9.5px;
		flex: none;
	}

	> div {
		display: flex;
		align-items: center;
	}

	svg {
		width: 16.5px;
		height: 16.5px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: none !important;

		[fill='none'] {
			fill: none !important;
		}
	}

	&:hover {
		color: ${(props) => props.theme.colors.font.primary};
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const AppearanceIndicator = styled.span`
	width: 7px;
	height: 7px;
	margin-left: auto;
	background: ${(props) => props.theme.colors.indicator.active};
	border-radius: 50%;
	flex: none;
`;

export const MWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const SystemSyncWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	margin: 5px 0 0 0;

	button {
		border-radius: ${STYLING.dimensions.radius.primary};
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
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
	padding-top: 12px;
	padding-bottom: 4px;
	color: ${(p) => p.theme.colors.font.primary};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.xSmall};
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
