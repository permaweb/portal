import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Ramaraja';
    src: url('/fonts/Ramaraja-Regular.ttf') format('truetype');
  }

  :root {
    // font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-family: var(--font-body);
    font-weight: var(--font-body-weight);
    line-height: 1.5;    

    color-scheme: light dark;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    --spacing-xxxs: calc(2rem / 6);
    --spacing-xxs: calc(2rem / 5);
    --spacing-xs: calc(2rem / 4);
    --spacing-s: calc(2rem / 3);
    --spacing-m: 1rem;
    --spacing-l: 2rem;
    --spacing-xl: 3rem;
    --spacing-xxl: 4rem;
    --spacing-vertical: 2rem;
    --spacing-width: 36px;

    --font-size-xxxlarge: calc(1em * 3.4);
    --font-size-xxlarge: calc(1em * 2);
    --font-size-xlarge: calc(1em * 1.5);
    --font-size-large: calc(1em * 1.2);
    --font-size-default: calc(1em * 1);
    --font-size-small: calc(1em * .7);
    --font-size-xsmall: calc(1em * .6);

    --color-button: rgba(0,0,0,.6);
  }

  html {
    height: 100%;
  }

  body {
    margin: 0;
    display: flex;
    place-items: center;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
		background: rgba(var(--color-background), 1);
  }

  #portal {
    font-size: 13px;
    height: 100%;
    width: 100%;
  }

  #preview {
    font-size: 13px;
  }

  a {
    text-decoration: none;
  }

  h1 {
    font-family: var(--font-header);
    font-weight: var(--font-header-weight-bold);
    font-size: var(--font-size-xxxlarge);
    color: rgba(var(--color-primary), 1);
    line-height: 1.1;
  }

  h2 {
    font-family: var(--font-header);
    font-weight: var(--font-header-weight-bold);
    margin: 0 0 4px 0;
    font-size: var(--font-size-xlarge);
    color: rgba(var(--color-primary), 1);
  }

  h3 {
    font-family: var(--font-header);
    font-weight: var(--font-header-weight-bold);
    margin: 0;
    font-size: var(--font-size-large);
  }

  p, span {
    font-size: var(--font-size-default);
  }

  button {
    border-radius: var(--border-radius);
    border: unset;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: var(--color-button);
    cursor: pointer;
  }

  button:hover {
    border-color: rgba(var(--color-primary), 1);
  }

  button:focus,
  button:focus-visible {
    outline: none;
  }

  input,
  textarea {
    padding: 8px 10px;
    outline: none;
    border: 1px solid rgba(var(--color-border), 0.5);
    background: rgba(var(--color-text), 0.05);
    color: rgba(var(--color-text), 1);
    font-family: inherit;
    font-size: inherit;

    &:focus {
      border: 1px solid rgba(var(--color-primary), 1);
    }
  }

  .loadingThumbnail {
    background: currentColor;
    width:100%;
		aspect-ratio: 16/9;
    animation: pulse 4s infinite;
    border: 0;
    outline: 0;
  }

  .loadingAvatar{
    background: currentColor;
    animation: pulse 4s infinite;
    border: 0;
    outline: 0;
  }

  .loadingPlaceholder{
    width:100px;
    animation: pulse 4s infinite;
  }

  .disabledLink{
    user-select: none;
    pointer-events: none;    
  }

  @media (prefers-color-scheme: light) {
    :root {
      color: #213547;
      background-color: #ffffff;
    }

    button {
      background-color: #f9f9f9;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: .1; }
    100% { opacity: .4; }
  }
`;

export const PageWrapper = styled.div`
	display: flex;
	min-height: 100%;
`;

export const Page = styled.div<{ $layout: any; wallpaper: any }>`
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	min-height: 100%;
	background-color: rgba(var(--color-background), 1);
	background-attachment: fixed;
	background-size: cover;
	background-image: ${(props) => (props?.wallpaper ? `url('${props.wallpaper}')` : 'unset')};
	color: rgba(var(--color-text), 1);

	${(props: any) =>
		props.$layout?.gradient &&
		`
    &:before{
        z-index: 0;
        content: "";
        position: absolute;
        background: linear-gradient(90deg, rgba(var(--color-background),.8) 0%, rgba(var(--color-background),.98) 20%, rgba(var(--color-background),.98) 80%, rgba(var(--color-background),.8) 100%);
        width: 100%;
        height: 100%;
        display: ${(props: any) => (props.wallpaper ? `block` : `none`)};
      }
  `};
`;

export const Settings = styled.div<{ $show: boolean }>`
	position: sticky;
	top: 0;
	width: fit-content;
	max-height: 100vh;
	z-index: 99;
	transition: width 0.4s;
	width: ${(props) => (props.$show ? `600px` : 0)};
`;

export const Top = styled.div<{ $order: string }>`
	display: flex;
	flex-direction: ${(props) => (props.$order === 'bottom' ? `column` : `column-reverse`)};
`;

export const FooterWrapper = styled.div<{ $layout: any }>`
	display: ${(props) => (props.$layout?.Fixed ? `fixed` : `flex`)};
	display: flex;
	bottom: 0;
	width: 100%;
	z-index: 0;
`;

export const SideNavLayout = styled.div<{ $navPosition: 'left' | 'right'; $maxWidth?: number }>`
	display: flex;
	flex-direction: ${(props) => (props.$navPosition === 'right' ? 'row-reverse' : 'row')};
	width: 100%;
	min-height: 100vh;
`;

export const SideNavWrapper = styled.div<{ $navPosition: 'left' | 'right'; $maxWidth?: number; $navWidth?: number }>`
	display: flex;
	justify-content: ${(props) => (props.$navPosition === 'right' ? 'flex-start' : 'flex-end')};
	width: ${(props) => {
		const navWidth = props.$navWidth || 300;
		const maxWidth = props.$maxWidth || 1200;
		return `calc((100vw - ${maxWidth}px) / 2 + ${navWidth}px)`;
	}};
	min-width: ${(props) => `${props.$navWidth || 300}px`};
	background: var(--color-navigation-background);
	box-sizing: border-box;
	z-index: 10;
	overflow: hidden;
`;

export const ContentWrapper = styled.div<{ $navPosition: 'left' | 'right' }>`
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	overflow-x: hidden;
`;

export const SettingsButton = styled.div`
	position: absolute;
	right: -40px;
	top: 6px;
	z-index: 9;

	svg {
		width: 20px;
		fill: rgba(var(--color-text), 1);
		border: 2px solid rgba(var(--color-text), 1);
		border-radius: 8px;
		padding: 2px;
	}

	&:hover {
		cursor: pointer;
		svg {
			background: rgba(var(--color-text), 1);
			fill: rgba(var(--color-text-contrast), 1);
		}
	}
`;
