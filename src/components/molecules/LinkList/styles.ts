import styled from 'styled-components';

import { ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	margin: -5px 0 0 0;
	padding: 0 0 5px 0;
`;

export const LinksAction = styled.div`
	position: relative;
	margin: 25px 0 0 0;

	button {
		margin: 20px 0 0 auto;
	}
`;

export const LinksActionHeader = styled.div`
	width: 100%;
	margin: 0 0 15px 0;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LinksBody = styled.div<{ type: ViewLayoutType }>`
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	padding: 15px 15px 10px 15px;
	margin: ${(props) => (props.type === 'header' ? '5px 0 0 0' : '20px 0 0 0')};
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
			height: 17.5px;
			width: 17.5px;
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
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
