import styled from 'styled-components';

export const Search = styled.div<{ $active: boolean }>`
	position: relative;
	margin-left: auto;
	width: ${(props) => (props.$active ? '200px' : '22px')};
	transition: width 0.2s;

	svg {
		position: absolute;
		height: 14px;
		padding: 3px;
		margin-top: 0.5px;
		margin-left: 0.5px;
		color: black;
		stroke-width: 3;
		&:hover {
			cursor: pointer;
		}
	}
	input {
		border: 1px solid rgba(var(--color-text), 1);
		background: white;
		color: black;
		height: 22px;
		width: 100%;
		padding-left: ${(props) => (props.$active ? `24px` : 0)};
		border-radius: ${(props) => (props.$active ? 0 : '16px')};
		transition: padding 0.2s, border-radius 0.2s;
		box-sizing: border-box;

		&:focus {
			outline: none;
		}
	}
`;

export const SearchResults = styled.div<{ $active: boolean }>`
	position: absolute;
	display: ${(props) => (props.$active ? 'visible' : 'none')};
	width: 100%;
	padding: 4px;
	box-sizing: border-box;
`;
