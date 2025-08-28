import styled from 'styled-components';

export const GridItem = styled.div<{ $width?: number; $height: any }>`
	flex: ${(props) => (props.$width ? props.$width : 1)};
	min-height: 100px;
	min-width: 400px;
	max-width: 100%;

	iframe {
		width: 100%;
		aspect-ratio: ${(props) => (!props.$height ? `16/9` : `unset`)};
		height: ${(props) => (props.$height ? props.$height : `unset`)};
		border: none;
		border-radius: var(--border-radius);
	}

	img {
		width: 100%;
		border-radius: var(--border-radius);
	}
`;
