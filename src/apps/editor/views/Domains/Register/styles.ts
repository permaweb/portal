import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
`;

export const SectionWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const SectionHeader = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		white-space: nowrap;
	}
`;

export const SectionDivider = styled.div`
	height: 1.5px;
	width: 100%;
	border-top: 1.5px solid ${(props) => props.theme.colors.border.alt4};
`;

export const SectionBody = styled.div``;

export const SearchWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 25px;
`;

export const SearchInputWrapper = styled.div`
	width: 510px;
	max-width: 100%;
	position: relative;

	input {
		background: transparent;
		padding: 10px 10px 10px 40.5px !important;
		margin: 0 !important;
	}

	svg {
		height: 15px;
		width: 15px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
		position: absolute;
		z-index: 1;
		top: 23.5px;
		left: 13.5px;
	}
`;

export const IndicatorWrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: 17.5px 0 0 0;
`;

export const IndicatorLine = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		line-height: 1.5;
		text-transform: uppercase;
		white-space: nowrap;
	}
`;

export const Indicator = styled.div<{ status: null | 'valid' | 'invalid' }>`
	min-height: 13.5px;
	height: 13.5px;
	min-width: 13.5px;
	width: 13.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => {
		if (props.status === 'valid') return props.theme.colors.indicator.active;
		if (props.status === 'invalid') return props.theme.colors.warning.primary;
		return props.theme.colors.container.alt4.background;
	}};
	border: 1px solid ${(props) => props.theme.colors.border.alt4};
	border-radius: 50%;

	svg {
		height: 7.5px;
		width: 7.5px;
		margin: 0 0 2.15px 0;
		color: ${(props) => props.theme.colors.font.light1};
		fill: ${(props) => props.theme.colors.font.light1};
	}
`;

export const ActionsWrapper = styled.div`
	width: fit-content;
	display: flex;
	align-items: center;
	gap: 15px;
	margin: 0 0 12.5px auto;
`;

export const UpdateWrapper = styled.div`
	height: fit-content;
	padding: 5px 15px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;
	background: ${(props) => props.theme.colors.container.alt11.background};

	p {
		color: ${(props) => props.theme.colors.font.light1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
