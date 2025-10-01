import styled from 'styled-components';

export const Wrapper = styled.div<{ status: string }>`
	display: flex;
	flex-direction: column;
	gap: 4px;
	position: relative;
	box-shadow: ${(props) =>
		props?.status === 'active' ? '0 4px 10px rgba(0, 0, 0, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.4)'};

	${(props) =>
		props?.status !== 'active' &&
		`
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 4px;
			background: #e74c3c;
			border-radius: var(--border-radius) 0 0 var(--border-radius);
		}
	`}
`;

export const Comment = styled.div<{ $level: number }>`
	position: relative;
	display: flex;
	gap: 10px;
	margin-left: ${(props) => `calc(${props.$level} * 30px)`};
	background: var(--color-card-background);
	padding: 10px;
	margin-top: ${(props) => (props.$level > 0 ? `-16px` : 0)};
	border-radius: var(--border-radius);
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

export const Content = styled.div`
	position: relative;
	width: 100%;
`;

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
	width: 100%;
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

export const LoadingOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--border-radius);
	z-index: 10;
`;

export const Spinner = styled.div`
	width: 30px;
	height: 30px;
	border: 3px solid rgba(255, 255, 255, 0.2);
	border-top-color: rgba(var(--color-primary), 1);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

export const HiddenIndicator = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: rgba(231, 76, 60, 0.2);
	color: #e74c3c;
	padding: 2px 8px;
	border-radius: var(--border-radius);
	font-size: 11px;
	font-weight: 600;

	div {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 14px;
		height: 14px;
		fill: #e74c3c;
	}
`;
