import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	min-height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 10vh 20px 20px 20px;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		padding: 20px;
	}
`;

export const HeaderWrapper = styled.div`
	max-width: 515px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 7.5px;

	h4,
	p {
		text-align: center;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	max-width: 900px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	gap: 40px;
	margin: 50px 0 0 0;
`;

export const Section = styled.div`
	width: 100%;
	max-width: 500px;
	display: flex;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		width: 100%;
		padding: 0;
	}
`;

export const ConnectionWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const PortalsWrapper = styled.div`
	height: 300px;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-weight: ${(props) => props.theme.typography.weight.medium};
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		height: auto;
	}
`;

export const PLoadingWrapper = styled.div`
	p {
		text-align: center;
		margin: 0 0 10px 0;
	}
`;

export const PListWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 15px;
	margin: 0 0 5px 0;

	a {
		height: 47.5px;
		display: flex;
		align-items: center;
		cursor: pointer;
		text-overflow: ellipsis;
		overflow: hidden;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		background: ${(props) => props.theme.colors.container.primary.background};
		border: 1px solid ${(props) => props.theme.colors.border.primary};
		border-radius: ${STYLING.dimensions.radius.primary};
		transition: all 100ms;
		padding: 0 15px;
		svg {
			height: 20.5px;
			width: 20.5px;
			margin: 6.5px 14.5px 0 0;
			color: ${(props) => props.theme.colors.font.alt1};
			fill: ${(props) => props.theme.colors.font.alt1};
		}
		img {
			height: 22.5px;
			width: 22.5px;
			margin: 0 12.5px 0 0;
		}
		&:hover {
			background: ${(props) => props.theme.colors.button.primary.active.background};
			border: 1px solid ${(props) => props.theme.colors.button.primary.active.border};
		}
	}
`;
