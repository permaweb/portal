import styled from 'styled-components';

import { openRight,transition1 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Panel = styled.nav<{ open: boolean }>`
  height: 100vh;
  width: ${STYLING.dimensions.nav.width};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  transform: translateX(${(props) => (props.open ? '0' : '-100%')});
  transition: transform ${transition1};
  background: ${(props) => props.theme.colors.container.alt1.background};
`;

export const PanelHeader = styled.nav`
	height: ${STYLING.dimensions.nav.height};
	width: 100%;
	display: flex;
	align-items: center;
	padding: 0 15px;
`;

export const PanelContent = styled.div<{ open: boolean }>`
  height: calc(100vh - ${STYLING.dimensions.nav.height});
  padding: 15px;
  overflow-y: auto;

  a {
		height: 40.5px;
		display: flex;
		align-items: center;
		cursor: pointer;
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.alt2};
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
		}
  }
`;

export const Header = styled.header<{ navigationOpen: boolean }>`
  height: ${STYLING.dimensions.nav.height};
  width: ${(props) => (props.navigationOpen ? `calc(100% - ${STYLING.dimensions.nav.width})` : '100%')};
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  padding: 0 15px;
  background: ${(props) => props.theme.colors.view.background};
  transition: transform ${transition1}, width ${transition1};
`;

export const Content = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const C1Wrapper = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;
`;

export const LogoWrapper = styled.div`
	height: 22.5px;
	width: 22.5px;
	svg {
		height: 22.5px;
		width: 22.5px;
		fill: ${(props) => props.theme.colors.icon.alt2.fill};
		&:hover {
			fill: ${(props) => props.theme.colors.icon.alt2.active};
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
		font-weight: ${(props) => props.theme.typography.weight.xBold};
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
		font-size: ${(props) => props.theme.typography.size.xLg};
	}
`;

export const MNavWrapper = styled.div`
	display: flex;
	flex-direction: column;
	a {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
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
