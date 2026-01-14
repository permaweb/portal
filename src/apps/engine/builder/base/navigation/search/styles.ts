import styled from 'styled-components';

export const Search = styled.div<{ $active: boolean; $expanded?: boolean }>`
	position: relative;
	width: ${(props) => (props.$expanded ? 'auto' : props.$active ? '200px' : '22px')};
	margin: ${(props) => (props.$expanded ? '0 var(--spacing-xxxs)' : '0 0 0 auto')};
	transition: width 0.2s;

	svg {
		position: absolute;
		height: 14px;
		padding: 3px;
		margin-top: 0.5px;
		margin-left: 0.5px;
		color: rgba(var(--color-text-contrast), 1);
		stroke-width: 3;
		z-index: 1;
		&:hover {
			cursor: pointer;
		}
	}
	input {
		border: 1px solid rgba(var(--color-text), 1);
		color: rgba(var(--color-text), 1);
		background: rgba(var(--color-background), 1);
		filter: invert(1);
		height: 22px;
		width: 100%;
		padding-left: ${(props) => (props.$active || props.$expanded ? `24px` : 0)};
		border-radius: ${(props) => (props.$expanded ? 'var(--border-radius)' : props.$active ? 0 : '16px')};
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
