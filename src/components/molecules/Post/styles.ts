import styled from 'styled-components';

import { getPostStatusBackground } from 'app/styles';
import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

export const PostWrapper = styled.div`
	display: flex;
	padding: 12.5px 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	transition: all 150ms;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}

	&:hover {
		background: ${(props) => props.theme.colors.container.alt1.background};
	}
`;

export const PostHeader = styled.div`
	max-width: 50%;
	display: flex;
	flex-direction: column;
	gap: 2.5px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	span {
		display: flex;
		align-items: center;
		gap: 5px;
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	svg {
		height: 13.5px;
		width: 13.5px;
		margin: 5.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const PostDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const PostActions = styled.div`
	display: flex;
	gap: 12.5px;
	margin: 0 -4.5px 0 0;
`;

export const PostStatus = styled.div<{ status: ArticleStatusType }>`
	display: flex;
	align-items: center;
	gap: 7.5px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}

	#post-status {
		height: 12.5px;
		width: 12.5px;
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		border-radius: 50%;
		background: ${(props) => getPostStatusBackground(props.status, props.theme)};
	}
`;
