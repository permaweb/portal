import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const LoadingBanner = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
	padding: 12.5px 15px;

	.label {
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		white-space: nowrap;
	}

	.chips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 23.5px;
		padding: 2px 8px;
		border-radius: 16px;
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		background: ${(props) => props.theme.colors.roles.alt3};
	}
`;

export const DomainWrapper = styled.div<{ isOpen: boolean }>`
	width: 100%;
	display: flex;
	padding: 15px;
	position: relative;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	background: ${(props) =>
		props.isOpen
			? props.theme.colors.button.primary.active.background
			: props.theme.colors.container.primary.background};
	cursor: pointer;
	transition: all 100ms;

	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const DomainHeader = styled.div`
	max-width: 60%;
	flex: 1;
	position: relative;

	a {
		display: flex;
		align-items: center;
		gap: 5px;

		&:hover {
			svg {
				color: ${(props) => props.theme.colors.font.alt1};
				fill: ${(props) => props.theme.colors.font.alt1};
			}
			p {
				color: ${(props) => props.theme.colors.font.alt1};
			}
		}

		svg {
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
		}
	}

	h4 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		margin: 0;
		line-height: 1;
		display: inline-flex;
		align-items: center;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		margin: 2px 0;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const DomainDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const DomainActions = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;
	flex-wrap: wrap;
`;

export const WrapperEmpty = styled.div`
	padding: 12.5px 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 40px 15px;
`;

export const SectionHeader = styled.div`
	padding: 17.5px 15px 15px 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	h3 {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		margin: 0 0 5px 0;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		margin: 0;
		text-transform: none;
	}
	.inline-progress {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-left: 8px;
		opacity: 0.8;
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}
`;

export const SectionWrapper = styled.div`
	overflow: hidden;
`;

export const SectionBody = styled.div`
	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const StatusBadge = styled.span`
	display: inline-block;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	text-transform: uppercase;
	margin-top: 5px;
`;

export const DomainDetails = styled.div`
	padding: 15px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};

	.details-grid {
		display: flex;
		flex-direction: column;
		gap: 15px;

		.label {
			font-size: ${(props) => props.theme.typography.size.xSmall};
			color: ${(props) => props.theme.colors.font.alt1};
		}

		.value {
			font-size: ${(props) => props.theme.typography.size.xSmall};
			font-weight: ${(props) => props.theme.typography.weight.xBold};
			color: ${(props) => props.theme.colors.font.primary};
		}

		.badge {
			padding: 2px 8px;
			border-radius: 12px;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;

			&.permanent {
				background-color: ${(props) => props.theme.colors.roles.alt2};
				color: ${(props) => props.theme.colors.font.light1};
			}

			&.lease {
				background-color: ${(props) => props.theme.colors.roles.primary};
				color: ${(props) => props.theme.colors.font.light1};
			}
		}
	}
`;

export const DomainCosts = styled.div`
	margin: 15px 0 0 0;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const DomainCostActions = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	gap: 15px;
	margin: 10px 0 0 0;
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const ModalSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2.5px;

	p {
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;

export const ModalSectionTitle = styled.div`
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
`;

export const ModalSectionContent = styled.div`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
`;

export const ModalYearSelector = styled.div`
	display: flex;
	gap: 12.5px;
	align-items: center;
	margin: 7.5px 0 0 0;

	button {
		flex: 1;
	}
`;

export const ModalCostSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;

	> div {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
`;

export const ModalCostGrid = styled.div`
	display: grid;
	grid-template-columns: 140px 1fr;
	row-gap: 10px;
	column-gap: 16px;
	align-items: center;
`;

export const ModalCostLabel = styled.div`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
`;

export const ModalCostValue = styled.div`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
`;

export const LoadingIndicator = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 6px;
`;

export const PaymentSelectorWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

export const PaymentSummaryWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;
`;

export const InsufficientBalanceWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

export const ModalActions = styled.div`
	display: flex;
	gap: 15px;
	flex-wrap: wrap;
	justify-content: flex-end;
	margin: 15px 0 0 0;
`;

export const UpgradeModalActions = styled(ModalActions)``;

export const LoadingBannerWrapper = styled.div`
	width: 100%;
	padding: 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;

	p {
		margin: 0;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;

export const DomainHeaderContent = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;
	position: relative;
`;

export const DomainArrow = styled.div<{ isOpen: boolean }>`
	svg {
		height: 15px;
		width: 15px;
		margin: 7.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
		transform: rotate(${(props) => (props.isOpen ? '0deg' : '270deg')});
	}
`;

export const DomainName = styled.h4`
	margin: 0;
`;

export const EmptyStateWrapper = styled.div`
	padding: 15px;
	display: flex;
	flex-direction: column;
	gap: 10px;

	p {
		margin: 0;
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}

	span {
		margin: 0;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const DomainDetailLine = styled.div`
	width: 100%;
	display: flex;
	gap: 7.5px;
	align-items: center;
	justify-content: space-between;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
	}
`;

export const DomainDetailActions = styled.div`
	margin: 20px 0 0 0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

export const DomainDetailDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const DomainNameWrapper = styled.div`
	position: relative;
	display: inline-block;

	.notification {
		position: absolute;
		top: -5px;
		right: -22.5px;
	}
`;

export const UpgradeBadge = styled.div`
	position: absolute;
	top: -18px;
	right: -60px;

	button {
		height: 16px;
		background: ${(props) => props.theme.colors.roles.primary};
		color: ${(props) => props.theme.colors.font.light1};
		padding: 2px 6px;
		font-size: 10px;
		line-height: 1;
		border-radius: 10px;
	}
`;
