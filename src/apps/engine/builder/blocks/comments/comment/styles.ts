import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const Comment = styled.div<{ $level: number }>`
	display: flex;
	gap: 10px;
	margin-left: ${(props) => `calc(${props.$level} * 30px)`};
	background: var(--color-card-background);
	padding: 10px;
	margin-top: ${(props) => (props.$level > 0 ? `-16px` : 0)};
	border-radius: var(--border-radius);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
`;

export const Avatar = styled.div`
	flex-shrink: 0;
	width: 46px;
	height: 46px;
	background: rgba(var(--color-text), 0.5);
	border-radius: 50%;
	img {
		width: 46px;
		height: 46px;
		border-radius: 50%;
	}
`;

export const Content = styled.div``;

export const Meta = styled.div`
	display: flex;
	align-items: flex-end;
	font-size: 14px;
	gap: 10px;
`;

export const Username = styled.span`
	color: rgba(var(--color-primary), 1);
	font-weight: 600;
`;

export const Date = styled.span`
	opacity: 0.6;
	font-size: 12px;
	font-weight: 600;
`;

export const Text = styled.div`
	margin-top: 4px;
`;

export const Actions = styled.div`
	display: flex;
	font-size: 14px;
	gap: 10px;
	margin-top: 10px;
`;

export const Action = styled.div`
	display: flex;
	gap: 4px;
	opacity: 0.8;
	div,
	svg {
		width: 20px;
		height: 20px;
		color: rgba(var(--color-text), 1);
	}

	&:hover {
		cursor: pointer;
		opacity: 1;
	}
`;
