import styled from 'styled-components';

import { open, openRight, transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const PanelOverlay = styled.div<{ open: boolean }>`
	height: 100vh;
	width: 100%;
	position: fixed;
	z-index: 3;
	top: 0;
	left: 0;
	background: ${(props) => props.theme.colors.overlay.primary};
	animation: ${open} ${transition2};
	display: none;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		display: ${(props) => (props.open ? 'block' : 'none')};
	}
`;

export const Panel = styled.nav<{ open: boolean }>`
	height: 100vh;
	width: ${STYLING.dimensions.nav.width};
	position: fixed;
	top: 0;
	left: 0;
	z-index: 4;
	transform: translateX(${(props) => (props.open ? '0' : '-100%')});
	transition: transform ${transition2};
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-right: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const PanelHeader = styled.div`
	height: ${STYLING.dimensions.nav.height};
	width: 100%;
	display: flex;
	align-items: center;
	gap: 40px;
	padding: 0 15px;
`;

export const Logo = styled.div`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.alt1};
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-size: 20px;
	font-weight: ${(props) => props.theme.typography.weight.regular};
	font-weight: 500;
`;

export const PanelContent = styled.div<{ open: boolean }>`
	height: calc(100vh - (${STYLING.dimensions.nav.height} + 70px));
	padding: 0 15px 15px 15px;

	a {
		height: 40.5px;
		display: flex;
		align-items: center;
		cursor: pointer;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.primary};
		transition: all 100ms;
		padding: 0 10px;
		svg {
			height: 17.5px;
			width: 17.5px;
			margin: 6.5px 12.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.alt2.background};

			svg {
				color: ${(props) => props.theme.colors.font.primary};
				fill: ${(props) => props.theme.colors.font.primary};
			}
		}
	}
`;

export const PanelFooter = styled.div<{ open: boolean }>`
	height: 70px;
	width: 100%;
	padding: 15px;

	a {
		height: 40.5px;
		display: flex;
		align-items: center;
		cursor: pointer;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		border-radius: ${STYLING.dimensions.radius.primary};
		transition: all 100ms;
		padding: 0 10px;
		svg {
			height: 17.5px;
			width: 17.5px;
			margin: 6.5px 12.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.alt2.background};
			border: 1px solid ${(props) => props.theme.colors.border.alt2};

			svg {
				color: ${(props) => props.theme.colors.font.primary};
				fill: ${(props) => props.theme.colors.font.primary};
			}
		}
	}
`;

export const Header = styled.header<{ navigationOpen: boolean }>`
	height: ${STYLING.dimensions.nav.height};
	width: 100%;
	padding: 0 20px 0 ${(props) => (props.navigationOpen ? `calc(${STYLING.dimensions.nav.width} + 10px)` : '20px')};
	transition: padding-left ${transition2};
	position: fixed;
	top: 0;
	z-index: 2;
	background: ${(props) => props.theme.colors.view.background};

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 0 20px 0 10px;
	}
`;

export const Content = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const C1Wrapper = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	gap: 10px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		max-width: calc(100% - 60px);
	}
`;

export const LogoWrapper = styled.div`
	height: 29.5px;
	svg {
		height: 30px;
		width: 30px;
		fill: ${(props) => props.theme.colors.icon.alt2.fill};
		&:hover {
			fill: ${(props) => props.theme.colors.icon.alt2.active};
			opacity: 0.85;
		}
	}
`;

export const PortalWrapper = styled.div`
	position: relative;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		max-width: calc(100% - 45px);
	}
`;

export const Portal = styled.button<{ active: boolean }>`
	max-width: 100%;
	display: flex;
	align-items: center;
	cursor: pointer;
	background: ${(props) =>
		props.active ? props.theme.colors.container.primary.active : props.theme.colors.container.primary.background};
	border-radius: ${STYLING.dimensions.radius.alt2};
	padding: 7.5px 16.5px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.lg} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	svg {
		height: 16.5px;
		width: 16.5px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		margin: 4.75px 0px 0 12.5px;
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
	&:focus {
		background: ${(props) => props.theme.colors.container.primary.active};
	}

	&:disabled {
		background: ${(props) => props.theme.colors.container.primary.background};
	}
`;

export const PortalDropdown = styled.div`
	max-height: 65vh;
	width: 350px;
	max-width: 80vw;
	position: absolute;
	top: 47.5px;
	left: 0;
	padding: 11.5px 10px;
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

export const PDropdownBody = styled.div`
	margin: 7.5px 0 0 0;
`;

export const PDropdownLink = styled.div<{ active: boolean }>`
	a {
		height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: ${(props) => (props.active ? 'default' : 'pointer')};
		pointer-events: ${(props) => (props.active ? 'none' : 'auto')};
		background: ${(props) => props.theme.colors.container.primary.background};
		border-radius: ${STYLING.dimensions.radius.alt2};
		transition: all 100ms;
		padding: 0 10px;
		span {
			color: ${(props) => props.theme.colors.font.primary} !important;
			font-size: ${(props) => props.theme.typography.size.xSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.medium} !important;
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
		img {
			height: 22.5px;
			width: 22.5px;
			margin: 0 12.5px 0 0;
		}
		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
`;

export const PIndicator = styled.div`
	height: 17.5px;
	width: 17.5px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid ${(props) => props.theme.colors.indicator.active};
	background: ${(props) => props.theme.colors.indicator.active};
	border-radius: 50%;

	svg {
		height: 10.5px !important;
		width: 10.5px !important;
		color: ${(props) => props.theme.colors.font.light1} !important;
		fill: ${(props) => props.theme.colors.font.light1} !important;
		margin: 0 0 0.5px 0 !important;

		polyline {
			stroke-width: 40px !important;
		}
	}
`;

export const PDropdownFooter = styled.div`
	padding: 10px 0 0 0;
	margin: 10px 0 0 0;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};

	button {
		height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		cursor: pointer;
		text-overflow: ellipsis;
		overflow: hidden;
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		border-radius: ${STYLING.dimensions.radius.alt2};
		transition: all 100ms;
		padding: 0 10px;
		svg {
			height: 16.5px;
			width: 16.5px;
			margin: 5.5px 9.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
`;

export const DNavWrapper = styled.div`
	height: 35px;
	display: flex;
	align-items: center;
	margin: 0 0 0 15px;
	padding: 0 0 0 15px;
	> * {
		&:not(:last-child) {
			margin: 0 20px 0 0;
		}
		&:last-child {
			margin: 0;
		}
	}
	a {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
	@media (max-width: ${STYLING.cutoffs.secondary}) {
		display: none;
	}
`;

export const ActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

export const MWrapper = styled.div`
	display: none;
	@media (max-width: ${STYLING.cutoffs.secondary}) {
		display: block;
	}
`;

export const PWrapper = styled.div`
	height: calc(100dvh - 15px);
	width: 400px;
	max-width: 85vw;
	position: fixed;
	top: 10px;
	right: 10px;
	transition: width 50ms ease-out;
	animation: ${openRight} 200ms;
`;

export const PMenu = styled.div``;

export const PHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 15px;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	svg {
		fill: ${(props) => props.theme.colors.icon.primary.fill};
	}
	h4 {
		font-size: ${(props) => props.theme.typography.size.lg};
	}
`;

export const MNavWrapper = styled.div`
	display: flex;
	flex-direction: column;
	a {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		padding: 15px;
		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
	> * {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	}
`;

export const LoadingWrapper = styled.div`
	padding: 7.5px 16.5px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.lg} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;
