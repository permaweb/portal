import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 25px;
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
	padding: 5px 15px;
	border-radius: ${STYLING.dimensions.radius.primary} !important;
	background: ${(props) => props.theme.colors.container.alt11.background};

	p {
		color: ${(props) => props.theme.colors.font.light2};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}

	b {
		color: ${(props) => props.theme.colors.font.light1};
		font-weight: ${(props) => props.theme.typography.weight.xBold} !important;
	}
`;

export const Section = styled.section`
	display: flex;
	flex-direction: column;
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;

	h6 {
		font-size: ${(props) => props.theme.typography.size.xxLg} !important;
		color: ${(props) => props.theme.colors.font.alt1};
		margin: 0 0 15px 0;
	}

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
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
	gap: 15px;

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.field-label {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}
`;

export const Forms = styled.div`
	display: flex;
	align-items: center;
	gap: 25px;
	justify-content: space-between;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const ConfigToggle = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const TokenGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 12px;
	border: 1px solid ${(props) => props.theme.colors.border.alt1};
	border-radius: ${STYLING.dimensions.radius.alt1};
	background: ${(props) => props.theme.colors.container.alt1.background};

	.token-group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.token-group-body {
		display: flex;
		align-items: flex-end;
		gap: 10px;
	}

	.token-recipient-field {
		flex: 1 1 52%;
	}

	.token-select-field {
		flex: 1 1 38%;
	}

	.token-received {
		color: ${(props) => props.theme.colors.font.alt2};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-transform: uppercase;
		white-space: nowrap;
	}

	.token-recipient-toggle {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 6px;
		border-top: 1px dashed ${(props) => props.theme.colors.border.alt1};
	}

	.token-checkbox-line {
		display: flex;
		align-items: center;
		gap: 8px;

		span {
			color: ${(props) => props.theme.colors.font.alt1};
			font-size: ${(props) => props.theme.typography.size.xxSmall};
			font-weight: ${(props) => props.theme.typography.weight.bold};
			font-family: ${(props) => props.theme.typography.family.primary};
			text-transform: uppercase;
		}
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		.token-group-body {
			flex-direction: column;
			align-items: stretch;
		}

		.token-recipient-field,
		.token-select-field {
			flex: 1 1 auto;
		}

		.token-group-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
`;

export const Info = styled.div`
	width: fit-content;
	padding: 5px 10px 7.5px 10px;

	span {
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}

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
		background: ${(props) => props.theme.colors.container.alt1.background};
		position: sticky;
		top: 0;
		z-index: 1;
	}

	th,
	td {
		padding: 12.5px 15px;
		text-align: left;
		border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};

		&:nth-child(2),
		&:nth-child(3),
		&:nth-child(4),
		&:nth-child(5) {
			text-align: right;
		}
	}

	td {
		padding: 12.5px 15px;
	}

	th {
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall};
		text-transform: uppercase;
		white-space: nowrap;
	}

	td {
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		vertical-align: middle;

		&:nth-child(2),
		&:nth-child(3),
		&:nth-child(4),
		&:nth-child(5) {
			> * {
				text-align: right;
				justify-content: flex-end;
			}
		}
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

export const WrapperEmpty = styled.div`
	padding: 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;

export const SetupBanner = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 20px;
	background: ${(props) => props.theme.colors.container.alt3.background};
	border: 1px solid ${(props) => props.theme.colors.border.alt1};
	border-radius: ${STYLING.dimensions.radius.primary};

	h6 {
		margin: 0;
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.primary};
	}

	p {
		margin: 0;
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.alt1};
		line-height: 1.5;
	}
`;

export const SetupBannerActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
`;
