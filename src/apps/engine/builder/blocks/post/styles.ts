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
		font-size: var(--font-size-large);
		font-weight: 400;
		color: rgba(var(--color-text), 1);
	}

	a {
		text-decoration: underline;
	}

	blockquote {
		position: relative;
		font-family: Georgia, serif;
		font-style: italic;
		font-size: 15px;
		font-weight: 500;
		padding: 8px;
		background: rgba(var(--color-primary), 0.1);

		&::before,
		&::after {
			color: var(--color-text);
			content: '"';
			font-family: Georgia, serif;
			font-size: 16px;
		}
	}

	code {
		color: rgba(var(--color-primary));
		background: rgba(var(--color-primary), 0.1);
		border-radius: var(--border-radius);
		font-family: Monaco, Menlo, Consolas, Courier New, monospace;
		font-size: 12px;
		font-weight: 600;
		display: block;
		padding: 12px 15px;
	}

	ul,
	li,
	ol {
		color: rgba(var(--color-primary), 1);
	}

	.portal-media-wrapper {
		display: flex;
		flex-direction: column;
		margin: 10px 0 20px 0;
		gap: 6px;

		p {
			width: 100%;
			text-align: center;
			margin-top: 0;
			color: rgba(var(--color-primary), 1);
		}

		img {
			width: 100%;
			border-radius: 10px;
		}

		video {
			width: 100%;
		}
	}

	.portal-image-row {
		/* Default Flex */
	}
	.portal-image-row-reverse {
		flex-direction: row-reverse;
	}
	.portal-image-column {
		flex-direction: column;
	}
	.portal-image-column-reverse {
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
	padding: 20px 0 0 0;
	z-index: 1;
	position: relative;
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
