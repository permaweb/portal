import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 0 20px 20px 20px;

	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const InfoWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 7.5px;
	padding: 10px 12.5px;
	margin: 10px 0 0 0;

	p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
	}

	span {
		display: block;
		padding: 0 0 7.5px 0;
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.primary};
		text-transform: uppercase;
	}
`;

export const ActionsWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin: 10px 0 0 0;
`;

export const TransferHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
	padding: 6px 0;
`;

export const TransferTitle = styled.h4`
	margin: 0;
	padding: 0;
	font-size: ${(p) => p.theme.typography.size.xSmall};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-weight: ${(p) => p.theme.typography.weight.xBold};
	color: ${(p) => p.theme.colors.font.primary};
`;

export const TableViewport = styled.div`
	width: 100%;
	margin-top: 8px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 10px;
	background: ${(p) => p.theme.colors.container.alt1.background};
`;

export const TransferTable = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

export const TableHead = styled.thead`
	background: ${(p) => p.theme.colors.container.alt1};
`;

export const TableHeaderCell = styled.th`
	text-align: left;
	padding: 10px 12px;
	font-size: ${(p) => p.theme.typography.size.xxSmall};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	color: ${(p) => p.theme.colors.font.alt1};
	border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
	text-transform: uppercase;
	white-space: nowrap;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};

	&:hover {
		background: ${(p) => p.theme.colors.row.hover};
	}
`;

export const TableCell = styled.td`
	padding: 10px 12px;
	font-size: ${(p) => p.theme.typography.size.xSmall};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-weight: ${(p) => p.theme.typography.weight.medium};
	color: ${(p) => p.theme.colors.font.primary};
	vertical-align: middle;
	word-break: break-all;
`;

export const StateBadge = styled.span<{ $state?: string }>`
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: ${(p) => p.theme.typography.size.xxxSmall};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	text-transform: capitalize;
	background: ${(p) => {
		switch (p.$state) {
			case 'pending':
				return p.theme.colors.indicator.neutral;
			case 'accepted':
				return p.theme.colors.indicator.base;
			case 'rejected':
				return p.theme.colors.warning.primary;
			case 'cancelled':
				return p.theme.colors.warning.primary;
			default:
				return p.theme.colors.container.alt3;
		}
	}};
	color: ${(p) => p.theme.colors.contrast};
`;

export const ActionsCell = styled(TableCell)`
	white-space: nowrap;
`;
