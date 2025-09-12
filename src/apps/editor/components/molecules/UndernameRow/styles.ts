import styled from 'styled-components';
import { STYLING } from 'helpers/config';

export const RowWrapper = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 0.5fr 1fr 1.6fr 0.9fr 1fr 1fr;
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

export const RowHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 12.5px;

	p {
		max-width: 100%;
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}
`;

export const RowDetail = styled.div`
	display: flex;
	gap: 15px;
	align-items: center;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
`;

export const Address = styled.code`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
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
export const Actions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const PanelContent = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 10px 12.5px;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.primary};
		display: flex;
		justify-content: space-between;
	}

	span {
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		text-transform: uppercase;
	}
`;

export const ActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
`;

export const KV = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
	padding-bottom: 8px;
	span {
		color: ${(p) => p.theme.colors.font.alt1};
		font-size: ${(p) => p.theme.typography.size.xSmall};
		font-weight: ${(p) => p.theme.typography.weight.bold};
		text-transform: uppercase;
	}
	p,
	code {
		color: ${(p) => p.theme.colors.font.primary};
		font-size: ${(p) => p.theme.typography.size.xxSmall};
	}
`;

export const Sections = styled.div`
	display: grid;
	gap: 16px;
	margin-top: 8px;
`;

export const Section = styled.div`
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.primary.background};
	overflow: hidden;
`;

export const SectionHeader = styled.div`
	padding: 10px 12px;
	background: ${(p) => p.theme.colors.container.alt1.background};
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	font-size: ${(p) => p.theme.typography.size.small};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const SectionBody = styled.div`
	padding: 12px;
	display: grid;
	gap: 10px;
`;

export const SectionFooter = styled.div`
	padding: 10px 12px;
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};
`;

export const Placeholder = styled.div`
	padding: 12px;
	border: 1px dashed ${(p) => p.theme.colors.border.primary};
	border-radius: ;
	color: ${(p) => p.theme.colors.font.secondary};
	font-size: ${(p) => p.theme.typography.size.small};
`;

export const TextArea = styled.textarea`
	width: 100%;
	resize: vertical;
	min-height: 96px;
	padding: 10px 12px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	background: ${(p) => p.theme.colors.container.primary.background};
	color: ${(p) => p.theme.colors.font.primary};
	font-size: ${(p) => p.theme.typography.size.base};
	font-family: ${(p) => p.theme.typography.family.primary};
	&:focus-visible {
		outline: 2px solid ${(p) => p.theme.colors.primary1};
	}
`;
