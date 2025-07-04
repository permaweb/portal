import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const Label = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}
`;

export const Options = styled.div`
	display: flex;
	align-items: center;
	gap: 2.5px;
	padding: 2.5px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: 50px;

	button {
		min-width: 60px;
		border: none !important;
		
		span {
			font-size: ${(props) => props.theme.typography.size.xxxxSmall} !important;
		}
	}
`;