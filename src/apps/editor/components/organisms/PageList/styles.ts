import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const MainPagesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PagesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

export const InfoPagesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const InfoPagesHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 15px 0;

	h6 {
		font-size: ${(props) => props.theme.typography.size.xxLg} !important;
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const PageWrapper = styled.div`
	display: flex;
	padding: 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	transition: all 100ms;
	background: ${(props) => props.theme.colors.container.alt1.background};
	cursor: pointer;

	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const Arrow = styled.div<{ $open: boolean }>`
	display: flex;
	align-items: center;
	svg {
		width: 17.5px;
		height: 17.5px;
		transform: rotate(${(props) => (props.$open ? '0deg' : '270deg')});
		fill: ${(props) => props.theme.colors.font.primary};
		color: ${(props) => props.theme.colors.font.primary};
		transition: transform 100ms;
	}
`;

export const PageHeader = styled.div`
	max-width: 50%;
	display: flex;
	align-items: center;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const PageDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const PageActions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const WrapperEmpty = styled.div`
	width: 100%;
	padding: 12.5px 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;

export const HomeTemplateWrapper = styled.div`
	padding: 15px;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const HomeTemplateOptions = styled.div`
	display: flex;
	gap: 15px;
`;

export const HomeTemplateOption = styled.button<{ $active: boolean; disabled: boolean }>`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px;
	background: ${(props) =>
		props.$active ? props.theme.colors.button.primary.active.background : props.theme.colors.button.primary.background};
	border: 2px solid
		${(props) => (props.$active ? props.theme.colors.indicator.active : props.theme.colors.button.primary.border)};
	border-radius: ${STYLING.dimensions.radius.primary};
	cursor: ${(props) => (props.$active ? 'default' : props.disabled ? 'not-allowed' : 'pointer')};
	pointer-events: ${(props) => (props.$active ? 'none' : 'auto')};
	transition: all 100ms;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};

	&:hover {
		background: ${(props) =>
			props.$active
				? props.theme.colors.button.primary.active.background
				: props.disabled
				? props.theme.colors.button.primary.background
				: props.theme.colors.button.primary.active.background};
		border: 2px solid
			${(props) =>
				props.$active
					? props.theme.colors.indicator.active
					: props.disabled
					? props.theme.colors.button.primary.border
					: props.theme.colors.button.primary.active.border};
	}
`;

export const HomeTemplateOptionIcon = styled.div<{ $active: boolean }>`
	width: 100%;
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 12px;

	img {
		width: 100%;
		height: auto;
		opacity: ${(props) => (props.$active ? 1 : 0.5)};
	}

	svg {
		width: 40px;
		height: 40px;
		opacity: ${(props) => (props.$active ? 1 : 0.5)};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const HomeTemplateIconPlaceholder = styled.div<{ $active: boolean }>`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	opacity: ${(props) => (props.$active ? 1 : 0.5)};

	svg {
		width: 40px;
		height: 40px;
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const HomeTemplateOptionLabel = styled.p`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall} !important;
	font-weight: ${(props) => props.theme.typography.weight.bold} !important;
	font-family: ${(props) => props.theme.typography.family.primary} !important;
	text-transform: uppercase;
	margin: 0;
`;
