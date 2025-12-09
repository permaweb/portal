import styled from 'styled-components';

export const FooterWrapper = styled.div<{ $layout: any; $theme: any; $editFixed?: boolean; $isSideNav?: boolean }>`
	position: relative;
	width: 100%;
	max-width: ${(props) => (props.$layout?.width === 'content' ? `1200px` : `100%`)};
	background: rgba(var(--color-footer-background), 1);
	color: rgba(var(--color-text), 1);
	padding: ${(props) => props.$layout?.padding};
	border-top: ${(props) => (props.$layout?.border?.top ? `1px solid rgba(var(--color-border),1)` : `unset`)};
	font-weight: 600;
	box-sizing: border-box;
	z-index: 1;

	${(props) => {
		const layoutFixed = props.$layout?.fixed === true || props.$layout?.fixed === 'true';
		const isFixed = props.$editFixed !== undefined ? props.$editFixed : layoutFixed;
		if (isFixed) {
			return `
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				margin: 0;
			`;
		}
		return `
			display: flex;
			margin-left: auto;
			margin-right: auto;
		`;
	}}
`;

export const Footer = styled.div<{ $layout: any; $isSideNav?: boolean; $navWidth?: number; $maxWidth?: number }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	max-width: ${(props) => {
		if (props.$layout?.width === 'page') {
			if (props.$isSideNav) {
				const navWidth = props.$navWidth || 300;
				const maxWidth = props.$maxWidth || 1200;
				return `${maxWidth - navWidth}px`;
			}
			return `${props.$maxWidth || 1200}px`;
		}
		return '100%';
	}};
	margin-left: ${(props) => (props.$isSideNav ? '0' : 'auto')};
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

export const Copyright = styled.div<{ $hasContentAbove?: boolean }>`
	padding: 10px 40px 0 40px;
	margin-top: ${(props) => (props.$hasContentAbove ? '10px' : '0')};
	margin-bottom: 20px;
	border-top: ${(props) => (props.$hasContentAbove ? '1px solid rgba(var(--color-border), 3)' : 'none')};
`;
