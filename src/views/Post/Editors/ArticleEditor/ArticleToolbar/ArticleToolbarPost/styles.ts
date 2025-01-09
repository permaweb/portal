import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const Section = styled.div``;

export const SectionHeader = styled.div`
	width: 100%;
	margin: 0 0 -10px 0;
	padding: 0 5px 0 10px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionBody = styled.div`
	padding: 0 5px 0 10px;
`;

export const TopicsSection = styled(Section)`
	padding: 0 0 5px 0;
`;
