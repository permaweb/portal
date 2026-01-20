import { fadeIn1, open, openRight } from 'engine/constants/animations';
import { BREAKPOINTS } from 'engine/constants/breakpoints';
import styled from 'styled-components';

export const Wrapper = styled.div<{ $transparent?: boolean }>`
	min-height: 100vh;
	height: 100%;
	width: 100%;
	position: fixed;
	z-index: ${(props) => (props.$transparent ? 100 : 15)};
	top: 0;
	left: 0;
	backdrop-filter: ${(props) => (props.$transparent ? 'none' : 'blur(5px)')};
	pointer-events: ${(props) => (props.$transparent ? 'none' : 'auto')};
	animation: ${open} ${fadeIn1};
	transition: backdrop-filter 0.3s ease;
`;

export const Container = styled.div<{
	$noHeader: boolean;
	width?: number;
	$transparent?: boolean;
}>`
	min-width: ${(props) => (props.width ? `${props.width.toString()}px` : '425px')};
	width: fit-content;
	max-width: calc(100vw - 30px);
	position: fixed;
	top: 10px;
	right: 10px;
	z-index: 100;
	transition: width 50ms ease-out;
	animation: ${openRight} 200ms;
	background: var(--color-card-background);
	border-radius: var(--border-radius);
	border: 1px solid var(--color-card-border);
	box-shadow: var(--preference-card-shadow);
	pointer-events: auto;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		top: var(--spacing-xxs);
		right: var(--spacing-xxs);
		min-width: unset;
		width: 300px;
		max-width: calc(100vw - var(--spacing-l));
		max-height: calc(100vh - var(--spacing-xxs) * 2);
		overflow-x: hidden;
		overflow-y: auto;
	}
`;

export const Header = styled.div`
	height: 65px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;

	@media (max-width: ${BREAKPOINTS['breakpoint-small']}) {
		padding: 0 var(--spacing-xs);
	}
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
	color: rgba(var(--color-text), 1);
`;

export const Close = styled.div`
	position: absolute;
	top: 10px;
	right: 10px;
	padding: 2px 0 0 0;
`;

export const Body = styled.div`
	height: calc(100% - 65px);
	width: 100%;
	overflow-y: auto;
	scrollbar-color: transparent transparent;
	position: relative;
`;
