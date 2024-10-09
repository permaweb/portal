import styled from 'styled-components';

export const Wrapper = styled.div``;

export const ToolbarWrapper = styled.div`
	border: 1px solid blue;
	display: flex;
	gap: 20px;
	margin: 0 0 20px 0;
`;

export const EditorWrapper = styled.div`
	border: 1px solid green;
	margin: 0 0 20px 0;

	> * {
		&:focus {
			outline: 0;
			outline: none;
		}
	}

	[contenteditable] {
		&:focus {
			outline: 0;
			outline: none;
		}
	}
`;

export const Editor = styled.div`
	border: 1px solid pink;
`;

export const OutputWrapper = styled.div`
	border: 1px solid red;
	margin: 0 0 20px 0;
`;

export const PreviewWrapper = styled.div`
	border: 1px solid purple;
	margin: 0 0 20px 0;
`;
