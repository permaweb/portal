import styled from 'styled-components';

export const Wrapper = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	p {
		color: ${(props) => (props.disabled ? props.theme.colors.font.alt2 : props.theme.colors.link.color)};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-decoration: ${(props) => (props.disabled ? 'none' : 'underline')};
		text-decoration-thickness: 1.25px;

		&:hover {
			cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
			color: ${(props) => (props.disabled ? props.theme.colors.font.alt2 : props.theme.colors.link.active)};
		}
	}
`;

export const Details = styled.div``;
