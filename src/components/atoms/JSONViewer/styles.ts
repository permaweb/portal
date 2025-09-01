import styled from 'styled-components';

export const Header = styled.div`
	padding: 6px 0 8px 0;
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
`;

export const Title = styled.div`
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const Body = styled.div`
	padding-top: 12px;
`;

export const ArrayItem = styled.div<{ first?: boolean }>`
	margin-top: 4px;
	padding-top: 4px;
	border-top: ${(p) => (p.first ? 'none' : `1px solid ${p.theme.colors.border.primary}`)};
`;

export const Container = styled.div`
	width: 100%;
	padding: 10px 12px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.alt2.background};

	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	line-height: 1.4;
	color: ${(p) => p.theme.colors.font.primary};
`;

export const Row = styled.div`
	margin: 4px 0;
`;

export const Key = styled.span`
	font-weight: ${(p) => p.theme.typography.weight.bold};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const Value = styled.span`
	color: ${(p) => p.theme.colors.font.alt1};
`;

export const Toggle = styled.button`
	margin-left: 6px;
	border: none;
	background: transparent;
	color: ${(p) => p.theme.colors.link.color};
	cursor: pointer;
	font-size: ${(p) => p.theme.typography.size.xxSmall};

	&:hover {
		color: ${(p) => p.theme.colors.link.active};
		text-decoration: underline;
	}
	&:focus-visible {
		outline: 1px dotted ${(p) => p.theme.colors.border.primary};
		outline-offset: 2px;
	}
`;
