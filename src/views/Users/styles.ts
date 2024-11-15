import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
	margin: 20px 0 0 0;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;
