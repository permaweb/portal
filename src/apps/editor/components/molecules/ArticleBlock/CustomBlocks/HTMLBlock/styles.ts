import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PreviewWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PreviewElement = styled.div<{ isFullScreen: boolean }>`
	width: ${(props) => (props.isFullScreen ? '50%' : '100%')};
`;

export const PreviewPlaceholder = styled.div`
	height: 50px;
	display: flex;
	gap: 15px;
	align-items: center;
	justify-content: center;
	border-radius: ${STYLING.dimensions.radius.alt4} !important;
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-align: center;
	}
`;

export const ActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 15px;
	align-items: center;
	justify-content: flex-end;
`;

export const PanelWrapper = styled.div<{ isFullScreen: boolean }>`
	display: flex;
	flex-direction: ${(props) => (props.isFullScreen ? 'row' : 'column')};
	gap: 15px;
	width: ${(props) => (props.isFullScreen ? '100%' : 'auto')};
	height: ${(props) => (props.isFullScreen ? '100%' : 'auto')};
	background: ${(props) => (props.isFullScreen ? props.theme.colors.container.primary : 'transparent')};
	padding: ${(props) => (props.isFullScreen ? '15px' : '0')};
	background: ${(props) => props.theme.colors.view.background};
`;
