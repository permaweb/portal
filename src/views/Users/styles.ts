import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	gap: 25px;
	margin-bottom: 25px;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;
