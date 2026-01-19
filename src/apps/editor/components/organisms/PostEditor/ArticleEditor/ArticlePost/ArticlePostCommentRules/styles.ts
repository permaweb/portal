import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 0 10px 0;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding-bottom: 15px;
`;

export const RuleItem = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
`;

export const RuleLabel = styled.label`
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const RuleDescription = styled.p`
	color: ${(props) => props.theme.colors.font.alt2};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	margin-top: -8px;
	margin-bottom: 4px;
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

export const NumberInput = styled.input`
	width: 60px;
	height: 32px;
	padding: 0 8px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
	background: ${(props) => props.theme.colors.form.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	text-align: center;

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.border.alt1};
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

export const AddButton = styled.button`
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	background: ${(props) => props.theme.colors.button.primary.background};
	color: ${(props) => props.theme.colors.button.primary.color};
	border: 1px solid ${(props) => props.theme.colors.button.primary.border};
	border-radius: 20px;
	padding: 4px 12px;
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-transform: uppercase;
	cursor: pointer;
	transition: all 0.2s;

	&:hover:not(:disabled) {
		background: ${(props) => props.theme.colors.button.primary.active.background};
		border-color: ${(props) => props.theme.colors.button.primary.active.border};
		color: ${(props) => props.theme.colors.button.primary.active.color};
	}

	&:disabled {
		background: ${(props) => props.theme.colors.button.primary.disabled.background};
		border-color: ${(props) => props.theme.colors.button.primary.disabled.border};
		color: ${(props) => props.theme.colors.button.primary.disabled.color};
		cursor: not-allowed;
	}
`;

export const TagsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	padding: 8px;
	min-height: 36px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
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

export const RemoveButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 14px;
	height: 14px;
	border: none;
	background: transparent;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: 12px;
	cursor: pointer;

	&:hover {
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const Input = styled.input`
	width: 100%;
	height: 36px;
	padding: 0 70px 0 12px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
	background: ${(props) => props.theme.colors.form.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};

	&::placeholder {
		color: ${(props) => props.theme.colors.font.alt2};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.border.alt1};
	}
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ActionWrapper = styled.div`
	margin: 0;
	padding: 15px 0 17.5px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
`;
