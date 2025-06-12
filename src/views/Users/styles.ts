import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	padding: 0.5px 10px 2.5px 10px;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}
`;
