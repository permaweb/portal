import styled from 'styled-components';

import { transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

export const App = styled.div`
	min-height: 100vh;
	position: relative;
`;

export const View = styled.main<{ navigationOpen: boolean; navWidth?: number }>`
	min-height: calc(100vh - ${STYLING.dimensions.nav.height} - 15px);
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
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const Footer = styled.footer<{ navigationOpen: boolean; navWidth?: number }>`
	width: 100%;
	max-width: ${STYLING.cutoffs.max};
	padding: 15px 20px 15px
		calc(${(props) => (props.navWidth !== undefined ? `${props.navWidth}px` : STYLING.dimensions.nav.width)} + 30px);
	transition: padding-left ${transition2};
	margin: ${STYLING.dimensions.nav.height} 0 0 0;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 20px;
	}

	@media (min-width: ${parseInt(STYLING.cutoffs.desktop) + 1}px) {
		${View}:has([data-article-panel-open='true']) + & {
			/* Match the editor's 30px/25px gutters and leave a 20px gap beside the panel. */
			max-width: min(
				${STYLING.cutoffs.max},
				calc(
					${STYLING.cutoffs.maxEditor} +
						${(props) => (props.navWidth !== undefined ? `${props.navWidth}px` : STYLING.dimensions.nav.width)} + 55px
				)
			);
			margin-left: auto;
			margin-right: auto;
			padding-right: calc(${STYLING.dimensions.articleToolbar.width} + 45px);
		}
	}
`;

export const FooterContent = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	padding: 20px 30px 5px 30px;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};

	> p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
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
