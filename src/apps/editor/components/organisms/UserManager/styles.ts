import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 0 20px 20px 20px;
`;

export const InfoWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 7.5px;
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
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
	margin: 10px 0 0 0;
`;
