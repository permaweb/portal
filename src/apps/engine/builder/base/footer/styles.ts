import styled from 'styled-components';

export const FooterWrapper = styled.div<{ $layout: any; $theme: any; $editHeight?: number; $editFixed?: boolean }>`
	position: relative;
	width: 100%;
	max-width: ${(props) => (props.$layout?.width === 'content' ? `1200px` : `100%`)};
	height: ${(props) => (props.$editHeight !== undefined ? `${props.$editHeight}px` : `fit-content`)};
	min-height: ${(props) => (props.$editHeight !== undefined ? `${props.$editHeight}px` : `auto`)};
	background: rgba(var(--color-footer-background), 1);
	color: rgba(var(--color-text), 1);
	padding: ${(props) => props.$layout?.padding};
	border-top: ${(props) => (props.$layout?.border?.top ? `1px solid rgba(var(--color-border),1)` : `unset`)};
	font-weight: 600;
	box-sizing: border-box;
	overflow: hidden;
	z-index: 1;

	${(props) => {
		const isFixed = props.$editFixed !== undefined ? props.$editFixed : props.$layout?.fixed;
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

export const ResizeHandle = styled.div<{ $isDragging?: boolean }>`
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: ns-resize;
	z-index: 10;
	transform: translateY(-50%);

	&:hover > div {
		background: rgba(var(--color-primary), 1);
		opacity: 1;
	}

	${(props) =>
		props.$isDragging &&
		`
		> div {
			background: rgba(var(--color-primary), 1);
			opacity: 1;
			height: 6px;
		}
	`}
`;

export const HandleBar = styled.div`
	width: 100%;
	height: 4px;
	background: rgba(var(--color-primary), 0.6);
	opacity: 0.8;
	transition: all 0.15s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
`;

export const HandleLabel = styled.span`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgba(var(--color-primary), 1);
	color: white;
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
	pointer-events: none;
`;
