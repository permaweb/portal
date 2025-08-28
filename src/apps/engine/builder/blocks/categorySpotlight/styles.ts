import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const CategorySpotlight = styled.div`
	display: flex;
	flex-direction: column;
	margin: 20px 0;
	width: 100%;

	h1 {
		margin: 20px 0 30px 0;
		color: rgba(var(--color-primary), 1);
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: var(--spacing-xxs);

		h1 {
			font-size: 26px;
			margin-top: 0;
		}
	}
`;

export const CategorySpotlightGrid = styled.div`
	display: flex;
	gap: 20px;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		flex-direction: column;
	}
`;

export const Left = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 10px;
`;

export const LeftTitle = styled.div`
	font-size: 20px;
	line-height: 26px;
	font-weight: 800;
	color: white;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		font-size: 18px;
	}
`;

export const LeftThumbnail = styled.div`
	position: relative;
	min-width: 80px;
	height: 80px;
	background: black;

	img {
		position: absolute;
		top: 0;
		left: 0;
		width: 80px;
		height: 80px;
		object-fit: cover;
		filter: brightness(0.5);
	}

	span {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		font-weight: 900;
		color: white;
		font-size: 50px;
		z-index: 1;
	}
`;

export const LeftEntry = styled.div`
	display: flex;
	border-bottom: 1px solid rgba(100, 110, 100, 0.5);
	margin-bottom: 10px;
	padding-bottom: 10px;

	&:hover {
		${LeftTitle} {
			color: rgba(var(--color-primary), 1);
		}

		${LeftThumbnail} {
			img {
				filter: brightness(1);
			}

			span {
				display: none;
			}
		}
	}
`;

export const LeftMeta = styled.div`
	margin-left: 10px;
`;

export const LeftSource = styled.div`
	display: flex;
	font-size: 12px;
	text-transform: uppercase;
	color: rgba(var(--color-secondary), 1);
	margin-top: 6px;

	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		margin-right: 6px;
	}
	span {
		margin-left: 4px;
		font-weight: 800;
	}
`;

export const Right = styled.div`
	flex: 2;
`;

export const RightThumbnail = styled.div`
	position: relative;
	width: 100%;
	height: 33%;
	overflow: hidden;

	img {
		width: 100%;
		height: 200px;
		object-fit: cover;
		transition: transform 0.4s;
	}
`;

export const RightEntry = styled.div`
	display: flex;
	margin-bottom: 10px;
	padding-bottom: 10px;
	max-width: 100%;
	text-transform: uppercase;

	&:hover {
		${RightThumbnail} {
			img {
				transform: scale(1.1);
			}
		}
	}
`;

export const RightTitle = styled.div`
	position: absolute;
	bottom: 40px;
	font-size: 20px;
	font-weight: 800;
	margin-left: 10px;
	color: white;

	span {
		display: inline;
		box-sizing: border-box;
		-webkit-box-decoration-break: clone;
		background: rgba(var(--color-secondary), 1);
		padding: 2px 10px;
	}

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		font-size: 18px;
	}
`;

export const RightSource = styled.div`
	position: absolute;
	display: flex;
	justify-content: center;
	bottom: 16px;
	margin-left: 10px;
	background: rgba(0, 0, 0, 0.6);
	color: white;
	font-size: 12px;
	padding: 2px 4px;

	img {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		margin-right: 6px;
	}
	span {
		margin-left: 4px;
		font-weight: 800;
	}
`;
