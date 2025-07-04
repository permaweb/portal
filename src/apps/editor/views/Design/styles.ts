import styled from 'styled-components';


export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;
`;

export const SectionWrapper = styled.div`
	height: fit-content;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;
`;

export const Section = styled.div`
	height: fit-content;
	width: 100%;
	padding: 15px;
`;

export const SectionHeader = styled.div`
	margin: 0 0 15px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}
`;