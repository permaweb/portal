import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
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

	h3 {
		margin: 0 0 10px 0;
		font-size: ${(props) => props.theme.typography.size.lg};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const CommentItem = styled.div`
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

export const CommentText = styled.div`
	color: ${(props) => props.theme.colors.font.primary.base};
	font-size: ${(props) => props.theme.typography.size.base};
	line-height: 1.4;
`;

export const CommentActions = styled.div`
	display: flex;
	align-items: center;
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
	text-align: center;
	padding: 15px;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		color: ${(props) => props.theme.colors.font.alt1};
		text-transform: uppercase;
	}
`;
