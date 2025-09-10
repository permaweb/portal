import styled from 'styled-components';
import { STYLING } from 'helpers/config';

export const Row = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 0.5fr 1fr 1.6fr 0.9fr 1fr 1fr; /* 6 columns */
	gap: 8px;
	align-items: center;
	padding: 12.5px 15px;
	cursor: pointer;
	background: ${(p) => p.theme.colors.view.background};

	&:hover {
		background: ${(p) => p.theme.colors.container.alt2.background};
	}
	&[data-busy='1'] {
		opacity: 0.6;
		pointer-events: none;
	}
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};
`;

export const Cell = styled.div<{ mono?: boolean }>`
	font-family: ${(p) =>
		p.mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	color: ${(p) => p.theme.colors.font.primary};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const StatusCell = styled(Cell)`
	text-transform: capitalize;
	&[data-status='approved'] {
		color: ${(p) => p.theme.colors.positive1};
	}
	&[data-status='pending'] {
		color: ${(p) => p.theme.colors.caution1};
	}
	&[data-status='rejected'] {
		color: ${(p) => p.theme.colors.negative1};
	}
	&[data-status='cancelled'] {
		color: ${(p) => p.theme.colors.neutralA3 || p.theme.colors.font.secondary};
	}
`;

/* Panel */
export const PanelContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 10px 12.5px;
`;
export const KV = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	span {
		color: ${(p) => p.theme.colors.font.alt1};
		font-size: ${(p) => p.theme.typography.size.xxSmall};
		font-weight: ${(p) => p.theme.typography.weight.bold};
		text-transform: uppercase;
	}
	p,
	code {
		color: ${(p) => p.theme.colors.font.primary};
		font-size: ${(p) => p.theme.typography.size.small};
	}
`;
export const StatusPill = styled.span`
	padding: 3px 8px;
	border-radius: 999px;
	text-transform: capitalize;
	font-size: ${(p) => p.theme.typography.size.xxSmall};
	background: ${(p) => p.theme.colors.neutral2};
	color: ${(p) => p.theme.colors.font.primary};
	&[data-status='approved'] {
		background: ${(p) => p.theme.colors.positive1};
		color: ${(p) => p.theme.colors.container.primary.background};
	}
	&[data-status='pending'] {
		background: ${(p) => p.theme.colors.caution1};
	}
	&[data-status='rejected'] {
		background: ${(p) => p.theme.colors.negative1};
		color: ${(p) => p.theme.colors.container.primary.background};
	}
	&[data-status='cancelled'] {
		background: ${(p) => p.theme.colors.neutral2};
	}
`;
export const ReasonNote = styled.div`
	color: ${(p) => p.theme.colors.font.secondary};
	font-size: ${(p) => p.theme.typography.size.xxSmall};
`;

export const ActionsBar = styled.div`
	margin-top: 8px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
`;
export const Reason = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	input {
		min-width: 160px;
		padding: 8px 10px;
		border: 1px solid ${(p) => p.theme.colors.border.primary};
		border-radius: ${(p) => p.theme.dimensions?.radius?.primary || '8px'};
		background: ${(p) => p.theme.colors.container.primary.background};
		color: ${(p) => p.theme.colors.font.primary};
		font-size: ${(p) => p.theme.typography.size.small};
		&:focus-visible {
			outline: 2px solid ${(p) => p.theme.colors.primary1};
		}
	}
`;
export const Primary = styled.button`
	padding: 8px 12px;
	border-radius: 999px;
	cursor: pointer;
	background: ${(p) => p.theme.colors.button.primary.background};
	color: ${(p) => p.theme.colors.button.primary.color};
	border: 1px solid ${(p) => p.theme.colors.button.primary.border};
	&:hover {
		background: ${(p) => p.theme.colors.button.primary.active.background};
	}
`;
export const Danger = styled.button`
	padding: 8px 12px;
	border-radius: 999px;
	cursor: pointer;
	background: ${(p) => p.theme.colors.negative1};
	color: ${(p) => p.theme.colors.container.primary.background};
	border: 1px solid ${(p) => p.theme.colors.negative1};
`;
export const MutedNote = styled.div`
	color: ${(p) => p.theme.colors.font.secondary};
	font-size: ${(p) => p.theme.typography.size.small};
`;
