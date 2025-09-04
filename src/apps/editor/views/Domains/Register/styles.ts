import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 40px;
`;

export const SectionWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const SectionHeader = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		white-space: nowrap;
	}
`;

export const SectionDivider = styled.div`
	height: 1.5px;
	width: 100%;
	border-top: 1.5px solid ${(props) => props.theme.colors.border.alt4};
`;

export const SectionBody = styled.div``;

export const SearchWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 25px;
`;

export const SearchInputWrapper = styled.div`
	width: 510px;
	max-width: 100%;
	position: relative;

	input {
		background: transparent;
		padding: 10px 10px 10px 40.5px !important;
		margin: 0 !important;
	}

	svg {
		height: 15px;
		width: 15px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		position: absolute;
		z-index: 1;
		top: 24.5px;
		left: 13.5px;
	}
`;

export const SearchOutputWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
`;

export const IndicatorWrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 17.5px 0 0 0;
`;

export const IndicatorLine = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		white-space: nowrap;
	}
`;

export const Indicator = styled.div<{ status: null | 'valid' | 'invalid' }>`
	min-height: 13.5px;
	height: 13.5px;
	min-width: 13.5px;
	width: 13.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => {
		if (props.status === 'valid') return props.theme.colors.indicator.active;
		if (props.status === 'invalid') return props.theme.colors.warning.primary;
		return props.theme.colors.container.alt4.background;
	}};
	border: 1px solid ${(props) => props.theme.colors.border.alt4};
	border-radius: 50%;

	svg {
		height: 7.5px;
		width: 7.5px;
		margin: 0 0 2.15px 0;
		color: ${(props) => props.theme.colors.font.light1};
		fill: ${(props) => props.theme.colors.font.light1};
	}
`;

export const PurchaseActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 25px;
	margin: 15px 0 0 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const PurchaseActionWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PurchaseAction = styled.div<{ disabled: boolean; active: boolean }>`
	height: 125px;
	width: 100%;
	padding: 15px;
	text-align: left;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 30px;
	cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	pointer-events: ${(props) => (props.disabled ? 'none' : 'all')};

	background: ${(props) =>
		props.active
			? props.theme.colors.button.alt1.background
			: props.disabled
			? props.theme.colors.button.primary.disabled.background
			: props.theme.colors.button.primary.background};
	border: 1px solid
		${(props) =>
			props.active
				? props.theme.colors.button.alt1.background
				: props.disabled
				? props.theme.colors.button.primary.disabled.border
				: props.theme.colors.button.primary.border};
	border-radius: ${STYLING.dimensions.radius.primary};

	p {
		color: ${(props) =>
			props.active
				? props.theme.colors.button.alt1.color
				: props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		white-space: nowrap;
	}

	span {
		color: ${(props) =>
			props.active
				? props.theme.colors.button.alt1.color
				: props.disabled
				? props.theme.colors.button.primary.disabled.color
				: props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		letter-spacing: 0.15px;
		white-space: nowrap;
	}

	&:hover {
		background: ${(props) =>
			props.active
				? props.theme.colors.button.alt1.background
				: props.disabled
				? props.theme.colors.button.primary.disabled.background
				: props.theme.colors.button.primary.active.background};
		border: 1px solid
			${(props) =>
				props.active
					? props.theme.colors.button.alt1.background
					: props.disabled
					? props.theme.colors.button.primary.disabled.border
					: props.theme.colors.button.primary.active.border};
	}
`;

export const PurchaseActionLine = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	justify-content: space-between;
`;

export const LeaseDuration = styled.div<{ active: boolean }>`
	display: flex;
	align-items: center;
	gap: 15px;

	span {
		color: ${(props) => (props.active ? props.theme.colors.font.light1 : props.theme.colors.font.primary)} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: none !important;
	}
`;

export const PaymentMethodWrapper = styled.div`
	margin: 0 0 12px 0;
`;

export const CheckoutWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 7.5px 0 40px 0;
`;

export const CheckoutLine = styled.div<{ insufficientBalance?: boolean }>`
	width: 100%;
	display: flex;
	gap: 7.5px;
	align-items: center;
	justify-content: space-between;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
	}

	p {
		color: ${(props) =>
			props.insufficientBalance ? props.theme.colors.warning.primary : props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		font-family: ${(props) => props.theme.typography.family.primary};
		display: flex;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
	}
`;

export const CheckoutDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const UpdateWrapper = styled.div`
	height: fit-content;
	padding: 5px 15px;
	display: flex;
	align-items: center;
	gap: 7.5px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;
	background: ${(props) => props.theme.colors.container.alt11.background};

	p {
		color: ${(props) => props.theme.colors.font.light1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: none !important;
	}
`;

export const UnauthorizedWrapper = styled(UpdateWrapper)`
	background: ${(props) => props.theme.colors.warning.primary} !important;
	border: 1px solid ${(props) => props.theme.colors.warning.primary} !important;

	span {
		color: ${(props) => props.theme.colors.font.light1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: none !important;
	}
`;

export const InsufficientBalance = styled(UpdateWrapper)`
	width: fit-content;
	margin: 20px 0 0 auto;
	background: ${(props) => props.theme.colors.warning.primary};
`;

export const ActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	gap: 15px;
	margin: 0 0 12.5px auto;
`;

export const SuccessWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const SuccessLine = styled.div`
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

export const SuccessLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const SuccessDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const SuccessValue = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const SuccessActions = styled.div`
	margin: 15px 0 0 0;
	display: flex;
	gap: 15px;
	justify-content: flex-end;
`;

export const ErrorWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const ErrorLine = styled.div`
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

export const ErrorLabel = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const ErrorDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const ErrorValue = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const ErrorActions = styled.div`
	margin: 15px 0 0 0;
	display: flex;
	justify-content: flex-end;
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12.5px;
`;

export const ModalHeader = styled.div`
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-size: ${(props) => props.theme.typography.size.base};
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ModalGrid = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const ModalLine = styled.div`
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

export const ModalLabel = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
`;

export const ModalDivider = styled.div`
	flex: 1;
	margin: 10px 0 0 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.alt4};

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		display: none;
	}
`;

export const ModalValue = styled.span`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
	font-family: ${(props) => props.theme.typography.family.primary};
	display: flex;
	text-transform: lowercase;

	&.uppercase {
		text-transform: none;
	}
`;

export const ModalActions = styled.div`
	display: flex;
	gap: 15px;
	margin: 15px 0 0 0;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
`;

export const PaymentSummaryWrapper = styled.div`
	grid-column: 1 / -1;
`;

export const TestnetInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	a {
		width: fit-content;
		display: block;
		margin: 0 0 15px 0;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;
