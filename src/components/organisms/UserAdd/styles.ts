import styled from 'styled-components';

export const FormWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
	padding: 25px;
	align-items: baseline;
	// border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;

export const Left = styled.div`
	width: 50%;
`;

export const Right = styled.div`
	width: 50%;
`;
