import styled from 'styled-components';

export const ContentWrapper = styled.div<{ $isSideNav?: boolean }>`
	display: flex;
	justify-content: ${(props) => (props.$isSideNav ? 'flex-start' : 'center')};
	width: 100%;
	height: calc(100% - 40px);
	margin-bottom: 120px;
	box-sizing: border-box;
	gap: 20px;
	z-index: 1;
`;

export const Content = styled.div<{ $layout: any; maxWidth: number; $isSideNav?: boolean; $navWidth?: number }>`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: ${(props) => {
		if (props.$isSideNav) {
			const navWidth = props.$navWidth || 300;
			return `${props.maxWidth - navWidth}px`;
		}
		return undefined;
	}};
	padding: ${(props) => (props.$layout?.padding ? `${props.$layout?.padding}` : 0)};
	margin-left: ${(props) => (props.$isSideNav ? '0' : 'auto')};
	margin-right: auto;
	box-sizing: border-box;
`;
