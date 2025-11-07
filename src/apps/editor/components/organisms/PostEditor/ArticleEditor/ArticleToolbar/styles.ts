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
	max-width: 920px;
	width: calc(100% - 32px);
	margin: 40px auto;
	background: ${(p) => p.theme.colors.container?.primary};
	border-radius: 12px;
	box-shadow: ${(p) => p.theme.colors.shadow?.level3 || '0 10px 30px rgba(0,0,0,0.15)'};
	max-height: 80vh;
	overflow: auto;
	position: relative;
	padding: 24px;

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
		color: rgba(var(--color-primary), 1);
	}

	a {
		text-decoration: underline;
	}

	blockquote {
		margin: 12px 0;
		position: relative;
		font-family: Georgia, serif;
		font-style: italic;
		font-size: 15px;
		font-weight: 500;
		padding: 8px 12px;
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

export const PreviewHeader = styled.div`
	position: sticky;
	top: 0;
	display: flex;
	justify-content: flex-end;
	background: inherit;
`;
