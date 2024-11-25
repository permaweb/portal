import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0 0 5px 0;
`;

export const LinksAction = styled.div`
	position: relative;
`;

export const LinkDetailsWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;

	#link-icon-input {
		display: none;
	}
`;

export const IconInput = styled.button<{ hasData: boolean }>`
	min-height: 40px;
	min-width: 40px;
	height: 40px;
	width: 40px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: ${(props) =>
		props.hasData ? `1px solid ${props.theme.colors.border.alt2}` : `1px dashed ${props.theme.colors.border.alt2}`};
	border-radius: 50%;
	overflow: hidden;
	margin: 20px 0 0 0;
	position: relative;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: 10px;
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
	svg {
		height: 22.5px;
		width: 22.5px;
		margin: 3.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
	img {
		height: 100%;
		width: 100%;
		border-radius: 50%;
		object-fit: cover;
	}
	&:hover {
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
		props.hasData && !props.disabled
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

export const LinksActionHeader = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	position: relative;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LinkPrefillWrapper = styled.div`
	width: fit-content;
`;

export const LinkPrefillsDropdown = styled.div`
	max-height: 52.5vh;
	width: 215px;
	max-width: 75vw;
	padding: 7.5px 5px;
	position: absolute;
	z-index: 2;
	top: 32.5px;
	right: 0;
	background: ${(props) => props.theme.colors.container.alt1.background} !important;
	box-shadow: none !important;
	border-radius: ${STYLING.dimensions.radius.alt2} !important;
`;

export const LinkPrefillOptions = styled.div``;

export const LinkPrefillOption = styled.button`
	height: 35px;
	width: 100%;
	display: flex;
	align-items: center;
	gap: 15px;
	cursor: pointer;
	pointer-events: auto;
	background: transparent;
	border-radius: ${STYLING.dimensions.radius.alt2};
	transition: all 100ms;
	padding: 0 10px;
	span {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 85%;
		overflow: hidden;
	}
	svg {
		height: 17.5px;
		width: 17.5px;
		margin: 2.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const LinksActionFlex = styled.div`
	button {
		margin: 20px 0 0 auto;
	}
`;

export const LinksBody = styled.div<{ type: ViewLayoutType }>`
	display: flex;
	flex-wrap: wrap;
	gap: 15px 25px;
	padding: 15px 15px 10px 15px;
	margin: 15px 0 0 0;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 1.5px 0 0 0;

	border: 1px solid ${(props) => props.theme.colors.tooltip.border};

	span {
		font-size: 10px !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const LinkWrapper = styled.div`
	position: relative;

	&:hover {
		${LinkTooltip} {
			display: block;
		}
	}

	a,
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 200ms;

		svg {
			height: 22.5px;
			width: 22.5px;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		img {
			height: 22.5px;
			width: 22.5px;
		}

		&:hover {
			svg {
				color: ${(props) => props.theme.colors.font.alt5};
				fill: ${(props) => props.theme.colors.font.alt5};
			}
		}
		&:focus {
			svg {
				color: ${(props) => props.theme.colors.font.alt5};
				fill: ${(props) => props.theme.colors.font.alt5};
			}
		}
	}
`;

export const WrapperEmpty = styled.div`
	padding: 0 0 5px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;
