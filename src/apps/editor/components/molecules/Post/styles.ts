import styled from 'styled-components';

import { getPostStatusBackground } from 'editor/styles';

import { STYLING } from 'helpers/config';
import { ArticleStatusType } from 'helpers/types';

export const PostWrapper = styled.div`
	display: flex;
	padding: 12.5px 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	transition: all 100ms;
	background: ${(props) => props.theme.colors.container.primary.background};

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}

	&:hover {
		background: ${(props) => props.theme.colors.container.alt2.background};
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

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const PostHeaderDetail = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	span {
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
		margin: 8.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
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

export const PostMenuWrapper = styled.div`
	position: relative;
`;

export const PostMenuAction = styled.div`
	button {
		padding: 3.5px 0 0 0 !important;
	}
`;

export const PostMenuDropdown = styled.div`
	max-height: 75vh;
	width: 265px;
	max-width: 80vw;
	position: absolute;
	z-index: 2;
	top: 30.5px;
	right: 0;
	padding: 10px;

	button {
		height: 35px;
		width: 100%;
		display: flex;
		gap: 12.5px;
		align-items: center;
		cursor: pointer;
		background: transparent;
		border-radius: ${STYLING.dimensions.radius.alt4};
		transition: all 100ms;
		padding: 0 10px;

		p {
			color: ${(props) => props.theme.colors.font.primary};
			font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.medium} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
			display: block;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: 85%;
			overflow: hidden;
			text-decoration: none !important;
		}

		span {
			font-family: ${(props) => props.theme.typography.family.primary} !important;
			display: block;
			text-transform: uppercase;
			padding: 2.5px 6.5px;
			border: 1px solid transparent;
			background: ${(props) => props.theme.colors.container.alt2.background} !important;
			border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
			border-radius: ${STYLING.dimensions.radius.alt3} !important;
			color: ${(props) => props.theme.colors.font.primary} !important;
			font-size: 10px !important;
			font-weight: ${(props) => props.theme.typography.weight.bold} !important;

			margin: 0 0 0 auto;
		}

		.info {
			padding: 2.5px 7.5px !important;
		}

		svg {
			height: 14.5px;
			width: 14.5px;
			margin: 2.5px 0 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		img {
			height: 22.5px;
			width: 22.5px;
			margin: 0 12.5px 0 0;
		}

		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
		}
	}
`;

export const PostMenuDivider = styled.div`
	height: 1px;
	width: calc(100% - 20px);
	margin: 5px auto;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const PostMenuWarning = styled.button`
	padding: 0 8.5px;

	p {
		color: ${(props) => props.theme.colors.warning.primary} !important;
	}

	svg {
		color: ${(props) => props.theme.colors.warning.primary} !important;
		fill: ${(props) => props.theme.colors.warning.primary} !important;
	}
`;

export const PostStatus = styled.div<{ status: ArticleStatusType }>`
	display: flex;
	align-items: center;
	gap: 7.5px;

	span {
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

export const RemoveModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 20px 20px 20px !important;
`;

export const RemoveModalBodyWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const RemoveModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
	margin: 10px 0 0 0;
`;
