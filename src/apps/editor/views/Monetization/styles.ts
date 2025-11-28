import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export const HeaderRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
`;

export const Title = styled.h4`
	margin: 0;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.h6};
	font-weight: ${(props) => props.theme.typography.weight.semibold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const Summary = styled.div`
	display: flex;
	align-items: baseline;
	gap: 6px;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.alt1};

	strong {
		font-weight: ${(props) => props.theme.typography.weight.semibold};
		color: ${(props) => props.theme.colors.status.positive};
	}
`;

export const Section = styled.section`
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	padding: 16px 20px;
	display: flex;
	flex-direction: column;
	gap: 16px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 12px 14px;
	}
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;

	span {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.semibold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const ConfigGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
	margin-bottom: 8px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		grid-template-columns: 1fr;
	}
`;

export const ConfigItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;

	label {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt2};
	}

	span {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		color: ${(props) => props.theme.colors.font.primary};
		word-break: break-all;
	}
`;

export const Badge = styled.span<{ active?: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	align-self: flex-start;
	padding: 2px 8px;
	border-radius: ${STYLING.dimensions.radius.alt1};

	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.semibold};

	background: ${(props) =>
		props.active ? props.theme.colors.status.positiveBackground : props.theme.colors.status.neutralBackground};
	color: ${(props) => (props.active ? props.theme.colors.status.positive : props.theme.colors.font.alt1)};
`;

export const ConfigForm = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 8px;

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.field-label {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		color: ${(props) => props.theme.colors.font.primary};
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}
`;

export const Info = styled.div`
	padding: 8px 10px;
	border-radius: ${STYLING.dimensions.radius.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};

	&.warning {
		background: ${(props) => props.theme.colors.status.warningBackground};
		color: ${(props) => props.theme.colors.status.warning};
	}

	&.info {
		background: ${(props) => props.theme.colors.container.alt2.background};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const TableWrapper = styled.div`
	margin-top: 8px;
	max-height: 320px;
	overflow: auto;
	border-radius: ${STYLING.dimensions.radius.alt1};
	border: 1px solid ${(props) => props.theme.colors.border.alt1};
`;

export const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};

	thead {
		background: ${(props) => props.theme.colors.container.alt2.background};
		position: sticky;
		top: 0;
		z-index: 1;
	}

	th,
	td {
		padding: 8px 10px;
		text-align: left;
		border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};
	}

	th {
		font-weight: ${(props) => props.theme.typography.weight.semibold};
		color: ${(props) => props.theme.colors.font.alt1};
		white-space: nowrap;
	}

	td {
		color: ${(props) => props.theme.colors.font.primary};
		vertical-align: middle;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	tbody tr:hover {
		background: ${(props) => props.theme.colors.row.hover};
	}

	a {
		color: ${(props) => props.theme.colors.link.primary};
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}
`;
