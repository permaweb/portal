import styled from 'styled-components';
import { BREAKPOINTS } from 'engine/constants/breakpoints';

export const Navigation = styled.div<{ $layout: any }>`
  position:relative;
  position:sticky;
  display: flex;
  align-items: center;
  top:0px;  
  height:40px;
  width:100%;
  max-width:${(props) => props.$layout.width === 'content' ? `1200px` : `100%`};
  background: var(--color-navigation-background);  
  margin-left:auto;
  margin-right:auto;
  padding: ${(props) => props.$layout.width === `content` ? `0 10px` : 0 };
  z-index:2;
  border-bottom: ${(props) => props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  border-top: ${(props) => props.$layout.border.top ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  border-left: ${(props) => props.$layout.border.sides ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  border-right: ${(props) => props.$layout.border.sides ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  box-shadow: var(--shadow-navigation);
  user-select:none;  
  box-sizing:border-box;

  @media (max-width: ${BREAKPOINTS["breakpoint-small"]}) {
    padding: 0 var(--spacing-xxs);
  }

  ${(props) => props.$layout.width === `content` && `
    &::before,
    &::after {
      content: '';
      position: absolute;
      border-style: solid;
      border-width: 10px;
      border-color: transparent;
      filter: brightness(0.6);
    }

    &::before {
      top: 100%;
      left: 0;
      border-top-color: var(--color-navigation-background);
      border-left-color: transparent; 
      border-width: 10px 0 0 10px; 
    }

    &::after {
      top: 100%;
      right: 0;
      border-top-color: var(--color-navigation-background);
      border-right-color: transparent; 
      border-width: 10px 10px 0 0; 
    }
  `};
`;

export const NavigationEntries = styled.div<{ $layout: any }>`
  display: flex;
  align-items: center;
  height:40px;
  width:100%;
  width:100%;
  max-width: 1200px;
  margin-left:${(props) => props.$layout.width === 'page' ? `auto` : `10px` };
  margin-right:auto;
  gap:20px;

  > div > a {
    height:${(props) => props.$layout.height};
  }

  button {
    margin-left:auto;
  }

  a.active{
    pointer-events: none;
    color: rgba(var(--color-secondary),1);

    div {
      color: rgba(var(--color-secondary),1);
    }
    svg {
      color: rgba(var(--color-secondary),1) !important;
    }
  }
`;

export const NavigationEntry = styled.div`  
  position:relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height:fit-content;
  min-height:100%;
  border-radius:8px;    
  white-space: nowrap;  

  a{
    color: rgba(var(--color-navigation-text),1);
    position:relative;
    display: flex;
    align-items: center;
    width:100%;

    font-size:var(--font-size-default);
    font-weight:600;
    font-family: Franklin, arial, sans-serif;

    svg{
      width:20px;
      height:20px;
      color:white;
    }
  }  

  &:hover{
    cursor:pointer;
    a {      
      color: rgba(var(--color-navigation-text-hover),1);

      svg{
        fill: rgba(var(--color-navigation-text-hover),1);
      }
    }    
  }
`;

export const Icon = styled.div`
  display:flex;
  align-items: center;

  div{
    display:flex;
    align-items: center;
  }

  svg {
    height:12px;
  }
  margin-right:6px;
`;

export const LayoutButtons = styled.div`
  position:absolute;
  right:0;
`;

export const Edit = styled.div`
  position:absolute;
  bottom:-520px;
  width:100%;
  height:500px;
`;

export const NavigationEntryMenu = styled.div<{ $layout: any }>`
  position:absolute;
  top:40px;
  left:0;
  width:fit-content;
  min-width:150px;
  background:var(--color-navigation-background);  
  // box-shadow: var(--shadow-navigation-entry);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.5s ease;
  animation: 0.1s ease forwards expandOnLoad;
  border-top: ${(props) => props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-background),1)`: `unset` };
  border-bottom: ${(props) => props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  border-left: ${(props) => props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  border-right: ${(props) => props.$layout.border.bottom ? `1px solid rgba(var(--color-navigation-border),1)`: `unset` };
  box-sizing:border-box;

  @keyframes expandOnLoad {
    to {
      transform: scaleY(1);
    }
  }
`;

export const NavigationSubEntry = styled.div`
  color:white;
  padding: 5px 0;
  white-space: nowrap;
  padding:10px 20px;
  font-size:12px;
  font-weight:600;
  font-family: Franklin, arial, sans-serif;
  width:100%;

  &:hover{
    cursor:pointer;
    color: rgba(var(--color-navigation-text-hover),1);
    background: rgba(var(--color-navigation-text),.1)
  }

`;