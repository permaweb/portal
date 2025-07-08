import styled from 'styled-components';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 30px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const Preview = styled.div<{ fontFamily?: string }>`
	padding: 0 0 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.alt1};
	p {
		font-family: ${(props) => (props.fontFamily ? props.fontFamily : props.theme.typography.family.primary)};
		font-size: ${(props) => props.theme.typography.size.xLg};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const SAction = styled.div`
	width: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	position: relative;
`;
