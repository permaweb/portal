import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const Section = styled.div`
	padding: 7.5px 15px;
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
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const SectionBody = styled.div`
	margin: 15px 0 0 0;
`;

export const LinksSection = styled(SectionBody)`
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	padding: 0 0 5px 0;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 5px 0 0 0;

	span {
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const LinkWrapper = styled.div`
	position: relative;

	&:hover {
		${LinkTooltip} {
			display: block;
		}
	}

	a,
	button {
		height: 35px;
		width: 35px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: ${(props) => props.theme.colors.container.alt1.background};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		border-radius: 50%;

		svg {
			height: 17.5px;
			width: 17.5px;
			margin: 5.5px 0 0 0;
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
