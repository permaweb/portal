import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

export const Section = styled.div``;

export const SectionHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;
	padding: 0 5px 0 10px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const SectionHeaderInput = styled(SectionHeader)`
	margin: 0 0 12.5px 0;
`;

export const SectionBody = styled.div`
	padding: 0 5px 0 10px;
`;

export const TopicsSection = styled(Section)``;

export const ContributeSection = styled(Section)`
	padding: 0 0 10px 0;
`;
