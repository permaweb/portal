import styled from 'styled-components';

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const ModalSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2.5px;

	p {
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}
`;

export const ModalSectionTitle = styled.div`
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
`;

export const ModalSectionContent = styled.div`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
`;

export const ModalYearSelector = styled.div`
	display: flex;
	gap: 12.5px;
	align-items: center;
	margin: 7.5px 0 0 0;

	button {
		flex: 1;
	}
`;

export const ModalCostSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 7.5px;

	> div {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
`;

export const ModalCostGrid = styled.div`
	display: grid;
	grid-template-columns: 140px 1fr;
	row-gap: 10px;
	column-gap: 16px;
	align-items: center;
`;

export const ModalCostLabel = styled.div`
	color: ${(props) => props.theme.colors.font.alt1};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
`;

export const ModalCostValue = styled.div`
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
`;

export const ModalActions = styled.div`
	display: flex;
	gap: 15px;
	margin: 15px 0 0 0;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
`;
