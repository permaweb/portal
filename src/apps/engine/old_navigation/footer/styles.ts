import styled from 'styled-components';

export const Wrapper = styled.footer`
	width: 100%;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const Content = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
`;

export const Header = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 15px;
`;

export const LogoWrapper = styled.div`
	max-height: 45px;
	width: 250px;
	max-width: 50%;

	a {
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		align-items: center;

		&:hover {
			opacity: 0.75;
		}
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: contain;
		object-position: left;
	}

	h4 {
		text-align: left;
		font-size: ${(props) => props.theme.typography.size.xLg};
		color: ${(props) => props.theme.colors.font.primary};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}

	svg {
		height: 25px;
		width: 25px;
		&:hover {
			fill: ${(props) => props.theme.colors.icon.primary.active};
		}
	}
`;

export const NavigationWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 15px;
`;

export const CategoriesWrapper = styled.div`
	width: 600px;
	max-width: 90vw;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 15px;

	a {
		color: ${(props) => props.theme.colors.font.alt2};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-align: center;

		&:hover {
			color: ${(props) => props.theme.colors.font.primary};
			text-decoration: underline;
			text-decoration-thickness: 1.25px;
		}
	}
`;

export const PageLinksWrapper = styled(CategoriesWrapper)``;

export const LinksWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 15px;
`;

export const LinkTooltip = styled.div`
	position: absolute;
	z-index: 2;
	display: none;
	white-space: nowrap;

	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin: 4.5px 0 0 0;

	border: 1px solid ${(props) => props.theme.colors.contrast.border};

	span {
		font-size: 10px !important;
		display: block;
		line-height: 1.65;
		text-transform: uppercase;
	}
`;

export const LinkWrapper = styled.div`
	position: relative;

	height: 35px;
	width: 35px;

	&:hover {
		${LinkTooltip} {
			display: block;
		}
	}

	a,
	button {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 100ms;

		background: ${(props) => props.theme.colors.container.alt1.background};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		border-radius: 50%;

		svg {
			height: 20px;
			width: 20px;
			margin: 6.5px 0 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}

		img {
			height: 22.5px;
			width: 22.5px;
		}

		&:hover {
			background: ${(props) => props.theme.colors.container.alt2.background};
			border: 1px solid ${(props) => props.theme.colors.border.alt4};
			svg {
				color: ${(props) => props.theme.colors.font.primary};
				fill: ${(props) => props.theme.colors.font.primary};
			}
		}
	}
`;

export const FooterEndWrapper = styled.div`
	width: 100%;
	padding: 25px 0 0 0;
	margin: 5px 0 0 0;
	border-top: 1px solid ${(props) => props.theme.colors.border.primary};
`;

export const NameWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-align: center;
	}
`;
