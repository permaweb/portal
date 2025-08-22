import styled from 'styled-components';

export const FooterWrapper = styled.div<{ $layout: any, $theme: any }>`
  display: ${(props) => props.$layout?.fixed ? `fixed` : `flex` };    
  width:100%;
  max-width: ${(props) => props.$layout?.width === 'content' ? `1200px` : `100%`};
  height:${(props) => props.$layout?.height};
  background: rgba(var(--color-footer-background),1);
  margin-left:auto;
  margin-right:auto;
  color:rgba(var(--color-text),1);
  padding:${(props) => props.$layout?.padding};
  border-top:${(props) => props.$layout?.border?.top ? `1px solid rgba(var(--color-border),1)` : `unset`};
  font-weight: 600;
  box-sizing:border-box;
  z-index:1;
`;

export const Footer = styled.div<{ $layout: any }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width:100%;
  max-width: ${(props) => props.$layout?.width === 'page' ? `1200px` : `100%`};
  margin-left:auto;
  margin-right:auto;  

  div:first-child {
    display:flex;
    justify-content: center;
  }
`;
