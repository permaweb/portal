import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const TitleWrapper = styled.div`
	display: flex;
	align-items: flex-start;
	width: 100%;
	margin-bottom: 20px;
	gap: 16px;

	h1 {
		margin: 0 !important;
		padding: 0 !important;
		flex: 1;
		min-width: 0;
	}
`;

export const DraftDot = styled.div`
	width: 10px;
	height: 10px;
	background: #eeca00;
	border-radius: 50%;
`;

export const DraftIndicator = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	background: rgba(238, 202, 0, 0.2);
	color: #eeca00;
	padding: 6px 14px;
	border-radius: var(--border-radius);
	font-size: 14px;
	font-weight: 600;
	line-height: 1;
	width: fit-content;
	flex-shrink: 0;
	margin-right: 40px;
	align-self: center;
`;

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	z-index: 1;

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
		text-decoration: underline;
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
			outline: none;

			&:hover {
				background: rgba(var(--color-text), 0.15);
				color: rgba(var(--color-text), 0.9);
			}

			&:focus {
				outline: none;
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
		max-width: 100%;

		p {
			margin-top: 6px;
			margin-bottom: 0;
			font-size: 14px;
			color: rgba(var(--color-text), 0.8);
		}

		img {
			width: 100%;
			max-width: 100%;
			height: auto;
			border-radius: 10px;
		}

		video {
			width: 100%;
			max-width: 100%;
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

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			flex-direction: column !important;

			p {
				max-width: 100%;
				text-align: center;
			}
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

export const Post = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: 950px;
	margin-left: auto;
	margin-right: auto;
	padding: var(--spacing-s) 0 0 0;
	z-index: 1;
	position: relative;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding-left: var(--spacing-xxs);
		padding-right: var(--spacing-xxs);
		box-sizing: border-box;
	}
`;

export const Description = styled.p`
	color: rgba(var(--color-primary), 1);
	font-size: var(--font-size-large);
	font-weight: 600 !important;
	margin-bottom: var(--spacing-l);
`;

export const Meta = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	color: rgba(var(--color-primary), 1);

	img {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		margin-right: 6px;
	}

	span {
		font-size: var(--font-size-default);
		font-weight: 600;
	}
`;

export const Thumbnail = styled.img`
	border-radius: 10px;
`;

export const Tags = styled.div`
	display: flex;
	gap: 6px;
	max-width: 100%;
	flex-wrap: wrap;
	margin-top: 10px;
	margin-bottom: 20px;
`;
