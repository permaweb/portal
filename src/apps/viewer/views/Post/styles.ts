import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	max-width: 800px;
	display: flex;
	margin: 0 auto;
	flex-direction: column;
	gap: 30px;
	padding: 20px 0 0 0;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 0;
	}
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const Title = styled.div``;

export const Description = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.lg};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
	}
`;

export const InfoWrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin: 10px 0;
`;

export const Author = styled.div`
	width: fit-content;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
			text-decoration: underline;
			text-decoration-thickness: 1.25px;
		}
	}
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const ReleasedDate = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const Categories = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	margin: 15px 0 0 0;

	a {
		padding: 5.5px 15px 4.5px 15px;
		color: ${(props) => props.theme.colors.font.alt4};
		background: ${(props) => props.theme.colors.container.alt5.background};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;

		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			background: ${(props) => props.theme.colors.container.alt4.background};
		}
	}
`;

export const FeaturedImage = styled.div`
	width: 100%;

	display: flex;
	align-items: flex-start;
	justify-content: center;
	margin: 15px 0 0 0;

	img {
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		object-position: center center;
	}
`;

export const Content = styled.div`
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

export const FooterWrapper = styled.div`
	width: 100%;
	padding: 30px 0 10px 0;
	border-top: 1px solid ${(props) => props.theme.colors.border.alt4};
`;

export const TopicsWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}
`;

export const Topics = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;

	a,
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}

	a {
		&:hover {
			color: ${(props) => props.theme.colors.link.color};
		}
	}
`;
