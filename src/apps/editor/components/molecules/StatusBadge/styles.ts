import styled from 'styled-components';

export const Badge = styled.span`
	display: inline-flex;
	align-items: center;
	padding: 4px 8px;
	border-radius: 999px;
	font-size: ${(p) => p.theme.typography.size.small};
	font-family: ${(p) => p.theme.typography.family.primary};
	background: ${(p) => p.theme.colors.neutral2};
	color: ${(p) => p.theme.colors.font.primary};

	&[data-tone='success'] {
		background: ${(p) => p.theme.colors.positive1};
	}
	&[data-tone='warning'] {
		background: ${(p) => p.theme.colors.caution1};
	}
	&[data-tone='danger'] {
		background: ${(p) => p.theme.colors.negative1};
	}
	&[data-tone='neutral'] {
		background: ${(p) => p.theme.colors.neutral2};
	}
`;
