import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Wrapper = styled.div`
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
	text-transform: uppercase;
	font-size: 12px;
	font-weight: 600;
	margin-left: 12%;
	color: rgba(var(--color-text), 1);

	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		margin-right: 6px;
		background-color: rgba(var(--color-text), 1);
	}

	span {
		margin-left: 4px;
		height: 100%;
		&:first-of-type {
			font-weight: 900;
		}
		&:last-of-type {
			opacity: 0.6;
		}
	}
`;
