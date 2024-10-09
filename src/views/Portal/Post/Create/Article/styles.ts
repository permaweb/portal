import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const ToolbarWrapper = styled.div`
	/* border: 1px solid blue; */
	display: flex;
	gap: 20px;
	margin: 0 0 20px 0;
`;

export const EditorWrapper = styled.div<{ blockEditMode: boolean }>`
	display: flex;
	flex-direction: column;
	gap: ${(props) => (props.blockEditMode ? '40px' : '0')};

	[contenteditable] {
		&:focus {
			outline: 0;
			outline: none;
		}
	}
`;

export const OutputWrapper = styled.div`
	margin: 0 0 20px 0;
`;

export const PreviewWrapper = styled.div`
	border: 1px solid purple;
	margin: 0 0 20px 0;
`;

export const ElementWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;
`;

export const Element = styled.div<{ blockEditMode: boolean }>`
	padding: ${(props) => (props.blockEditMode ? '10px' : '0')};
	background: ${(props) => (props.blockEditMode ? props.theme.colors.container.alt1.background : 'transparent')};
	border: 1px solid ${(props) => (props.blockEditMode ? props.theme.colors.border.alt2 : 'transparent')};
	border-radius: ${(props) => (props.blockEditMode ? STYLING.dimensions.radius.primary : '0')};
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
