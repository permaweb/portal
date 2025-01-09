import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	position: relative;
`;

export const ToolbarWrapper = styled.div`
	position: sticky;
	top: ${STYLING.dimensions.nav.height};
	z-index: 1;
	background: ${(props) => props.theme.colors.view.background};
	padding: 10px 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		position: relative;
		top: auto;
	}
`;

export const EditorWrapper = styled.div<{ panelOpen: boolean }>`
	padding: 0 ${(props) => (props.panelOpen ? `350px` : '0')} 0 0;
	transition: padding-right ${transition2};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 0;
	}
`;

export const Editor = styled.div<{ blockEditMode: boolean }>`
	display: flex;
	flex-direction: column;

	[contenteditable] {
		&:focus {
			outline: 0;
			outline: none;
		}
	}

	> * {
		margin: ${(props) => (props.blockEditMode ? '0 0 30px 0' : '0 0 20px 0')};
	}
`;

export const BlocksEmpty = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt3};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;
