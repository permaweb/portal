import styled from 'styled-components';

export const Wrapper = styled.div<{ $mode: string }>`
	position: fixed;
	bottom: 0;
	bottom: ${(props) => props.$mode === 'hidden' ? '-100px' : 0};
	max-height: ${(props) => props.$mode === 'hidden' ? 0 : props.$mode === 'mini' ? '40vh' : 'calc(100vh - 41px)'};
	min-height: ${(props) => props.$mode === 'hidden' ? 0 : props.$mode === 'mini' ? '40vh' : 'calc(100vh - 41px)'};
	display: flex;
	flex-direction: column;
	width: 100%;
	z-index: 99;
	background: rgba(var(--color-background), .9);
	backdrop-filter: blur(5px);
	padding: 20px 0;	
	border-top: 1px solid rgba(var(--color-text), 1);
	transition: max-height .4s, min-height .4s;
`;

export const Actions = styled.div<{ $mode?: string }>`
	position:absolute;
	display:flex;
	right:10px;
	gap: 10px;

	div {
		display:flex;
		justify-content: center;
		align-items: center;
		width:20px;
		height:20px;
		background: rgba(var(--color-primary),1);
		color: var(--color-primary-contrast);
		padding:6px;
		cursor:pointer;
		transition: transform .4s;

		&:first-of-type{
			transform: ${(props) => props.$mode === 'mini' ? 'rotateX(0deg)' : 'rotateX(180deg)'};
		}
	}
`;

export const Editor = styled.div`	
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-width: 1200px;
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	flex: 1;
	overflow: hidden;

	select {
		width: 100%;
		height: 30px;
		box-sizing: border-box;
		border: unset;
	}
`;

export const Code = styled.div`
	position: relative;
	display: flex;
	gap: 10px;
	flex: 1;
	overflow-y: auto;

	textarea, pre {
		flex: 1;
		border: unset;
		min-height: 100%;
		overflow-y: scroll;
		background: #222;
	}
`;

export const Pre = styled.pre`
	background: #222;
	padding: 10px;
	margin:0;
	box-sizing: border-box;
	white-space: pre-wrap;
`;

export const EditorModes = styled.div`
	position: absolute;
	display:flex;
	top:10px;
	right:calc(50% + 34px);
	width:100px;	
`;

export const EditorMode = styled.div<{ $active: boolean }>`
	padding:4px 10px;
	background:${(props) => props.$active ? 'rgba(100,100,100,1)' : 'rgba(100,100,100,.6)'};
	cursor:pointer;
`;