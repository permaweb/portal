import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 20px;
`;

export const FeaturedWrapper = styled.div`
	width: 1050px;
	padding: 0 20px 0 0;
	border-right: 1px solid ${(props) => props.theme.colors.border.alt1};
`;

export const PanelWrapper = styled.div`
	width: calc(100% - 1090px);
`;

export const PanelHeader = styled.div`
	width: 100%;
	padding: 0px 0 15px 0;
	margin: 0 0 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

	p {
		line-height: 1;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
	}
`;
