import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
		gap: 20px;
	}
`;

export const SectionWrapper = styled.div`
	height: fit-content;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const Section = styled.div`
	height: fit-content;
	width: 100%;
`;

export const SectionHeader = styled.div`
	padding: 12.5px 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => props.theme.colors.container.alt1.background};
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const SectionBody = styled.div`
	width: 100%;
	padding: 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	padding: 0.5px 10px 2.5px 10px;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}
`;

export const MediaEntry = styled.div`
	width: 100%;
	margin-top: 12.5px;
	margin-bottom: 20px;
`;

export const MediaEntryWallpaper = styled.div`
	width: 100%;
	margin-top: 12.5px;
	margin-bottom: 20px;
`;

export const MediaTitleWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 5px 0;
`;

export const MediaTitle = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	margin: 0;
`;

export const MediaInfo = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
`;
