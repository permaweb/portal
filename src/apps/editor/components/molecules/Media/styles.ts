import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	h4 {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: clamp(18px, 3.25vw, 24px);
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
	}
`;

export const Body = styled.div<{ isIcon: boolean }>`
	display: flex;
	${(props) => (props.isIcon ? 'gap: 20px;' : 'justify-content: center; flex-wrap: wrap; gap: 20px;')}
`;

export const PWrapper = styled.div<{ isIcon: boolean }>`
	height: fit-content;
	width: ${(props) => (props.isIcon ? 'fit-content' : '100%')};
	input {
		display: none;
	}

	${(props) =>
		props.isIcon
			? `
		@media (max-width: ${STYLING.cutoffs.initial}) {
			display: flex;
			justify-content: center;
		}
	`
			: ''}
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
	display: flex;
	justify-content: center;
	position: relative;
	width: 100%;
`;

export const RemoveWrapper = styled.div`
	position: absolute;
	z-index: 1;
	top: 5px;
	right: 5px;
	display: none;
`;

export const LInput = styled.div<{ hasMedia: boolean; isIcon: boolean; disabled: boolean }>`
	${(props) =>
		props.isIcon
			? `
		height: 100px;
		width: 100px;
	`
			: `
		height: ${props.hasMedia ? 'auto' : '170px'};
		max-height: 200px;
		width: 100%;
	`}
	position: relative;
	background: ${(props) =>
		props.hasMedia
			? 'transparent'
			: props.disabled
			? props.theme.colors.button.primary.disabled.background
			: props.theme.colors.container.primary.background};
	border: ${(props) =>
		props.hasMedia
			? `none`
			: props.disabled
			? `1px dashed ${props.theme.colors.button.primary.disabled.border}`
			: `1px dashed ${props.theme.colors.border.primary}`};
	border-radius: ${STYLING.dimensions.radius.alt2};
	z-index: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	pointer-events: ${(props) => (props.disabled ? 'none' : 'all')};
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) =>
			props.isIcon ? props.theme.typography.size.xxxxSmall : props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
	svg {
		height: 20px;
		width: 20px;
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
		border: 1px dashed
			${(props) =>
				props.disabled ? props.theme.colors.button.primary.disabled.border : props.theme.colors.border.alt4};
		background: ${(props) =>
			props.hasMedia
				? 'transparent'
				: props.disabled
				? props.theme.colors.button.primary.disabled.background
				: props.theme.colors.container.primary.active};
		cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
	}
	&:focus {
		opacity: 1;
	}
	${(props) =>
		props.hasMedia && !props.disabled
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
			${RemoveWrapper} {
				display: block;
			}
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

export const SActions = styled.div`
	min-height: 100px;
	width: 100%;
	display: flex;
	gap: 20px;
	flex-direction: column;
	justify-content: space-between;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-align: right;
	}
`;

export const SAction = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	position: relative;
`;

export const MWrapper = styled.div`
	padding: 0 20px 20px 20px;
`;

export const MInfo = styled.div`
	margin: 0 0 20px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const MActions = styled.div`
	margin: 10px 0 0 0;
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;
