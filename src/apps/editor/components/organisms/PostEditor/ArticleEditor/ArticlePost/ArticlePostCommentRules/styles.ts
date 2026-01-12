import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const RuleItem = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const RuleLabel = styled.label`
	color: ${(props) => props.theme.colors.font.alt2};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const InputGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	span {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;

export const NumberInput = styled.input`
	width: 80px;
	height: 32px;
	padding: 0 10px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
	background: ${(props) => props.theme.colors.form.background};
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.border.alt1};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const TagsWrapper = styled.div`
	width: 100%;
	min-height: 40px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
	padding: 8px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;
	background: ${(props) => props.theme.colors.form.background};
`;

export const Tag = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px;
	background: ${(props) => props.theme.colors.container.alt6.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 4px;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}
`;

export const RemoveButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	border: none;
	background: transparent;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	transition: color 100ms;

	&:hover {
		color: ${(props) => props.theme.colors.font.primary};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const Input = styled.input`
	flex: 1;
	min-width: 150px;
	border: none;
	background: transparent;
	color: ${(props) => props.theme.colors.font.primary};
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-family: ${(props) => props.theme.typography.family.primary};

	&::placeholder {
		color: ${(props) => props.theme.colors.font.alt2};
	}

	&:focus {
		outline: none;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 15px;
`;
