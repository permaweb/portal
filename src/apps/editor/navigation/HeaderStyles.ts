import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const HeaderWrapper = styled.div`
	height: ${STYLING.dimensions.nav.height};
	width: 100%;
	padding: 0 20px;
	position: sticky;
	top: 0;
	z-index: 5;
	background: ${(props) => props.theme.colors.view.background};
	border-bottom: 1px solid transparent;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		padding: 0 20px 0 10px;
	}
`;

export const HeaderContent = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	gap: 25px;
	justify-content: space-between;
`;

export const HeaderLogo = styled.div`
	height: 27.5px;
	width: 27.5px;
	margin: 0 7.5px 0 0;
	transition: all 100ms;

	svg {
		height: 27.5px;
		width: 27.5px;
		color: ${(props) => props.theme.colors.font.primary};
		fill: ${(props) => props.theme.colors.font.primary};
	}

	&:hover {
		svg {
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
	}
`;

export const HeaderActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

export const HeaderAction = styled.div`
	a,
	button {
		position: relative;
		display: flex;
		gap: 7.5px;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}
`;
