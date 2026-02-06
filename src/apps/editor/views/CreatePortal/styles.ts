import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	max-width: 1600px;
	margin: 0 auto;
	padding: 0 20px 24px 20px;
`;

export const Body = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
	gap: 20px;
	align-items: start;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		grid-template-columns: 1fr;
	}
`;

export const Column = styled.div`
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const Section = styled.div``;

export const SectionHeader = styled.div`
	padding: 12px 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const SectionTitle = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	margin: 0;
`;

export const SectionBody = styled.div`
	padding: 20px;
`;

export const PanelInner = styled.div`
	width: 100%;
	max-width: 700px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 18px;
`;

export const FormRow = styled.div`
	display: flex;
	gap: 15px;
	align-items: flex-end;
	flex-wrap: wrap;
`;

export const ImportRow = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	margin-bottom: 10px;
`;

export const DisabledNote = styled.div`
	width: 100%;
	padding: 12px 0;
	p {
		margin: 0;
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}
`;

export const Actions = styled.div`
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
`;

export const Placeholder = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 20px 0;
	svg {
		height: 28px;
		width: 28px;
		color: ${(props) => props.theme.colors.icon.primary.fill};
		fill: ${(props) => props.theme.colors.icon.primary.fill};
	}
	p {
		margin: 0;
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		text-align: center;
		max-width: 280px;
	}
`;

export const MediaBlock = styled.div`
	width: 100%;
	min-width: 0;
	max-width: 560px;
	display: flex;
	flex-direction: column;
	gap: 7.5px;
`;

export const MediaTitle = styled.p`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	margin: 0;
`;

export const LayoutOptions = styled.div`
	display: flex;
	gap: 15px;
	width: 100%;
	flex-wrap: wrap;
	margin-top: 7.5px;
`;

export const LayoutOption = styled.div<{ $active: boolean }>`
	flex: 1;
	min-width: 140px;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	background: ${(props) =>
		props.$active ? props.theme.colors.button.primary.active.background : props.theme.colors.button.primary.background};
	border: 1px solid
		${(props) => (props.$active ? props.theme.colors.indicator.active : props.theme.colors.button.primary.border)};
	border-radius: ${STYLING.dimensions.radius.primary};
	cursor: ${(props) => (props.$active ? 'default' : 'pointer')};
	transition: all 100ms;

	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
		border: 1px solid
			${(props) =>
				props.$active ? props.theme.colors.indicator.active : props.theme.colors.button.primary.active.border};
	}
`;

export const LayoutOptionIcon = styled.div<{ $active: boolean }>`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 12px;

	img {
		width: 100%;
		height: auto;
		opacity: ${(props) => (props.$active ? 1 : 0.5)};
	}
`;

export const LayoutOptionLabel = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall} !important;
	font-weight: ${(props) => props.theme.typography.weight.bold} !important;
	font-family: ${(props) => props.theme.typography.family.primary} !important;
	text-transform: uppercase;
	margin: 0;
`;

export const ViewWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const FlexWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const FlexSection = styled.div<{ flex: number }>`
	flex: ${(props) => props.flex};

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex: 1;
	}
`;

export const MediaEntryLogo = styled.div`
	width: 100%;
	margin: 12.5px 0 20px 0;
`;

export const MediaEntryIcon = styled.div`
	width: 100%;
	margin: 12.5px 0 20px 0;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: flex-end;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		justify-content: flex-start;
		align-items: flex-start;
	}
`;

export const MediaEntryWallpaper = styled.div`
	width: 100%;
	margin: 12.5px 0 20px 0;
`;

export const MediaTitleWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 5px 0;
`;

export const IconTitleWrapper = styled(MediaTitleWrapper)`
	justify-content: flex-end;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		justify-content: flex-start;
	}
`;

export const MediaInfo = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	display: block;
	margin: 5px 0 0 0;
`;

export const SubSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 12px;
`;

export const SubSectionTitle = styled.p`
	margin: 0;
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-transform: uppercase;
`;

export const PillList = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
`;

export const Pill = styled.span`
	padding: 4px 8px;
	border-radius: ${STYLING.dimensions.radius.alt4};
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
`;

export const PreviewList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const PreviewItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 10px 12px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
`;

export const PreviewTitle = styled.p`
	margin: 0;
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.medium};
`;

export const PreviewMeta = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
`;

export const PreviewCount = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	white-space: nowrap;
`;
