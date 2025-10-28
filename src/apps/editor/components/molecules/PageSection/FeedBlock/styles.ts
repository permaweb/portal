import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const ContentWrapper = styled.div<{ layout: string }>`
	display: flex;
	flex-direction: ${(props) => (props.layout === 'blog' ? 'row' : 'column')};
	gap: 15px;
`;

export const CategoryWrapper = styled.div<{ layout: string }>`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: ${(props) => (props.layout === 'blog' ? '2.5px' : '10px')};
`;

export const CategoryHeader = styled.div<{ layout: string }>`
	width: 100%;
	border-top: 2px solid
		${(props) => (props.layout === 'blog' ? 'transparent' : props.theme.colors.container.primary.active)};

	p {
		display: block;
		width: fit-content;
		padding: ${(props) => (props.layout === 'blog' ? '0' : '3.5px 11.5px')};
		background: ${(props) => (props.layout === 'blog' ? 'transparent' : props.theme.colors.container.primary.active)};
		color: ${(props) => (props.layout === 'blog' ? props.theme.colors.font.alt1 : props.theme.colors.font.primary)};
		font-size: ${(props) =>
			props.layout === 'blog' ? props.theme.typography.size.xSmall : props.theme.typography.size.xxxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const CategoryBody = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const PostWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;
`;

export const PostInfo = styled.div<{ layout: string }>`
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) =>
			props.layout === 'blog' ? props.theme.typography.size.xLg : props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) =>
			props.layout === 'blog' ? props.theme.typography.family.alt1 : props.theme.typography.family.primary};
	}

	span {
		color: ${(props) => props.theme.colors.font.alt2};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const PostImage = styled.div<{ hasImage: boolean }>`
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(props) => (props.hasImage ? 'transparent' : props.theme.colors.border.primary)};
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.primary};
		aspect-ratio: 16/9;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
		padding: 30px;
	}
`;

export const ActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
	padding: 15px 0 0 0;
	margin: 15px 0 0 0;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;
