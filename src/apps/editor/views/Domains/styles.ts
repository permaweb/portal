import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	margin: 0 auto;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const DomainsWrapper = styled.div`
	h6 {
		font-size: ${(props) => props.theme.typography.size.xxLg} !important;
		margin: 0 0 15px 0;
	}
`;

export const DomainsArNS = styled.div`
	overflow: hidden;
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
