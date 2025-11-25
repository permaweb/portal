import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

import { ARTICLE_TOOLBAR_WIDTH } from '../styles';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: space-between;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const TitleWrapper = styled.div`
	width: calc(35% - 10px);
	overflow: hidden;
	position: relative;
	input {
		width: 100%;
		display: block;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		padding: 0;
		outline: 0;
		border: none;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const UpdateWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
	padding: 5.5px 7.5px !important;

	.indicator {
		height: 10px;
		width: 10px;
		border-radius: 50%;
		background: ${(props) => props.theme.colors.indicator.neutral};
	}
`;

export const EndActions = styled.div`
	width: calc(50% - 10px);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		flex-wrap: wrap;
		justify-content: center;
	}
`;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
`;

export const Panel = styled.div<{ open: boolean }>`
	width: ${ARTICLE_TOOLBAR_WIDTH};
	position: absolute;
	right: 0;
	z-index: 1;
	transform: translateX(${(props) => (props.open ? '0' : 'calc(100% + 40px)')});
	transition: transform ${transition2};
	top: 75px;
	padding: 13.5px 10px 10px 10px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		height: calc(100vh - 20px);
		max-width: 100%;
		top: 10px;
		right: 10px;
		display: ${(props) => (props.open ? 'block' : 'none')};
		border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
	}

	@media (min-width: ${STYLING.cutoffs.maxEditor}) {
		display: ${(props) => (props.open ? 'block' : 'none')};
	}
`;

export const PanelCloseWrapperStart = styled.div`
	position: absolute;
	z-index: 1;
	top: 10px;
	right: 10px;
`;

export const PanelCloseWrapperEnd = styled.div`
	margin: 10px 0;
	padding: 0 10px;
`;

export const TabWrapper = styled.div<{ label: string; icon?: string }>``;

export const TabContent = styled.div`
	margin: 20px 0 0 0;
	max-height: calc(100vh - ${STYLING.dimensions.nav.height} - 155px);

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		max-height: calc(100vh - ${STYLING.dimensions.nav.height} - 10px);
	}
`;

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
`;

