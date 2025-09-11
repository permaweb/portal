import styled from 'styled-components';

export const ContentWrapper = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	height: calc(100% - 40px);
	margin-bottom: 120px;
	box-sizing: border-box;
	gap: 20px;
	z-index: 1;
`;

export const Content = styled.div<{ $layout: any; maxWidth: number }>`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	// max-width: ${(props) => (props.maxWidth ? `${props.maxWidth}px` : undefined)};
	padding: ${(props) => (props.$layout?.padding ? `${props.$layout?.padding}` : 0)};

	box-sizing: border-box;
`;
