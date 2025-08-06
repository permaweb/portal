import styled from 'styled-components';


export const Footer = styled.div<{ $layout: any, $theme: any }>`
  display: ${(props) => props.$layout?.fixed ? `fixed` : `flex` };
  justify-content: center;
  align-items: center;
  background: rgba(var(--color-footer-background),1);
  height:${(props) => props.$layout?.height};
  width:100%;
  margin-left:auto;
  margin-right:auto;
  color:rgba(var(--color-text),1);
  // height:fit-content;  
  padding:${(props) => props.$layout?.padding};
  font-weight: 600;
  box-sizing:border-box;
`;


export const FooterWrapper = styled.div<{ $layout: any }>`
  max-width:${(props) => props.$layout?.width === 'content' ? `1200px` : `100%`};
`;
