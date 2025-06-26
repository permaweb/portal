import styled from 'styled-components';

export const Wrapper = styled.div`
	height: 500px;
	width: 100%;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const Content = styled.div`
	height: 100%;
	width: 100%;
	border: 1px solid red;
`;