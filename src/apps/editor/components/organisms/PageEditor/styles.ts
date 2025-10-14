import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const PAGE_TOOLBAR_WIDTH = '350px';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
	position: relative;
`;

export const ToolbarWrapper = styled.div`
	position: sticky;
	top: ${STYLING.dimensions.nav.height};
	z-index: 1;
	background: ${(props) => props.theme.colors.view.background};
	padding: 10px 0;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		position: relative;
		top: auto;
	}
`;

export const EditorWrapper = styled.div`
	width: 100%;
`;
