import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

import { ARTICLE_TOOLBAR_WIDTH } from '../styles';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: space-between;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const TitleWrapper = styled.div`
	width: calc(50% - 10px);
	overflow: hidden;
	input {
		width: 100%;
		display: block;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		padding: 0;
		outline: 0;
		border: none;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const EndActions = styled.div`
	width: calc(50% - 10px);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		flex-wrap: wrap;
	}
`;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
`;

export const Panel = styled.div<{ open: boolean }>`
	width: ${ARTICLE_TOOLBAR_WIDTH};
	position: absolute;
	right: 0;
	z-index: 1;
	transform: translateX(${(props) => (props.open ? '0' : 'calc(100% + 40px)')});
	transition: transform ${transition2};
	top: 75px;
	padding: 13.5px 10px 10px 10px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		height: calc(100vh - 20px);
		max-width: 100%;
		top: 10px;
		right: 10px;
		display: ${(props) => (props.open ? 'block' : 'none')};
		border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
	}

	@media (min-width: ${STYLING.cutoffs.maxEditor}) {
		display: ${(props) => (props.open ? 'block' : 'none')};
	}
`;

export const PanelCloseWrapperStart = styled.div`
	position: absolute;
	z-index: 1;
	top: 10px;
	right: 10px;
`;

export const PanelCloseWrapperEnd = styled.div`
	margin: 10px 0;
	padding: 0 10px;
`;

export const TabWrapper = styled.div<{ label: string; icon?: string }>``;

export const TabContent = styled.div`
	margin: 20px 0 0 0;
	max-height: calc(100vh - ${STYLING.dimensions.nav.height} - 155px);

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		max-height: calc(100vh - ${STYLING.dimensions.nav.height} - 10px);
	}
`;
