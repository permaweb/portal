import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Section = styled.div`
	padding: 12.5px 15px;
`;

export const DividerSection = styled.div`
	height: 1px;
	width: calc(100% - 30px);
	margin: 5px auto;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionBody = styled.div`
	margin: 12.5px 0 0 0;
`;

export const LinksSection = styled(SectionBody)`
	display: flex;
	flex-wrap: wrap;
	gap: 12.5px;
`;

export const LinkWrapper = styled.div`
	a,
	button {
		height: 45px;
		width: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: ${(props) => props.theme.colors.container.primary.background};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		border-radius: 50%;

		svg {
			height: 22.5px;
			width: 22.5px;
			margin: 4.5px 0 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		&:hover {
			background: ${(props) => props.theme.colors.container.primary.active};
			border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
		}
		&:focus {
			background: ${(props) => props.theme.colors.container.primary.active};
			border: 1px solid ${(props) => props.theme.colors.border.alt4} !important;
		}
	}
`;
