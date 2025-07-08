import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	padding: 0 0 20px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.alt4};	
`;

export const SubheaderWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 25px;
	margin: 30px 0 0 0;

	a {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};

		&:hover {
			color: ${(props) => props.theme.colors.link.color};
		}
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	margin: 20px 0 0 0;
`;