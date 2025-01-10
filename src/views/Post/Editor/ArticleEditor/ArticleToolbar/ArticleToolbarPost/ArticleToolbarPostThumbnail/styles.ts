import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	margin: 10px 0 0 0;
`;

export const InputWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	position: relative;
	input {
		display: none;
	}
`;

export const Input = styled.button<{ hasInput: boolean }>`
	height: 140px;
	width: 100%;
	position: relative;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: ${(props) => (props.hasInput ? `none` : `1px dashed ${props.theme.colors.border.alt1}`)};
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
		object-fit: cover;
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
		props.hasInput && !props.disabled
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

export const FooterWrapper = styled.div`
	width: 100%;
	margin: 4.5px 0 0 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
