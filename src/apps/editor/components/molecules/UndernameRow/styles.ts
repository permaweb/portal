import styled from 'styled-components';
import { STYLING } from 'helpers/config';

export const RowWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	padding: 15px;
	transition: all 100ms;

	&:hover {
		cursor: pointer;
		background: ${(props) => props.theme.colors.container.alt2.background};
	}

	background: ${(props) => props.theme.colors.view.background};

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
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
