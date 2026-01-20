import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 15px;
	h4 {
		font-size: clamp(18px, 3.25vw, 24px);
		line-height: 1.5;
	}
`;

export const Body = styled.div`
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: var(--spacing-xs);
	padding: var(--spacing-m);

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: var(--spacing-xs);
	}
`;

export const Form = styled.div`
	display: flex;
	flex-direction: column;
	height: fit-content;
	width: 100%;

	label {
		margin-top: 10px;
		font-size: 12px;
		font-weight: 600;
		color: rgba(var(--color-text), 1);
	}

	input {
		font-size: 16px;
		padding: 8px 10px;
		outline: none;
		border: 1px solid rgba(var(--color-border), 0.5);
		border-radius: var(--border-radius);
		background: rgba(var(--color-text), 0.05);
		color: rgba(var(--color-text), 1);

		&:focus {
			border: 1px solid rgba(var(--color-primary), 1);
		}
	}

	textarea {
		height: 240px !important;
		width: 100%;
		font-size: 16px;
		padding: 8px 10px;
		box-sizing: border-box;
		outline: none;
		border: 1px solid rgba(var(--color-border), 0.5);
		border-radius: var(--border-radius);
		background: rgba(var(--color-text), 0.05);
		color: rgba(var(--color-text), 1);

		&:focus {
			border: 1px solid rgba(var(--color-primary), 1);
		}

		@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
			height: 100px !important;
		}
	}
`;

export const TForm = styled.div`
	display: flex;
	flex-direction: column;
	margin: 20px 0 30px 0;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		margin: var(--spacing-xs) 0;
	}
`;

export const PWrapper = styled.div`
	height: fit-content;
	min-width: 500px;
	width: calc(50% - 20px);
	flex: 1;
	input {
		display: none;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		min-width: unset;
		width: 100%;
	}
`;

export const CWrapper = styled.div`
	display: flex;
	align-items: center;
	span {
		display: block;
		max-width: 75%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.c-wrapper-checkbox {
		margin: 4.5px 0 0 7.5px;
	}
`;

export const BWrapper = styled.div`
	width: 100%;
	position: relative;
`;

export const BannerInput = styled.button<{ $hasBanner: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 200px;
	width: 100%;
	// border: ${(props) => (props.$hasBanner ? `none` : `1px dashed rgba(var(--color-primary), 1)`)};
	overflow: hidden;
	padding: 0;
	span {
	}
	svg {
		height: 35px;
		width: 35px;
		margin: 0 0 10px 0;
	}
	img {
		height: 200px;
		width: 100%;
		object-fit: cover;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		height: 120px;

		img {
			height: 120px;
		}
	}

	&:hover {
		outline: 1px dashed rgba(var(--color-primary), 1);
		outline-offset: -1px;
		color: rgba(var(--color-primary), 1);
	}
	&:focus {
		opacity: 1;
	}
	&:disabled {
	}

	${(props) =>
		props.$hasBanner && !props.disabled
			? `
        pointer-events: all;
        ::after {
					content: "";
					position: absolute;
					height: 200px;
					width: 100%;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					opacity: 0;
					transition: all 100ms;
        }
        
        &:hover::after {
          opacity: 1;
        }
        &:focus::after {
          opacity: 1;
        }
        &:hover {
					cursor: pointer;
					border: 1px solid rgba(var(--color-border), 0.5);
        }
    `
			: ''}
`;

export const AvatarInput = styled.button<{ $hasAvatar: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 115px;
	width: 115px;
	border-radius: 50%;
	position: absolute;
	bottom: -55px;
	left: 20px;
	z-index: 1;
	overflow: hidden;
	padding: 0;
	// border: ${(props) => (props.$hasAvatar ? `none` : `1px dashed rgba(var(--color-primary), 1)`)};

	span {
	}
	svg {
		height: 25px;
		width: 25px;
		margin: 0 0 5px 0;
	}
	img {
		height: 100%;
		width: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		height: 70px;
		width: 70px;
		bottom: -35px;
		left: 10px;

		svg {
			margin: 0;
		}
	}

	&:hover {
		outline: 1px dashed rgba(var(--color-primary), 1);
		outline-offset: -1px;
		color: rgba(var(--color-primary), 1);
	}
	&:focus {
		opacity: 1;
	}
	&:disabled {
	}
	${(props) =>
		props.$hasAvatar && !props.disabled
			? `
        pointer-events: all;
        ::after {
            content: "";
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            transition: all 100ms;
        }
        &:hover::after {
            opacity: 1;
        }
        &:focus::after {
            opacity: 1;
        }
        &:hover {
            cursor: pointer;
            border: 1px solid rgba(var(--color-border), 0.5);
        }
    `
			: ''}
`;

export const ImageActions = styled.div`
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: var(--spacing-xs);
	margin-top: var(--spacing-xs);

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		button {
			padding: var(--spacing-xxs) var(--spacing-xs);
		}
	}
`;

export const PInfoMessage = styled.div`
	margin: 15px 0 0 0;
	display: flex;
	justify-content: flex-end;
	span {
		line-height: 1.5;
	}
`;

export const SAction = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: 10px;
	position: relative;
`;

export const Message = styled.div`
	position: absolute;
	left: 0;
	span {
		line-height: 1.5;
	}
`;

export const MWrapper = styled.div`
	padding: 0 20px 20px 20px;
`;

export const MInfo = styled.div`
	margin: 0 0 20px 0;
	span {
		line-height: 1.5;
	}
`;

export const MActions = styled.div`
	margin: 10px 0 0 0;
	display: flex;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const MInfoWrapper = styled.div`
	width: fit-content;
	margin: 20px 0 0 auto;
	span {
		text-align: center;
		display: block;
		padding: 2.5px 12.5px;
		margin: 0 0 7.5px 0;
	}
`;

export const LoadingMessage = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgba(var(--color-background), 0.95);
	padding: 20px 30px;
	border-radius: 8px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	display: flex;
	align-items: center;
	gap: 4px;

	span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(var(--color-primary), 1);
		animation: loadingDot 1.4s infinite ease-in-out both;

		&:nth-child(1) {
			animation-delay: -0.32s;
		}
		&:nth-child(2) {
			animation-delay: -0.16s;
		}
		&:nth-child(3) {
			animation-delay: 0s;
		}
	}

	@keyframes loadingDot {
		0%,
		80%,
		100% {
			transform: scale(0.6);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
`;
