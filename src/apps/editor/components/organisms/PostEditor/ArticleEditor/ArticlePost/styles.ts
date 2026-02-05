import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 19.5px;
`;

export const Section = styled.div`
	width: calc(100% - 10px);
	margin: 0 auto;
	padding: 0 0 20px 0;
	border-bottom: 1px dotted ${(props) => props.theme.colors.border.primary};
`;

export const SectionStart = styled.div`
	padding: 7.5px 0 0 0;
	margin: 2.5px 0 0 0;
`;

export const SectionEnd = styled.div``;

export const SectionHeader = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;
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
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const DescriptionSection = styled(Section)`
	padding: 0 0 25px 0;
`;

export const TopicsSection = styled(Section)``;

export const ContributeSection = styled(Section)`
	padding: 0 0 20px 0;
`;
