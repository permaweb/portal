import styled from 'styled-components';
import { fadeIn1, open, openRight } from 'engine/constants/animations';

export const Wrapper = styled.div`
	min-height: 100vh;
	height: 100%;
	width: 100%;
	position: fixed;
	z-index: 15;
	top: 0;
	left: 0;
	backdrop-filter: blur(5px);
	animation: ${open} ${fadeIn1};
`;

export const Container = styled.div<{
	$noHeader: boolean;
	width?: number;
}>`
	// height: calc(100dvh - 20px);
	
	min-width: ${(props) => (props.width ? `${props.width.toString()}px` : '425px')};
	width: fit-content;
	max-width: calc(100vw - 30px);
	position: fixed;
	overflow: hidden;
	top: 10px;
	right: 10px;
	transition: width 50ms ease-out;
	animation: ${openRight} 200ms;
	background: var(--color-post-background);
	border-radius: var(--border-radius);
`;

export const Header = styled.div`
	height: 65px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
`;

export const LT = styled.div`
	max-width: 75%;
	display: flex;
	align-items: center;
`;

export const Title = styled.h2`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: 2.5px 0 0 0;
`;

export const Close = styled.div`
	position: absolute;
	top:10px;
	right:10px;
	padding: 2px 0 0 0;
`;

export const Body = styled.div`
	height: calc(100% - 65px);
	width: 100%;
	overflow-y: auto;
	scrollbar-color: transparent transparent;
	position: relative;
`;
