import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 8.5px;

	> span,
	> p {
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		color: ${(props) => props.theme.colors.font.alt1};
		white-space: nowrap;
	}

	> a,
	> a p,
	> a svg {
		color: ${(props) => props.theme.colors.font.alt1};
	}

	> a:hover,
	> a:hover p,
	> a:hover svg {
		color: ${(props) => props.theme.colors.font.primary};
	}
`;
