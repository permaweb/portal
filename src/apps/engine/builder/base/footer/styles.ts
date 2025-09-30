import styled from 'styled-components';

export const FooterWrapper = styled.div<{ $layout: any; $theme: any }>`
	display: ${(props) => (props.$layout?.fixed ? `fixed` : `flex`)};
	width: 100%;
	max-width: ${(props) => (props.$layout?.width === 'content' ? `1200px` : `100%`)};
	// height: ${(props) => props.$layout?.height};
	height: fit-content;
	background: rgba(var(--color-footer-background), 1);
	margin-left: auto;
	margin-right: auto;
	color: rgba(var(--color-text), 1);
	padding: ${(props) => props.$layout?.padding};
	border-top: ${(props) => (props.$layout?.border?.top ? `1px solid rgba(var(--color-border),1)` : `unset`)};
	font-weight: 600;
	box-sizing: border-box;
	overflow: hidden;
	z-index: 1;
`;

export const Footer = styled.div<{ $layout: any }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	max-width: ${(props) => (props.$layout?.width === 'page' ? `1200px` : `100%`)};
	margin-left: auto;
	margin-right: auto;

	div:first-child {
		display: flex;
		justify-content: center;
	}
`;

export const Links = styled.div`
	display: flex;
	gap: 20px;
	margin-top: 20px;
	margin-bottom: 10px;
	flex-wrap: wrap;
	justify-content: center;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 4.5px 0 0 0;

	span {
		font-size: 10px !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const LinkWrapper = styled.div`
	position: relative;

	height: 35px;
	width: 35px;

	&:hover {
		${LinkTooltip} {
			display: block;
		}
	}

	a,
	button {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 100ms;

		border-radius: 50%;

		svg {
			height: 20px;
			width: 20px;
			margin: 6.5px 0 0 0;
			color: rgba(var(--color-text), 1);
			fill: rgba(var(--color-text), 1);
		}

		img {
			height: 22.5px;
			width: 22.5px;
		}
	}
`;

export const Copyright = styled.div`
	padding: 10px 40px 0 40px;
	margin-top: 10px;
	margin-bottom: 20px;
	border-top: 1px solid rgba(var(--color-border), 3);
`;
