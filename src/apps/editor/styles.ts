import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

export const App = styled.div`
	min-height: 100vh;
	position: relative;
`;

export const View = styled.main<{ navigationOpen: boolean; navWidth?: number }>`
	min-height: calc(100vh - ${STYLING.dimensions.nav.height} - 35px);
	position: relative;
	top: ${STYLING.dimensions.nav.height};
	padding: 0 25px 20px
		calc(${(props) => (props.navWidth !== undefined ? `${props.navWidth}px` : STYLING.dimensions.nav.width)} + 30px);
	margin: 0 auto;
	transition: padding-left ${transition2};
	display: flex;
	flex-direction: column;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 0 20px 20px 20px;
	}
`;

export const CenteredWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.view.background};
`;

export const MessageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20px;
	padding: 12.5px 30px;

	p {
		width: 500px;
		max-width: 90vw;
		text-align: center;
		line-height: 1.65;
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const Footer = styled.footer<{ navigationOpen: boolean; navWidth?: number }>`
	width: 100%;
	max-width: ${STYLING.cutoffs.max};
	padding: 0 20px 15px
		calc(${(props) => (props.navWidth !== undefined ? `${props.navWidth}px` : STYLING.dimensions.nav.width)} + 30px);
	transition: padding-left ${transition2};
	margin: ${STYLING.dimensions.nav.height} 0 0 0;
	display: flex;
	align-items: center;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 20px;
	}
`;

export const getPostStatusBackground = (status: ArticleStatusType, theme: any) => {
	switch (status) {
		case 'draft':
			return theme.colors.status.draft;
		case 'published':
			return theme.colors.status.published;
		default:
			return theme.colors.status.draft;
	}
};
