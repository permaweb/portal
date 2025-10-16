import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
	}
`;

export const SectionWrapper = styled.div`
	width: calc(50% - 12.5px);
	display: flex;
	flex-direction: column;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		width: 100%;
	}
`;

export const Section = styled.div`
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

export const CommentsList = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const CommentItem = styled.div<{ $blocked?: boolean }>`
	width: 100%;
	padding: 12px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 8px;
	transition: all 0.2s;

	&:hover {
		border-color: ${(props) => props.theme.colors.border.alt1};
	}
`;

export const CommentRow = styled.div`
	display: flex;
	gap: 12px;
	align-items: flex-start;
`;

export const Avatar = styled.div`
	width: 40px;
	height: 40px;
	min-width: 40px;
	border-radius: 50%;
	overflow: hidden;
	background: ${(props) => props.theme.colors.container.alt2.background};

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

export const CommentContent = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
`;

export const CommentMeta = styled.div`
	display: flex;
	align-items: center;
	font-size: ${(props) => props.theme.typography.size.small};
`;

export const AuthorInfo = styled.div`
	display: flex;
	gap: 6px;
	align-items: center;
	flex-wrap: wrap;

	strong {
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.primary.base};
	}

	span {
		color: ${(props) => props.theme.colors.font.primary.alt1};
	}
`;

export const CommentDate = styled.span`
	color: ${(props) => props.theme.colors.font.primary.alt2};
	font-size: ${(props) => props.theme.typography.size.small};
	margin-left: 4px;
`;

export const BlockedBadge = styled.span`
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	background: rgba(255, 95, 31, 0.15);
	border: 1px solid rgba(255, 95, 31, 0.3);
	border-radius: 4px;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: var(--theme-warning);
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

export const BlockedReason = styled.span`
	color: ${(props) => props.theme.colors.font.primary.alt2};
	font-size: ${(props) => props.theme.typography.size.small};
	font-style: italic;
`;

export const CommentText = styled.div`
	color: ${(props) => props.theme.colors.font.primary.base};
	font-size: ${(props) => props.theme.typography.size.base};
	line-height: 1.4;
`;

export const CommentActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const CommentHeader = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.primary.alt1};
`;

export const CommentBody = styled.div`
	padding: 10px 0;
	font-size: ${(props) => props.theme.typography.size.base};
	color: ${(props) => props.theme.colors.font.primary.base};
`;

export const CommentFooter = styled.div`
	display: flex;
	justify-content: space-between;
	font-size: ${(props) => props.theme.typography.size.xSmall};
	color: ${(props) => props.theme.colors.font.primary.alt2};
`;

export const InfoMessage = styled.div`
	width: 100%;
	text-align: left;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		color: ${(props) => props.theme.colors.font.alt1};
		text-transform: uppercase;
	}
`;

export const SubscriptionsSection = styled(Section)``;
export const UsersSection = styled(Section)``;
export const CommentsSection = styled(Section)``;
