import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	min-height: 100vh;
	width: 100%;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		padding: 20px;
	}
`;

export const HeaderWrapper = styled.div`
	height: ${STYLING.dimensions.nav.height};
	width: 100%;
	padding: 0 20px;
	position: sticky;
	top: 0;
	z-index: 2;
	background: ${(props) => props.theme.colors.view.background};

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
	justify-content: flex-end;
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

export const HeaderIndicator = styled.div`
	height: 12.5px;
	width: 12.5px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	top: 0;
	right: -17.5px;
	right: 0;
	background: ${(props) => props.theme.colors.indicator.alt1};
	border-radius: 50%;

	span {
		font-size: 8px;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
	}
`;

export const ContentWrapper = styled.div`
	width: fit-content;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 60px 0 0 0;
	margin: calc(${STYLING.dimensions.nav.height} + 40px) auto 0 auto;
	border-radius: ${STYLING.dimensions.radius.alt1} !important;
`;

export const ContentHeaderWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 7.5px;
	margin: 0 0 25px 0;

	h4,
	p {
		text-align: center;
	}

	p {
		color: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const ContentBodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
	margin: 40px 0 0 0;
`;

export const Section = styled.div`
	width: 425px;
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
	padding: 0 25px;
	align-items: center;
	justify-content: center;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.base};
	}
`;

export const ConnectionHeaderWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.lg};
		font-family: ${(props) => props.theme.typography.family.primary};
		text-align: center;
	}
`;

export const PortalsWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-size: ${(props) => props.theme.typography.size.xSmall};
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		height: auto;
	}
`;

export const PortalsHeaderWrapper = styled.div`
	width: calc(100% - 50px);
	padding: 0 0 10px 0;
	margin: 0 auto;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
		text-align: center;
	}
`;

export const PortalsLoadingWrapper = styled.div`
	p {
		text-align: center;
		margin: 0 0 10px 0;
	}
`;

export const PortalsListWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 15px;

	a,
	button {
		min-height: 65px;
		height: 65px;
		width: calc(100% - 30px);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		text-overflow: ellipsis;
		overflow: hidden;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.small} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		background: transparent;
		border: 1px solid transparent;
		border-radius: ${STYLING.dimensions.radius.primary};
		transition: all 100ms;
		padding: 0 25px;
		margin: 0 auto;
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
			border-radius: 50%;
		}
		&:hover {
			background: ${(props) => props.theme.colors.button.primary.active.background};
			border: 1px solid ${(props) => props.theme.colors.button.primary.active.border};
		}
	}
`;

export const PortalsListWrapperMain = styled(PortalsListWrapper)`
	margin: 25px 0 0 0;
`;

export const PortalActionWrapper = styled.div`
	width: 100%;
	margin: 40px 0 0 0;

	button {
		border: none !important;
		background: transparent;
		border-top: 1px solid transparent !important;
		border-top-left-radius: 0 !important;
		border-top-right-radius: 0 !important;
		border-bottom-left-radius: ${STYLING.dimensions.radius.alt1} !important;
		border-bottom-right-radius: ${STYLING.dimensions.radius.alt1} !important;

		&:hover {
			border-top: 1px solid ${(props) => props.theme.colors.border.alt1} !important;
		}
	}
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 20px 20px 20px;
`;

export const InvitesDescription = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.medium};
		font-family: ${(props) => props.theme.typography.family.primary};
		line-height: 1.65;
	}
`;
