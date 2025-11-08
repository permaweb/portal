import styled from 'styled-components';

import { open, transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ top: number; noHeader: boolean }>`
	min-height: 100vh;
	height: 100%;
	width: 100%;
	position: fixed;
	z-index: 15;
	top: 0;
	left: 0;
	background: ${(props) => props.theme.colors.overlay.primary};
	animation: ${open} ${transition2};
`;

export const Container = styled.div<{
	noHeader: boolean;
	width?: number;
}>`
	width: ${(props) => (props.width ? `${props.width}px` : '650px')};
	max-width: ${(props) => (props.noHeader ? '100%' : '90vw')};
	background: ${(props) => (props.noHeader ? 'transparent' : props.theme.colors.container.primary.background)};
	border: 1.25px solid ${(props) => props.theme.colors.border.alt4};
	border-radius: ${STYLING.dimensions.radius.alt1};
	margin: 20px auto;
`;

export const Header = styled.div`
	height: 65px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
`;

export const LT = styled.div`
	max-width: 75%;
	display: flex;
	align-items: center;
	gap: 12.5px;
`;

export const Indicator = styled.div<{ status: 'success' | 'warning' }>`
	height: 20px;
	width: 20px;
	border-radius: 50%;
	margin: 5px 0 0 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => {
		if (props.status === 'success') return props.theme.colors.indicator.active;
		if (props.status === 'warning') return props.theme.colors.warning.primary;
	}};

	svg {
		height: 13.5px;
		width: 13.5px;
		margin: 6.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.light1};
		fill: ${(props) => props.theme.colors.font.light1};
	}
`;

export const Title = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.lg};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	line-height: calc(${(props) => props.theme.typography.size.lg} + 5px);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: 2.5px 0 0 0;
`;

export const Close = styled.div`
	padding: 2.5px 0 0 0;
`;

export const Body = styled.div`
	max-height: calc(100dvh - 110px);
	width: 100%;
	scrollbar-color: transparent transparent;
`;
