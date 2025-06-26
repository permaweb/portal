import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 0 20px 20px 20px;

	#media-file-input {
		display: none;
	}
`;

export const Header = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 10px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const HeaderActions = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
`;

export const UploadsWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
`;

export const UploadWrapper = styled.button<{ active: boolean }>`
	width: calc((100% - (3 * 20px)) / 4);
	aspect-ratio: 1;
	background: ${(props) => props.theme.colors.container.alt8.background};
	border: 1px solid ${(props) => (props.active ? props.theme.colors.indicator.active : props.theme.colors.border.alt1)};
	outline: 1px solid ${(props) => (props.active ? props.theme.colors.indicator.active : 'transparent')};
	border-radius: ${STYLING.dimensions.radius.primary};
	overflow: hidden;
	position: relative;

	&:hover {
		border: 1px solid ${(props) => props.theme.colors.border.alt4};
	}

	img,
	video {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	::after {
		content: '';
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: ${(props) => props.theme.colors.overlay.alt1};
		opacity: 0;
		transition: all 100ms;
	}
	&:hover::after {
		opacity: 1;
	}
	&:focus::after {
		opacity: 1;
	}
	&:hover {
		cursor: pointer;
	}

	&:disabled {
		pointer-events: none;
	}
`;

export const Indicator = styled.div`
	height: 17.5px;
	width: 17.5px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid ${(props) => props.theme.colors.indicator.active};
	background: ${(props) => props.theme.colors.indicator.active};
	border-radius: 50%;

	position: absolute;
	bottom: 10px;
	right: 10px;

	svg {
		height: 10.5px !important;
		width: 10.5px !important;
		color: ${(props) => props.theme.colors.font.light1} !important;
		fill: ${(props) => props.theme.colors.font.light1} !important;
		margin: 3.5px 0 0 0 !important;

		polyline {
			stroke-width: 40px !important;
		}
	}
`;

export const ActionsWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 15px;
	margin: 15px 0 0 0;
`;

export const TabsWrapper = styled.div`
	> :first-child {
		padding: 0 !important;
	}
`;

export const TabWrapper = styled.div<{ label: string; icon?: string }>``;

export const TabContent = styled.div``;

export const WrapperEmpty = styled.div`
	width: 100%;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 40px;
	padding: 0 20px 20px 20px !important;
`;

export const ModalBodyWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const ModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;
