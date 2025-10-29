import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;
	max-width: ${STYLING.cutoffs.maxEditor};
	margin: 0 auto;
`;

export const ToolbarWrapper = styled.div<{ navWidth: number; hasBodyOverflow: boolean }>`
	width: calc(100vw - (${(props) => `${props.navWidth}px`} + 15px));
	position: fixed;
	top: ${STYLING.dimensions.nav.height};
	left: ${(props) => `${props.navWidth}px`};
	transition: left ${transition2};
	z-index: 1;
	background: ${(props) => props.theme.colors.view.background};
	border: 1px solid ${(props) => props.theme.colors.view.background};
	padding: 10px 20px 15px 30px;
	padding-right: ${(props) => (props.hasBodyOverflow ? '20px' : '5px')};

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
		position: relative;
		top: auto;
		left: auto;
		padding: 0;
	}
`;

export const ToolbarContent = styled.div<{ navWidth: number }>`
	max-width: ${STYLING.cutoffs.maxEditor} !important;
	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 0;
	}
`;

export const EditorWrapper = styled.div`
	width: 100%;
	margin: ${STYLING.dimensions.nav.height} 0 0 0;
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
		margin: ${(props) => (props.blockEditMode ? '0 0 40px 0' : '0 0 60px 0')};
	}
`;

export const BlocksEmpty = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt3};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;
