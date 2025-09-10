import styled from 'styled-components';

export const Wrapper = styled.div`
	display: grid;
	gap: 16px;
`;

export const Card = styled.div`
	background: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 12px;
	padding: 16px;
`;

export const Title = styled.h3`
	margin: 0 0 12px;
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const SubTitle = styled.h3`
	margin: 0 0 12px;
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.medium};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const Row = styled.div`
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 8px;
	align-items: center;
`;

export const Input = styled.input`
	padding: 10px 12px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	background: ${(p) => p.theme.colors.container.primary.background};
	color: ${(p) => p.theme.colors.font.primary};
	border-radius: ${(p) => p.theme.dimensions?.radius?.primary || '12px'};
	&:focus-visible {
		outline: 2px solid ${(p) => p.theme.colors.primary1};
	}
`;

export const PrimaryButton = styled.button`
	padding: 10px 16px;
	border-radius: ${(p) => p.theme.dimensions?.radius?.primary || '12px'};
	border: 1px solid ${(p) => p.theme.colors.button.primary.border};
	background: ${(p) => p.theme.colors.button.primary.background};
	color: ${(p) => p.theme.colors.button.primary.color};
	cursor: pointer;
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
	border: 1px solid ${(p) => p.theme.colors.negative1};
	background: ${(p) => p.theme.colors.negative1};
	color: ${(p) => p.theme.colors.container.primary.background};
	cursor: pointer;
`;

export const Error = styled.div`
	margin-top: 8px;
	color: ${(p) => p.theme.colors.negative1};
	font-size: ${(p) => p.theme.typography.size.small};
`;

export const Helper = styled.div`
	margin-top: 6px;
	color: ${(p) => p.theme.colors.font.secondary};
	font-size: ${(p) => p.theme.typography.size.small};
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
	grid-template-columns: 1.2fr 0.8fr 1fr 1fr 0.8fr;
	gap: 8px;
	padding: 10px 0;
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};
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
