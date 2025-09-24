import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	margin: 0 auto;
`;

export const SubdomainsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 25px;
	overflow: hidden;
	border: 1px solid ${(props) => props.theme.colors.border.primary} !important;
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 15px 0 0 auto;
	padding: 2.5px 10px 2.5px 10px;
	display: flex;
	justify-content: center;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}
`;
