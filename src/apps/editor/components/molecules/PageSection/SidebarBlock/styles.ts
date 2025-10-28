import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 5px 0 0 0;
`;

export const BannerWrapper = styled.div<{ hasImage: boolean }>`
	min-height: 115px;
	height: 125px;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: 1px solid ${(props) => (props.hasImage ? 'transparent' : props.theme.colors.border.primary)};
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};

	img {
		height: 125px;
		width: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.primary};
		aspect-ratio: 16/9;
		filter: brightness(0.65);
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}
`;

export const AvatarWrapper = styled(BannerWrapper)`
	min-height: 0;
	height: 65px;
	width: 65px;
	border-radius: 50%;
	flex: none;
	margin: -55px 0 0 15px;
	position: relative;

	img {
		height: 65px;
		width: 65px;
		border-radius: 50%;
		filter: brightness(1);
	}

	span {
		font-size: ${(props) => props.theme.typography.size.xxxxSmall};
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
		margin: 15px 0 0 0;
	}
`;

export const ContentPlaceholderLine = styled.div<{ flex: number }>`
	height: 14px;
	width: ${(props) => props.flex * 100}%;
	background: ${(props) => props.theme.colors.border.alt4};
	border-radius: 4px;
	opacity: 0.25;
`;
