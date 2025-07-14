import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 20px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
	}
`;

export const FeaturedWrapper = styled.div`
	width: 1050px;
	padding: 0 20px 0 0;
	display: flex;
	flex-direction: column;
	gap: 20px;
	border-right: 1px solid ${(props) => props.theme.colors.border.alt1};

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
		padding: 0;
		border-right: none;
	}
`;

export const CategorySection = styled.div``;

export const CategoryHeader = styled.div`
	width: 100%;
	margin: 0 0 20px 0;
	border-top: 2px solid ${(props) => props.theme.colors.container.alt5.background};

	span {
		width: fit-content;
		display: block;
		padding: 5.5px 15px 4.5px 15px;
		color: ${(props) => props.theme.colors.font.alt4};
		background: ${(props) => props.theme.colors.container.alt5.background};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}
`;

export const PanelWrapper = styled.div`
	width: calc(100% - 1090px);

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
	}
`;

export const PanelHeader = styled.div`
	width: 100%;
	margin: 0 0 20px 0;
	border-top: 2px solid ${(props) => props.theme.colors.container.alt5.background};

	span {
		width: fit-content;
		display: block;
		padding: 5.5px 15px 4.5px 15px;
		color: ${(props) => props.theme.colors.font.alt4};
		background: ${(props) => props.theme.colors.container.alt5.background};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}
`;
