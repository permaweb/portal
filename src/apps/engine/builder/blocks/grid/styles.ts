import styled from 'styled-components';

export const Grid = styled.div<{ $layout: any }>`
  width: 100%;
  display:flex;
  flex-grow: 0;
  flex-shrink:0;
	flex-direction: column;
  flex: ${(props) => props.$layout?.width ? props.$layout.$width : 1 };
  align-items: ${(props) => props.$layout?.verticalAlign ? props.$layout.verticalAlign : 'unset' };
`