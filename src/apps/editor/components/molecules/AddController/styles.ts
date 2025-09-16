import styled from 'styled-components';

export const Card = styled.div`
	background: ${(p) => p.theme.colors.container.primary.background};
	padding: 16px;
	display: grid;
	gap: 12px;
`;

export const Row = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const Input = styled.input`
	flex: 1;
	min-width: 180px;
	padding: 10px 12px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.primary.background};
	color: ${(p) => p.theme.colors.font.primary};
	font-size: ${(p) => p.theme.typography.size.base};
	&:focus-visible {
		outline: 2px solid ${(p) => p.theme.colors.primary1};
	}
`;

export const Error = styled.div`
	color: ${(p) => p.theme.colors.negative1};
	font-size: ${(p) => p.theme.typography.size.small};
`;

export const Helper = styled.div`
	color: ${(p) => p.theme.colors.font.secondary};
	font-size: ${(p) => p.theme.typography.size.xxSmall};
`;
