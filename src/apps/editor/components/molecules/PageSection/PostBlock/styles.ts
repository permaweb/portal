import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	max-width: 900px;
	margin: 0 auto;
	padding: 0 0 20px 0;
`;

export const PostWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const CategoryHeader = styled.div`
	width: 100%;
	border-top: 2px solid ${(props) => props.theme.colors.container.primary.active};

	p {
		display: block;
		width: fit-content;
		padding: 3.5px 11.5px;
		background: ${(props) => props.theme.colors.container.primary.active};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const PostContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PostImage = styled.div`
	width: 100%;
	min-height: 500px;
	height: 500px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.primary};
		aspect-ratio: 16/9;
	}
`;

export const PostInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;

	h1 {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.h1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.alt1};
		margin: 0;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt2};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		line-height: 1.5;
	}
`;

export const ContentPlaceholderSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 0 0 20px 0;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
		line-height: 1.5;
		display: block;
		margin: 0 0 5px 0;
	}
`;

export const ContentPlaceholderLine = styled.div<{ flex: number }>`
	height: 14px;
	width: ${(props) => props.flex * 100}%;
	background: ${(props) => props.theme.colors.border.alt4};
	border-radius: 4px;
	opacity: 0.25;
`;
