import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const ToolbarWrapper = styled.div`
	display: flex;
	gap: 20px;
`;

export const EditorWrapper = styled.div<{ blockEditMode: boolean }>`
	display: flex;
	flex-direction: column;
	gap: ${(props) => (props.blockEditMode ? '40px' : '20px')};
	margin: 0 0 40px 0;

	[contenteditable] {
		&:focus {
			outline: 0;
			outline: none;
		}
	}
`;

export const ElementDragWrapper = styled.div`
	display: flex;
	gap: 10px;
	position: relative;
`;

export const ElementWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 5px;
	position: relative;
`;

export const Element = styled.div<{ blockEditMode: boolean }>`
	padding: ${(props) => (props.blockEditMode ? '10px' : '0')};
	background: ${(props) => (props.blockEditMode ? props.theme.colors.container.alt1.background : 'transparent')};
	border: 1px solid ${(props) => (props.blockEditMode ? props.theme.colors.border.alt2 : 'transparent')};
	border-radius: ${(props) => (props.blockEditMode ? STYLING.dimensions.radius.primary : '0')};

	/* All individual element styling */
	h1 {
		font-size: clamp(28px, 2.5vw, 40px);
		line-height: 1.2;
		font-weight: 600;
	}
	h2 {
		font-size: clamp(24px, 2.15vw, 36px);
		line-height: 1.25;
	}
	h3 {
		font-size: clamp(22px, 1.9vw, 30px);
		line-height: 1.3;
	}
	h4 {
		font-size: clamp(20px, 1.7vw, 26px);
		line-height: 1.35;
	}
	h5 {
		font-size: clamp(18px, 1.5vw, 22px);
		line-height: 1.4;
	}
	h6 {
		font-size: clamp(16px, 1.25vw, 18px);
		line-height: 1.45;
	}
`;

export const ElementToolbar = styled.div`
	display: flex;
	align-items: center;
`;

export const EToolbarHeader = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100%;
		overflow: hidden;
	}
`;

export const EToolbarDelete = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	button {
		color: ${(props) => props.theme.colors.warning.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100%;
		overflow: hidden;

		&:hover {
			color: ${(props) => props.theme.colors.warning.alt1} !important;
		}
	}
`;

export const EDragWrapper = styled.div``;

export const EDragHandler = styled.div`
	svg {
		width: 17.5px;
		margin: 5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;
