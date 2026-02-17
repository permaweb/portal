import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding-bottom: 2.5px;
`;

export const RuleItem = styled.div`
	width: 100%;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20px;
`;

export const RuleLabel = styled.label`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const MutedWordsLabel = styled(RuleLabel)`
	margin-bottom: 8px;
	display: block;
`;

export const RuleDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt2};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	margin: -3.5px 0 0 0;
`;

export const InputGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}
`;

export const TagsWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const InputWrapper = styled.div`
	position: relative;
	width: 100%;
`;

export const AddButton = styled.div`
	position: absolute;
	top: 34.5px;
	right: 10px;
`;

export const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 7.5px;
	margin: 1.5px 0 0 0;
`;

export const Tag = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 2px 8px;
	background: ${(props) => props.theme.colors.container.alt2.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 12px;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
	}
`;

export const SectionDivider = styled.hr`
	width: 100%;
	border: none;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
	margin: 0;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ActionWrapper = styled.div`
	margin: 0;
`;

export const WrapperEmpty = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
