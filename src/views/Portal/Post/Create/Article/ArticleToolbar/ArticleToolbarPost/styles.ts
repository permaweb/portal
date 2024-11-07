import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Section = styled.div``;

export const SectionHeader = styled.div`
	width: 100%;
	margin: 0 0 0 0;
	padding: 0 10px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionBody = styled.div`
	padding: 0 10px;
`;

export const TopicsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin: -10px 0 0 0;
	padding: 0 0 5px 0;
`;

export const TopicsAction = styled.div`
	position: relative;

	button {
		position: absolute;
		top: 26.5px;
		right: 10px;
		z-index: 1;
	}
`;

export const TopicsBody = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
`;
