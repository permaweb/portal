import styled from 'styled-components';

export const Placeholder = styled.div<{ $width: string }>`
  display: inline-block;	
  height:100%;
  width:${(props) => `${props.$width}px` };
  background-color: currentColor;
  font-size: inherit;
  animation: pulse 4s infinite;

  :host-context(h1) &, h1 > & {
    height: 28px;
  }

  :host-context(h2) &, h2 > span > & {
    height: 26px;
  }

  :host-context(span) &, span > & {
    margin-bottom:-2px;
    height: 14px;
  }

  :host-context(div) &, div > div > & {
    margin-top:1px;
    height: 16px;
    margin-bottom:1px;
  }

  :host-context(div) &, div > & {
    // margin-top:2px;
    height: 16px;
  }

`;
