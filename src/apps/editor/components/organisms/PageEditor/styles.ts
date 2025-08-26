import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`	
	display: flex;
	flex-direction: column;
	width: 100%;
`;

export const Editor = styled.div`	
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	max-height: 40vh;
	margin-left: auto;
	margin-right: auto;
	flex: 1;
	overflow: hidden;
	padding: 15px 15px 0 15px;
`;

export const Code = styled.div`
	position: relative;
	display: flex;
	gap: 10px;
	flex: 1;
	overflow-y: auto;

	textarea, pre {
		flex: 1;
		border: 1px solid #3D3D3D;
		min-height: 100%;
		overflow-y: scroll;
		background: #222;

		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		line-height: 18px;
	}
`;

export const Pre = styled.pre`
	background: #222;
	padding: 10px;
	margin:0;
	box-sizing: border-box;
	white-space: pre-wrap;
`;

export const Preview = styled.div`
	margin-top: 20px;
	padding: 15px 15px 0 15px;
`;