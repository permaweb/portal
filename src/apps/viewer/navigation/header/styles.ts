import styled from 'styled-components';

import { STYLING } from 'helpers/config';
import { BasicAlignmentType } from 'helpers/types';

export const Wrapper = styled.header`
	width: 100%;
	position: relative;
	z-index: 4;
	top: 0;
	background: ${(props) => props.theme.colors.view.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.alt7};
`;

export const WrapperContent = styled.div<{ height?: string }>`
	height: ${(props) => props.height ?? STYLING.dimensions.nav.height};
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const NavigationWrapper = styled(WrapperContent)`
	height: ${STYLING.dimensions.nav.linksHeight};
	width: 100%;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.alt7};
	background: ${(props) => props.theme.colors.container.alt1.background};
	position: sticky;
	z-index: 1;
	top: 0;
`;

export const ContentStart = styled.div``;

function getLogoAlignment(opts: { direction?: BasicAlignmentType }) {
	if (opts.direction) {
		switch (opts.direction) {
			case 'left':
				return `
				left: 20px;
				transform: translate(0, -50%);
			`;
			case 'center':
				return `
				left: 50%;
				transform: translate(-50%, -50%);
			`;
		}
	}

	return `
		left: 50%;
		transform: translate(-50%, -50%);
	`;
}

export const LogoWrapper = styled.div<{ direction?: BasicAlignmentType }>`
	height: 100%;
	max-height: 50%;
	max-width: 50%;
	position: absolute;
	top: 50%;
	${(props) => getLogoAlignment({ direction: props.direction })};

	a {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			img {
				opacity: 0.75;
			}
		}
	}

	img {
		height: 100%;
		width: 100%;
		max-width: 250px;
		object-fit: contain;
	}

	h4 {
		text-align: center;
		font-size: ${(props) => props.theme.typography.size.xxLg};
		color: ${(props) => props.theme.colors.font.primary};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}

	svg {
		height: 25px;
		width: 25px;
		&:hover {
			fill: ${(props) => props.theme.colors.icon.primary.active};
		}
	}
`;

export const IconWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;

	img {
		height: 25px;
		width: 25px;
		border-radius: ${STYLING.dimensions.radius.alt3};
	}
	svg {
		height: 20px;
		width: 20px;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}
`;

function getContentAlignment(opts: { linkDirection?: BasicAlignmentType }) {
	if (opts.linkDirection) {
		switch (opts.linkDirection) {
			case 'left':
				return `
					flex-direction: row-reverse;
					align-items: center;
				`;
			case 'right':
				return `
					flex-direction: row;
					align-items: center;
				`;
			case 'top':
				return `
					flex-direction: column-reverse;
					align-items: flex-end;
				`;
			case 'bottom':
				return `
					flex-direction: column;
					align-items: flex-end;
				`;
			default:
				return `
					flex-direction: row-reverse;
					align-items: center;
				`;
		}
	}
	return `
			flex-direction: row-reverse;
			align-items: center;
		`;
}

export const ContentEnd = styled.div<{ linkDirection?: BasicAlignmentType }>`
	height: 100%;
	position: absolute;
	z-index: 1;
	top: 50%;
	right: 20px;
	transform: translate(0, -50%);
	display: flex;
	gap: 25px;
	padding: 20px 0;
	${(props) => getContentAlignment({ linkDirection: props.linkDirection })};
`;

export const LinksWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 20px;
	padding: 7.5px 0 0 0;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 2.5px 0 0 0;

	border: 1px solid ${(props) => props.theme.colors.contrast.border};

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
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 100ms;

		svg {
			height: 20px;
			width: 20px;
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
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
	}
`;

function getNavContentAlignment(opts: { direction?: BasicAlignmentType }) {
	if (opts.direction) {
		switch (opts.direction) {
			case 'left':
				return `justify-content: flex-start;`;
			case 'center':
				return `justify-content: center;`;
		}
	}
	return `justify-content: center;`;
}

export const NavigationContent = styled.ul<{ direction?: BasicAlignmentType }>`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 35px;
	${(props) => getNavContentAlignment({ direction: props.direction })};
`;

export const NavigationLinks = styled.ul<{ direction?: BasicAlignmentType }>`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 35px;
	padding: 0 20px;
	${(props) => getNavContentAlignment({ direction: props.direction })};
`;

export const PortalUpdateWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4.5px 13.5px;
	background: ${(props) => props.theme.colors.contrast.background};
	border: 1px solid ${(props) => props.theme.colors.contrast.border};
	border-radius: ${STYLING.dimensions.radius.alt4};
	span {
		color: ${(props) => props.theme.colors.contrast.color};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const CategoryWrapper = styled.li`
	height: 100%;
	min-height: 35px;
	position: relative;

	display: flex;
	align-items: center;

	&:hover > ul {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transition-delay: 250ms;
	}
`;

export const CategoryLink = styled.div`
	a {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};

		display: flex;
		align-items: center;
		gap: 7.5px;

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};

			svg {
				color: ${(props) => props.theme.colors.font.alt1};
				fill: ${(props) => props.theme.colors.font.alt1};
			}
		}
	}

	svg {
		height: 13.5px;
		width: 13.5px;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
		margin: 4.5px 0 0 0;
	}
`;

export const SubMenu = styled.ul`
	display: flex;
	width: 300px;
	position: absolute;
	z-index: 1;
	top: 35px;
	left: 0;
	flex-direction: column;
	padding: 7.5px 15px 8.5px 15px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;

	opacity: 0;
	visibility: hidden;
	pointer-events: none;
	transition: opacity 200ms ease-in-out 0ms, visibility 0ms linear 200ms;

	& > li {
		white-space: nowrap;
	}

	a {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}
`;

export const OverflowWrapper = styled.div`
	position: relative;
`;

export const OverflowContent = styled.div`
	width: 300px;
	position: absolute;
	top: 30px;
	display: flex;
	flex-direction: column;
	padding: 7.5px 15px 8.5px 15px;
`;
