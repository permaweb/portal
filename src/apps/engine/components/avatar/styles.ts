import styled from 'styled-components';

export const Avatar = styled.div<{ $size: number; $bgColor: string; $iconColor: string; $hoverable: boolean }>`
	flex-shrink: 0;
	width: ${(props) => props.$size}px;
	height: ${(props) => props.$size}px;
	background: rgba(${(props) => props.$bgColor}, var(--avatar-opacity, 1));
	border-radius: 50%;
	position: relative;
	overflow: hidden;

	img {
		width: ${(props) => props.$size}px;
		height: ${(props) => props.$size}px;
		border-radius: 50%;
	}

	svg {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: ${(props) => props.$size * 0.8}px;
		height: ${(props) => props.$size * 0.8}px;
		color: rgba(${(props) => props.$iconColor}, 1);
	}
`;
