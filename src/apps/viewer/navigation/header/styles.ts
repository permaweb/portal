import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.header`
	width: 100%;
	position: sticky;
	z-index: 4;
	top: 0;
	background: ${(props) => props.theme.colors.view.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const WrapperContent = styled.div<{ height?: number }>`
	height: ${(props) => props.height ? `${props.height.toString()}px` : STYLING.dimensions.nav.height};
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
`;

export const ContentStart = styled.div`
	
`;

export const LogoWrapper = styled.div`
	height: 100%;
	max-height: 50%;
	width: 250px;
	max-width: 50%;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

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
		height:100%;
		width: 100%;
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

export const ContentEnd = styled.div``;

export const NavigationWrapper = styled(WrapperContent)`
	height: ${STYLING.dimensions.nav.linksHeight};
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const NavigationContent = styled.ul`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 35px;
	padding: 0 20px;
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
	transition: opacity 200ms ease-in-out 0ms,
			visibility 0ms linear 200ms;

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