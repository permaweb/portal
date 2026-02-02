import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	height: 100%;
	width: 100%;
`;

export const TabsHeader = styled.div<{ useFixed: boolean }>`
	width: 100%;
	@media (max-width: ${STYLING.cutoffs.secondary}) {
		position: relative;
		top: auto;
	}
`;

export const Tabs = styled.div`
	display: flex;
	align-items: center;
	gap: 40px;
	padding: 0 0 10px 0;
	overflow-x: visible;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const Content = styled.div``;

export const Tab = styled.div<{ active: boolean }>`
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	button {
		position: relative;
		color: ${(props) => (props.active ? props.theme.colors.tabs.active.color : props.theme.colors.tabs.color)};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		&:hover {
			cursor: pointer;
			color: ${(props) => (props.active ? props.theme.colors.tabs.active.color : props.theme.colors.font.alt1)};
		}
		&:before {
			content: '';
			position: absolute;
			bottom: -11px;
			height: 4.5px;
			width: 100%;
			background: ${(props) =>
				props.active ? props.theme.colors.tabs.active.background : props.theme.colors.border.alt4};
			border-radius: 1.5px;
			opacity: ${(props) => (props.active ? 1 : 0)};
			pointer-events: none;
			transition: all 200ms;
		}
		&:hover:before {
			opacity: 1;
		}
	}
`;

export const View = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	margin: 20px 0 0 0;
`;
