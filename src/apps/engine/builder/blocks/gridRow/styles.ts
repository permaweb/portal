import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const GridRow = styled.div<{ $layout?: any }>`
	position: relative;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	background: ${(props) => (props?.$layout?.width === 'page' ? `rgba(${props.$layout.background}, 1)` : 'unset')};
	background-image: ${(props) =>
		props.$layout?.wallpaper ? `url('img/wallpapers/wp${props.$layout.wallpaper}.jpg')` : `unset`};
	background-attachment: fixed;
	background-size: cover;
	z-index: 1;
	margin: ${(props) => (props.$layout?.margin ? props.$layout?.margin : '0 0 20px 0')};

	${(props) =>
		props.$layout?.gradient &&
		`
    &:before{
        z-index: 0;
        content: "";
        position: absolute;
        background: linear-gradient(90deg, rgba(var(--color-background),.8) 0%, rgba(var(--color-background),.98) 20%, rgba(var(--color-background),.98) 80%, rgba(var(--color-background),.8) 100%);
        width: 100%;
        height: 100%;
        display: ${(props: any) => (props.$layout.wallpaper !== 'none' ? `block` : `none`)};
      }
  `};
`;

export const GridRowWrapper = styled.div<{ $layout?: any; maxWidth?: number }>`
	display: flex;
	width: 100%;
	background: ${(props) => (props?.$layout?.width === 'content' ? `rgba(${props.$layout.background}, 1)` : 'unset')};
	padding: ${(props) => (props?.$layout?.padding ? props?.$layout?.padding : 'unset')};
	max-width: ${(props) => (props?.width === 'page' ? `${props.maxWidth}px` : '1200px')};
	margin-left: auto;
	margin-right: auto;
	gap: 20px;
	box-sizing: border-box;
	z-index: 1;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		flex-direction: column;
	}
`;

export const Separation = styled.div`
	background: rgba(var(--color-border), 1);
	width: 1px;
	opacity: 0.3;
`;
