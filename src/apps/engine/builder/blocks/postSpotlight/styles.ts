import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Wrapper = styled.div`
	position: relative;
	width: 100%;

	a {
		width: 100%;
		display: flex;
		padding: 18px 0;
	}

	&:hover {
		img {
			transform: scale(1.1);
		}
		h2 {
			margin-left: -24%;
			margin-right: 4%;
		}
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: var(--spacing-xxs);
		a {
			flex-direction: column;
		}
	}
`;

export const Thumbnail = styled.div`
	width: 60%;
	overflow: hidden;

	img,
	div {
		width: 100%;
		aspect-ratio: 16/8;
		object-fit: cover;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
		z-index: 0;
		transition: transform 0.4s;
		background: rgba(var(--color-text), 0.2);
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		width: 100%;
		img,
		div {
		}
	}
`;

export const Data = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	z-index: 1;
	width: 40%;

	h2 {
		display: block;
		margin-left: -20%;
		margin-right: 0%;
		color: white;
		font-size: 30px;
		line-height: 52px;
		padding: 12px 30px;
		text-align: left;
		-webkit-font-smoothing: antialiased;
		box-sizing: border-box;
		word-wrap: break-word;
		transition: margin 0.4s;

		span {
			display: inline;
			text-align: left;
			-webkit-font-smoothing: antialiased;
			word-wrap: break-word;
			box-sizing: border-box;
			text-decoration: none;
			padding: 6px 14px;
			background: rgba(var(--color-secondary), 1);
			color: white;
			-webkit-box-decoration-break: clone;
			font-weight: 800;
		}
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		width: 100%;
		margin-top: -20%;
		h2 {
			margin-left: 0;
			margin-right: 10%;
			font-size: 18px;
			line-height: 36px;
			padding: 10px 10px;
		}
	}
`;

export const Type = styled.div`
	background: var(--color-navigation-background);
	color: white;
	text-transform: uppercase;
	font-size: 10px;
	font-weight: 600;
	width: fit-content;
	height: fit-content;
	padding: 2px 6px;
	margin-left: 6%;
`;

export const Meta = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	text-transform: uppercase;
	font-size: 12px;
	font-weight: 600;
	margin-left: 12%;
	color: rgba(var(--color-text), 1);

	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background-color: rgba(var(--color-text), 1);
	}

	span {
		height: 100%;
		&:first-of-type {
			font-weight: 900;
		}
		&:last-of-type {
			opacity: 0.6;
		}
	}
`;

export const MenuWrapper = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	z-index: 10;
`;

export const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

export const ModalContainer = styled.div`
	background: var(--color-card-background);
	border: 1px solid var(--color-card-border);
	border-radius: 8px;
	width: 500px;
	max-width: 90vw;
	box-shadow: var(--preference-card-shadow);
`;

export const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid var(--color-card-border);
	color: rgba(var(--color-text), 1);

	span {
		font-size: 16px;
		font-weight: 600;
	}
`;

export const ModalClose = styled.button`
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	color: rgba(var(--color-text), 0.6);
	padding: 0;
	line-height: 1;

	&:hover {
		color: rgba(var(--color-text), 1);
	}
`;

export const ModalContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
`;

export const ModalLabel = styled.label`
	font-size: 14px;
	font-weight: 500;
`;

export const ModalFilterInput = styled.input`
	width: 100%;
	padding: 10px 12px;
	font-size: 14px;
	border: 1px solid rgba(var(--color-text), 0.2);
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.3);
	color: inherit;
	box-sizing: border-box;

	&::placeholder {
		color: rgba(var(--color-text), 0.5);
	}

	&:focus {
		outline: none;
		border-color: rgba(var(--color-primary), 1);
	}
`;

export const ModalOptionsList = styled.div`
	width: 100%;
	max-height: 200px;
	overflow-y: auto;
	border: 1px solid rgba(var(--color-text), 0.2);
	border-radius: 4px;
	background-color: rgba(0, 0, 0, 0.3);
`;

export const ModalOption = styled.div<{ $active: boolean }>`
	padding: 10px 12px;
	font-size: 14px;
	cursor: pointer;
	background-color: ${(props) => (props.$active ? 'rgba(var(--color-primary), 0.3)' : 'transparent')};
	color: rgba(var(--color-text), 1);

	&:hover {
		background-color: ${(props) =>
			props.$active ? 'rgba(var(--color-primary), 0.3)' : 'rgba(var(--color-text), 0.1)'};
	}
`;

export const ModalOptionsEmpty = styled.div`
	padding: 20px 12px;
	font-size: 14px;
	color: rgba(var(--color-text), 0.5);
	text-align: center;
`;

export const ModalActions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 10px;
`;
