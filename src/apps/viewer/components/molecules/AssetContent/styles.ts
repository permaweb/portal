import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;

	p {
		font-size: ${(props) => props.theme.typography.size.lg};
		line-height: 1.65;
	}

	a {
		text-decoration: underline;
		text-decoration-thickness: 1.25px;
		cursor: pointer;
	}

	blockquote {
		font-family: Georgia, serif;
		font-style: italic;
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt2};
	}

	ol,
	ul {
		padding: 0 0 0 20px;

		> div {
			> li {
				margin-bottom: 5px;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}

		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};

		li {
			color: ${(props) => props.theme.colors.font.primary};
			font-weight: ${(props) => props.theme.typography.weight.bold};
			font-size: ${(props) => props.theme.typography.size.base};

			&::marker {
				font-weight: ${(props) => props.theme.typography.weight.bold};
				color: ${(props) => props.theme.colors.font.alt1};
			}
		}
	}

	ol {
		list-style-type: decimal;
	}

	ul {
		list-style-type: disc;
	}

	code {
		color: ${(props) => props.theme.colors.font.primary};
		background: ${(props) => props.theme.colors.container.alt1.background};
		border-radius: ${STYLING.dimensions.radius.alt4};
		font-family: Monaco, Menlo, Consolas, Courier New, monospace;
		font-size: 12px;
		font-weight: 600;
		display: block;
		padding: 12.5px 15px;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		line-height: 1;
	}

	h1 {
		font-size: clamp(28.6px, 2.53vw, 39.6px);
	}
	h2 {
		font-size: clamp(24.2px, 2.2vw, 35.2px);
	}
	h3 {
		font-size: clamp(22px, 1.98vw, 30.8px);
	}
	h4 {
		font-size: clamp(19.8px, 1.76vw, 26.4px);
	}
	h5 {
		font-size: clamp(17.6px, 1.54vw, 22px);
	}
	h6 {
		font-size: clamp(15.4px, 1.32vw, 19.8px);
	}

	img,
	video {
		width: 100%;
	}

	.portal-media-wrapper {
		display: flex;
		gap: 7.5px;

		img,
		video {
			height: fit-content;
		}

		p {
			min-width: 300px;
			color: ${(props) => props.theme.colors.font.alt1};
			font-size: ${(props) => props.theme.typography.size.xxSmall};
			font-weight: ${(props) => props.theme.typography.weight.bold};
			font-family: ${(props) => props.theme.typography.family.primary};
		}

		@media (max-width: 840px) {
			flex-direction: column !important;

			img,
			video {
				width: 100% !important;
			}

			p {
				max-width: 100% !important;
			}
		}
	}

	.portal-media-row,
	.portal-media-row-reverse,
	.portal-media-column,
	.portal-media-column-reverse {
		img,
		video {
			width: 100%;
		}
	}

	.portal-media-row img,
	.portal-media-row video,
	.portal-media-row-reverse img,
	.portal-media-row-reverse video {
		width: calc(100% - 312.5px);
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

	@media (max-width: ${STYLING.cutoffs.initial}) {
		p {
			font-size: 16px;
		}
	}
`;
