import styled from 'styled-components';

export const Comment = styled.div<{ $level: number; $status?: string }>`
	position: relative;
	display: flex;
	gap: 10px;
	background: var(--color-card-background);
	padding: 10px;
	border-radius: var(--border-radius);
	margin-left: ${(props) => (props.$level > 0 ? `${props.$level * 40}px` : '0')};
	margin-top: ${(props) => (props.$level > 0 ? '-18px' : '0')};
	box-shadow: ${(props) =>
		props?.$status === 'active' || !props?.$status ? '0 4px 10px rgba(0, 0, 0, 0.4)' : '0 1px 4px rgba(0, 0, 0, 0.4)'};

	${(props) =>
		props?.$status !== 'active' &&
		props?.$status &&
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

export const Content = styled.div`
	position: relative;
	width: 100%;
`;

export const AvatarWrapper = styled.div`
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
	}
`;

export const Meta = styled.div`
	display: flex;
	align-items: flex-end;
	font-size: var(--font-size-normal);
	gap: 10px;
`;

export const UsernameWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const Username = styled.span<{ isPostAuthor: boolean }>`
	display: flex;
	align-content: center;
	justify-content: center;
	color: ${(props) =>
		!props.isPostAuthor ? `rgba(var(--color-primary), 1)` : `rgba(var(--color-primary-contrast), 1)`};
	background-color: ${(props) => (!props.isPostAuthor ? `unset` : `rgba(var(--color-primary), 1)`)};
	padding: ${(props) => (!props.isPostAuthor ? 0 : `0 4px`)};
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
	}

	div {
		div {
			svg {
				margin-left: 5px;
				width: 12px;
				height: 12px;
				margin-bottom: -1.5px;
			}
		}
	}
`;

export const PortalMenuTrigger = styled.div<{ $active: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	align-self: flex-start;
	cursor: pointer;
	opacity: ${(props) => (props.$active ? 1 : 0.6)};
	transition: opacity 0.2s;

	&:hover {
		opacity: 1;
	}

	div {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 14px;
		height: 14px;
		fill: rgba(var(--color-primary), 1);
	}
`;

export const Date = styled.span`
	opacity: 0.6;
	font-size: var(--font-size-normal);
	font-weight: 400;

	&::before {
		content: '•';
		margin-right: 10px;
		opacity: 0.8;
	}
`;

export const Text = styled.div`
	width: 100%;
	margin-top: 4px;
	font-size: var(--font-size-normal);
	line-height: 1.5;
`;

export const Actions = styled.div`
	display: flex;
	font-size: var(--font-size-normal);
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

export const EditingIndicator = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: rgba(var(--color-primary), 0.15);
	color: rgba(var(--color-primary), 1);
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
		fill: rgba(var(--color-primary), 1);
	}
`;

export const EditedIndicator = styled.div`
	display: inline-flex;
	align-items: center;
	opacity: 0.6;
	font-size: var(--font-size-normal);
	font-style: italic;
`;

export const PinnedIndicator = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: rgba(46, 204, 113, 0.2);
	color: #2ecc71;
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
		fill: #2ecc71;
	}
`;

export const ReplyEditor = styled.div<{ $level: number }>`
	margin-left: ${(props) => `${props.$level * 40}px`};
	margin-top: -20px;
	margin-bottom: 20px;
`;

export const RepliesToggle = styled.button<{ $level: number }>`
	margin-left: ${(props) => `${props.$level * 40}px`};
	margin-top: -10px;
	margin-bottom: 10px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	background: transparent;
	border: none;
	outline: none;
	color: rgba(var(--color-text), 0.8);
	font-size: var(--font-size-normal);
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
		color: rgba(var(--color-text), 1);
	}

	&:focus {
		outline: none;
	}
`;

export const EditContainer = styled.div`
	margin-top: 8px;
	position: relative;
	z-index: 1;

	/* Remove shadow from the editor when in edit mode */
	> div > div:first-child {
		box-shadow: none !important;
		border: 1px solid rgba(var(--color-primary), 0.3);
	}

	/* Force all text in the editor to match comment font size */
	.editor-input,
	.editor-input *,
	.editor-paragraph,
	[contenteditable] {
		font-size: var(--font-size-normal) !important;
		line-height: 1.5 !important;
	}
`;

export const ArrowIcon = styled.div<{ $rotated: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	transform: ${(props) => (props.$rotated ? 'rotate(0deg)' : 'rotate(180deg)')};
	transition: transform 0.2s;

	div {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		width: 16px;
		height: 16px;
		fill: rgba(var(--color-primary), 1);
	}
`;
