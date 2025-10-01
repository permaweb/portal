import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	margintop: 10px;
	h4 {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: clamp(18px, 3.25vw, 24px);
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
	}
`;

export const Body = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 10px;
	padding: 28px 20px;
`;

export const IconWrapper = styled.div`
	padding: 15px;
`;

export const Form = styled.div`
	height: fit-content;
	width: 100%;
	@media (max-width: calc(${STYLING.cutoffs.initial} + 105px)) {
		min-width: 0;
		width: 100%;
		flex: none;
	}
`;

export const TForm = styled.div`
	margin: -40px 0 30px 0;
	> * {
		&:last-child {
			margin: 20px 0 0 0;
		}
	}
`;

export const PWrapper = styled.div`
	height: fit-content;
	width: 100%;

	display: flex;
	flex-direction: column;
	gap: 25px;

	input {
		display: none;
	}
`;

export const CWrapper = styled.div`
	display: flex;
	align-items: center;
	span {
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		display: block;
		max-width: 75%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.c-wrapper-checkbox {
		margin: 4.5px 0 0 7.5px;
	}
`;

export const FileInputWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	position: relative;
`;

export const LInput = styled.button<{ hasLogo: boolean }>`
	height: 170px;
	width: 100%;
	position: relative;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: ${(props) => (props.hasLogo ? `none` : `1px dashed ${props.theme.colors.border.primary}`)};
	border-radius: ${STYLING.dimensions.radius.alt2};
	z-index: 1;
	overflow: hidden;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
	svg {
		height: 25px;
		width: 25px;
		margin: 0 0 5px 0;
		color: ${(props) => props.theme.colors.icon.primary.fill};
		fill: ${(props) => props.theme.colors.icon.primary.fill};
	}
	img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}
	&:hover {
		border: 1px dashed ${(props) => props.theme.colors.border.alt2};
		background: ${(props) => props.theme.colors.container.primary.active};
	}
	&:focus {
		opacity: 1;
	}
	&:disabled {
		background: ${(props) => props.theme.colors.button.primary.disabled.background};
		border: 1px dashed ${(props) => props.theme.colors.button.primary.disabled.border};
		span {
			color: ${(props) => props.theme.colors.button.primary.disabled.color};
		}
		svg {
			fill: ${(props) => props.theme.colors.button.primary.disabled.color};
			color: ${(props) => props.theme.colors.button.primary.disabled.color};
		}
	}
	${(props) =>
		props.hasLogo && !props.disabled
			? `
        pointer-events: all;
        ::after {
            content: "";
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${props.theme.colors.overlay.alt1};
			border-radius: ${STYLING.dimensions.radius.alt2};
            opacity: 0;
            transition: all 100ms;
        }
        &:hover::after {
            opacity: 1;
        }
        &:focus::after {
            opacity: 1;
        }
        &:hover {
            cursor: pointer;
            border: none;
        }
    `
			: ''}
`;

export const PActions = styled.div`
	margin: 20px 0 0 0;
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const SAction = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	margin: 20px 0 0 0;
	position: relative;
`;

export const MWrapper = styled.div`
	padding: 0 20px 20px 20px;
`;

export const MInfo = styled.div`
	margin: 0 0 20px 0;
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		line-height: 1.5;
	}
`;

export const MActions = styled.div`
	margin: 10px 0 0 0;
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const SubdomainSection = styled.div`
	width: 100%;
	margin: 10px 0 0 0;
	display: grid;
	row-gap: 12px;
`;

export const CheckRow = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	input[type='checkbox'] {
		display: inline-block; /* override any inherited display:none */
		appearance: checkbox; /* in case a reset removed default look */
		height: 16px;
		width: 16px;
		margin: 0;
		accent-color: ${(p) => p.theme.colors.primary1};
	}

	label {
		color: ${(p) => p.theme.colors.font.primary};
		font-size: ${(p) => p.theme.typography.size.small};
		font-weight: ${(p) => p.theme.typography.weight.medium};
		user-select: none;
		cursor: pointer;
	}
`;

export const SubdomainCard = styled.div`
	width: 100%;
	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
	padding: 14px;
	display: grid;
	row-gap: 12px;
`;

export const SubdomainHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	span {
		color: ${(p) => p.theme.colors.font.primary};
		font-size: ${(p) => p.theme.typography.size.small};
		font-weight: ${(p) => p.theme.typography.weight.bold};
	}
`;

export const SubdomainActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const SubdomainInput = styled.input`
	height: ${STYLING.dimensions.form.small};
	width: 100%;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(p) => p.theme.colors.container.primary.background};
	color: ${(p) => p.theme.colors.font.primary};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	padding: 0 12px;
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.base};

	&:focus-visible {
		outline: 2px solid ${(p) => p.theme.colors.primary1};
		outline-offset: 1px;
	}

	&:disabled {
		background: ${(p) => p.theme.colors.button.primary.disabled.background};
		color: ${(p) => p.theme.colors.button.primary.disabled.color};
		border-color: ${(p) => p.theme.colors.button.primary.disabled.border};
		cursor: not-allowed;
	}
`;

export const SubdomainPreview = styled.div`
	min-height: ${STYLING.dimensions.form.small};
	display: flex;
	align-items: center;
	padding: 0 12px;
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px dashed ${(p) => p.theme.colors.border.primary};
	color: ${(p) => p.theme.colors.font.alt1};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.base};
`;

export const SubdomainHint = styled.div`
	font-size: ${(p) => p.theme.typography.size.xSmall};
	color: ${(p) => p.theme.colors.font.alt1};
	a {
		color: ${(p) => p.theme.colors.link?.primary || p.theme.colors.font.primary};
		text-decoration: underline;
	}
`;

export const Validation = styled.div`
	display: grid;
	row-gap: 4px;
	font-size: ${(p) => p.theme.typography.size.xSmall};
	color: ${(p) => p.theme.colors.font.primary};

	span {
		display: block;
		line-height: 1.4;
	}
`;

export const Error = styled.div`
	color: ${(p) => p.theme.colors.negative1 || '#c62828'};
	font-size: ${(p) => p.theme.typography.size.xSmall};
	font-weight: ${(p) => p.theme.typography.weight.medium};
`;

export const StatusLine = styled.div`
	margin-top: 8px;
	font-size: 12px;
	opacity: 0.9;
`;
