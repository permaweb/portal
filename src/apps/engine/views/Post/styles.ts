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
