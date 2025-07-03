import { createGlobalStyle } from 'styled-components';

import { open, transition1, transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const GlobalStyle = createGlobalStyle`
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font: inherit;
    vertical-align: baseline;
  }

  article, aside, details, figcaption, figure,
  footer, header, hgroup, menu, nav, section {
    display: block;
  }

  body {
    overflow-x: hidden;
    background: ${(props) => props.theme.colors.view.background};
  }

  ol, ul {
    list-style: none;
  }

  blockquote, q {
    quotes: none;
  }

  blockquote:before, blockquote:after,
  q:before, q:after {
    content: none;
  }
  
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    color-scheme: ${(props) => props.theme.scheme};
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    font-family: ${(props) => props.theme.typography.family.primary};
    font-weight: ${(props) => props.theme.typography.weight.medium};
    color: ${(props) => props.theme.colors.font.primary};
    line-height: 1.5;
    letter-spacing: 0.15px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scrollbar-color: ${(props) => props.theme.colors.scrollbar.thumb} ${(props) => props.theme.colors.scrollbar.track};

    &::-webkit-scrollbar-track {
      background: ${(props) => props.theme.colors.scrollbar.track};
    }

    &::-webkit-scrollbar {
      width: 15px;
      border-left: 1px solid ${(props) => props.theme.colors.border.primary};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${(props) => props.theme.colors.scrollbar.thumb};
      border-radius: 36px;
      border: 3.5px solid transparent;
      background-clip: padding-box;
    }
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${(props) => props.theme.typography.family.alt1};
    font-weight: ${(props) => props.theme.typography.weight.bold};
    color: ${(props) => props.theme.colors.font.primary};
    overflow-wrap: anywhere;
    line-height: 1.25;
  }

  h1 {
    font-size: ${(props) => props.theme.typography.size.h1};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
  }

  h2 {
    font-size: ${(props) => props.theme.typography.size.h2};
  }

  h4 {
    font-size: ${(props) => props.theme.typography.size.h4};
  }
  
  a, button {
    transition: all 100ms;
  }

  button {
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      cursor: default;
    }
  }

  a {
    color: ${(props) => props.theme.colors.link.color};
    text-decoration: none;

    &:hover {
      color: ${(props) => props.theme.colors.link.active};
    }
  }
  
  input, textarea {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: transparent;
    margin: 0;
    padding: 10px;

    &:focus {
      outline: none;
    }

    &:disabled {
      cursor: default;
    }
  }

  textarea {
    resize: none;
  }

  label {
    cursor: text;
  }

  b, strong {
    font-weight: ${(props) => props.theme.typography.weight.bold};
  }
  
  .border-wrapper-primary {
    background: ${(props) => props.theme.colors.container.primary.background};
    border: 1px solid ${(props) => props.theme.colors.border.alt1};
    border-radius: ${STYLING.dimensions.radius.primary};
  }

  .border-wrapper-alt1 {
    background: ${(props) => props.theme.colors.container.primary.background};
    box-shadow: 0 0.5px 0.5px 0 ${(props) => props.theme.colors.shadow.primary};
    border: 1px solid ${(props) => props.theme.colors.border.alt1};
    border-radius: ${STYLING.dimensions.radius.alt1};
  }

  .border-wrapper-alt2 {
    background: ${(props) => props.theme.colors.container.primary.background};
    border: 1px solid ${(props) => props.theme.colors.border.primary};
    border-radius: ${STYLING.dimensions.radius.alt2};
    box-shadow: 0 1.5px 1.5px 0 ${(props) => props.theme.colors.shadow.primary};
  }

  .border-wrapper-alt3 {
    background: ${(props) => props.theme.colors.container.alt1.background};
    border: 1px solid ${(props) => props.theme.colors.border.primary};
    border-radius: ${STYLING.dimensions.radius.alt2};
  }

  .border-wrapper-alt4 {
    background: ${(props) => props.theme.colors.container.primary.background};
    box-shadow: 0 3.5px 7.5px 0 ${(props) => props.theme.colors.shadow.primary};
    border: 1px solid ${(props) => props.theme.colors.border.alt1};
    border-radius: ${STYLING.dimensions.radius.alt2};
  }

  .notification {
    height: 12.5px;
    width: 12.5px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background: ${(props) => props.theme.colors.indicator.alt1};
    border-radius: 50%;

    span {
      font-size: 8px;
      font-weight: ${(props) => props.theme.typography.weight.bold};
      color: ${(props) => props.theme.colors.font.light1};
    }
  }

  .max-view-wrapper {
    width: 100%;
    max-width: ${STYLING.cutoffs.max};
    margin: 0 auto;
  }

  .modal-wrapper {
    padding: 0 20px 20px !important;
  }

  .info {
    padding: 0 5px 0.5px;
    background: ${(props) => props.theme.colors.contrast.background};
    border-radius: ${STYLING.dimensions.radius.alt4};
    animation: ${open} ${transition2};

    span {
      color: ${(props) => props.theme.colors.contrast.color};
      font-size: ${(props) => props.theme.typography.size.xxxSmall};
      font-weight: ${(props) => props.theme.typography.weight.bold};
      white-space: nowrap;
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.colors.overlay.primary};
    z-index: 11;
  }

  .app-loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ${open} ${transition2};

    svg {
      width: 50px;
      height: auto;
      fill: ${(props) => props.theme.colors.font.primary};
    }
  }

  .fade-in {
    animation: ${open} ${transition1};
  }

  .scroll-wrapper {
    overflow: auto;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 12.5px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: transparent;
    }

    &:hover {
      scrollbar-color: ${(props) => props.theme.colors.scrollbar.thumb} transparent;

      &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.scrollbar.thumb};
      }
    }
  }

  .scroll-wrapper-hidden {
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