export const PreviewCard = styled.div`
	width: 100%;
	max-width: 920px;
	background: ${(p) => p.theme.colors.container?.primary};
	overflow: auto;
	position: relative;
	padding: 0 20px 20px 20px;

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-weight: 600;
		&:not(:first-of-type) {
			margin-top: 40px;
		}
	}

	h1 {
		padding-top: 10px;
		margin-bottom: 10px;
		width: fit-content;
		margin-bottom: 20px;

		&:first-of-type {
			margin-top: 0;
		}
	}
	h2 {
		margin-top: 30px;
		font-size: clamp(22px, 2vw, 32px);
	}
	h3 {
		font-size: clamp(20px, 1.8vw, 28px);
	}
	h4 {
		font-size: clamp(18px, 1.6vw, 24px);
	}
	h5 {
		font-size: clamp(16px, 1.4vw, 20px);
	}
	h6 {
		font-size: clamp(14px, 1.2vw, 18px);
		opacity: 0.4;
		margin-top: 0;
	}

	p {
		font-size: 18px;
		font-weight: 400;
		color: rgba(var(--color-text), 0.7);
		line-height: 1.6;
		margin-bottom: 30px;
	}

	a {
		color: var(--color-link-default, rgba(var(--color-text), 1));
		text-decoration: var(--preference-link-text-decoration-default, underline);
		font-weight: var(--preference-link-font-weight-default, normal);
		font-style: var(--preference-link-font-style-default, normal);
	}

	a:hover {
		color: var(--color-link-hover, rgba(var(--color-primary), 1));
		text-decoration: var(--preference-link-text-decoration-hover, underline);
		font-weight: var(--preference-link-font-weight-hover, normal);
		font-style: var(--preference-link-font-style-hover, normal);
	}

	blockquote {
		position: relative;
		font-family: Georgia, serif;
		font-style: italic;
		font-size: 16px;
		font-weight: 500;
		padding: 40px 30px 30px 30px;
		margin: 0 0 30px 0;
		background: rgba(var(--color-primary), 0.1);
		width: 100%;
		border-left: 4px solid rgba(var(--color-primary), 0.4);
		box-sizing: border-box;

		&::before {
			content: '"';
			position: absolute;
			top: 10px;
			left: 10px;
			font-family: Georgia, serif;
			font-size: 50px;
			font-weight: 700;
			line-height: 1;
			color: rgba(var(--color-primary), 0.25);
		}

		&::after {
			content: '"';
			position: absolute;
			bottom: 0px;
			right: 10px;
			font-family: Georgia, serif;
			font-size: 50px;
			font-weight: 700;
			line-height: 1;
			color: rgba(var(--color-primary), 0.25);
		}
	}

	.portal-html-wrapper {
		margin-bottom: 30px;

		* {
			border: none !important;
		}
	}

	.portal-code-wrapper {
		position: relative;
		margin-bottom: 30px;

		button {
			position: absolute;
			top: 8px;
			right: 8px;
			background: rgba(var(--color-text), 0.1);
			color: rgba(var(--color-text), 0.7);
			border: none;
			padding: 4px 10px;
			border-radius: 4px;
			font-size: 11px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s;
			font-family: system-ui, -apple-system, sans-serif;

			&:hover {
				background: rgba(var(--color-text), 0.15);
				color: rgba(var(--color-text), 0.9);
			}
		}
	}

	code {
		color: rgba(var(--color-text), 0.9);
		background: rgba(0, 0, 0, 0.15);
		border-radius: var(--border-radius);
		font-family: Monaco, Menlo, Consolas, Courier New, monospace;
		font-size: 13px;
		font-weight: 400;
		display: block;
		padding: 16px 20px;
		line-height: 1.6;
		overflow-x: auto;
		margin: 0;
	}

	ul,
	ol {
		padding: 0 0 0 20px;
		font-size: 15px;
		color: rgba(var(--color-text), 1);
		margin-bottom: 30px;

		li {
			font-size: 15px;
			color: rgba(var(--color-text), 1);
			margin-bottom: 5px;

			&:last-child {
				margin-bottom: 0;
			}

			&::marker {
				color: rgba(var(--color-text), 0.6);
			}
		}
	}

	ul {
		list-style-type: disc;
	}

	ol {
		list-style-type: decimal;
	}

	.portal-media-wrapper {
		display: flex;
		margin-top: 10px;
		margin-bottom: 20px;

		p {
			margin-top: 6px;
			margin-bottom: 0;
			font-size: 14px;
			color: rgba(var(--color-text), 0.8);
		}

		img {
			width: 100%;
			height: auto;
			border-radius: 10px;
		}

		video {
			width: 100%;
			height: auto;
		}
	}

	.portal-media-column p,
	.portal-media-column-reverse p {
		text-align: center;
	}

	.portal-media-row,
	.portal-media-row-reverse {
		gap: 15px;

		p {
			margin-top: 0;
			max-width: 300px;
			text-align: left;
		}
	}

	.portal-media-row {
		flex-direction: row;
	}
	.portal-media-row-reverse {
		flex-direction: row-reverse;
	}
	.portal-media-column {
		flex-direction: column;
	}
	.portal-media-column-reverse {
		flex-direction: column-reverse;
	}

	.article-divider-solid {
		height: 1px;
		width: 100%;
		border-top: 1px solid rgba(var(--color-border), 0.4);
		margin: 20px 0;
	}

	.article-divider-dashed {
		height: 1px;
		width: 100%;
		border-top: 1px dashed rgba(var(--color-border), 0.4);
		margin: 20px 0;
	}
`;

export const PreviewHeader = styled.div`
	position: sticky;
	top: 0;
	display: flex;
	justify-content: flex-end;
	background: inherit;
`;
