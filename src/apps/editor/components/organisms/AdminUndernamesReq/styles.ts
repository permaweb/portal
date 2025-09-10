import styled from 'styled-components';

export const Card = styled.div`
	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 12px;
	padding: 16px;
`;

export const Title = styled.h3`
	margin: 0 0 12px;
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.large};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const Table = styled.div`
	width: 100%;
`;
export const Thead = styled.div`
	display: contents;
`;
export const Tbody = styled.div`
	display: contents;
`;
export const Tr = styled.div`
	display: grid;
	grid-template-columns: 0.4fr 1fr 1.4fr 0.8fr 1fr 1fr 1fr;
	gap: 8px;
	padding: 10px 0;
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};
	&[data-busy='1'] {
		opacity: 0.7;
		pointer-events: none;
	}
`;
export const Th = styled.div`
	font-weight: 600;
	color: ${(p) => p.theme.colors.font.primary};
`;
export const Td = styled.div`
	color: ${(p) => p.theme.colors.font.primary};
`;
export const Code = styled.code`
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;
export const ActionRow = styled.div`
	display: inline-flex;
	gap: 8px;
`;
export const PrimaryButton = styled.button`
	padding: 6px 10px;
	border-radius: 999px;
	cursor: pointer;
	background: ${(p) => p.theme.colors.button.primary.background};
	color: ${(p) => p.theme.colors.button.primary.color};
	border: 1px solid ${(p) => p.theme.colors.button.primary.border};
	&:hover:not(:disabled) {
		background: ${(p) => p.theme.colors.button.primary.active.background};
	}
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;
export const DangerButton = styled.button`
	padding: 6px 10px;
	border-radius: 999px;
	cursor: pointer;
	background: ${(p) => p.theme.colors.negative1};
	border: 1px solid ${(p) => p.theme.colors.negative1};
	color: ${(p) => p.theme.colors.container.primary.background};
`;
export const Note = styled.span`
	color: ${(p) => p.theme.colors.font.secondary};
`;
export const Muted = styled.span`
	color: ${(p) => p.theme.colors.neutralA3 || p.theme.colors.font.secondary};
`;
export const EmptyRow = styled.div`
	padding: 12px 0;
	color: ${(p) => p.theme.colors.font.secondary};
`;
