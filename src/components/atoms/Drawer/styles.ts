import styled from 'styled-components';

import { open, transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div``;

export const Action = styled.div<{ open: boolean; noContentWrapper?: boolean }>`
	width: 100%;
	transition: all 100ms;
	background: ${(props) => props.theme.colors.button.primary.background};
	border-top-left-radius: calc(${STYLING.dimensions.radius.alt2} - 1.5px);
	border-top-right-radius: calc(${STYLING.dimensions.radius.alt2} - 1.5px);
	border-bottom-left-radius: ${(props) => (props.open ? '0' : `calc(${STYLING.dimensions.radius.alt2} - 1.5px)`)};
	border-bottom-right-radius: ${(props) => (props.open ? '0' : `calc(${STYLING.dimensions.radius.alt2} - 1.5px)`)};
	border-top: ${(props) => (props.noContentWrapper ? `1px solid ${props.theme.colors.border.primary}` : 'none')};
	border-left: ${(props) => (props.noContentWrapper ? `1px solid ${props.theme.colors.border.primary}` : 'none')};
	border-right: ${(props) => (props.noContentWrapper ? `1px solid ${props.theme.colors.border.primary}` : 'none')};
	border-bottom: ${(props) =>
		props.noContentWrapper && !props.open ? `1px solid ${props.theme.colors.border.primary}` : 'none'};

	box-shadow: ${(props) =>
		props.noContentWrapper && !props.open ? `${props.theme.colors.shadow.primary} 0px 1px 2px 0.5px` : 'none'};
	padding: 15px 0;
	&:hover {
		background: ${(props) => props.theme.colors.button.primary.active.background};
		cursor: pointer;
	}
`;

export const HeaderEnd = styled.div`
	display: flex;
	gap: 15px;
`;

export const HeaderActions = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 12.5px;
`;

export const Label = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 15px;
	justify-content: space-between;
	align-items: center;
	padding: 2.5px 15px 0 15px;
	p {
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		color: ${(props) => props.theme.colors.font.primary};
		padding: 0 0 2.5px 0;
	}
	svg {
		width: 17.5px !important;
		fill: ${(props) => props.theme.colors.font.primary};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const Arrow = styled.div<{ open: boolean }>`
	margin: 2.5px 0 0 0;
	svg {
		transform: rotate(${(props) => (props.open ? '0deg' : '270deg')});
		fill: ${(props) => props.theme.colors.font.primary};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const Title = styled.div`
	display: flex;
	align-items: center;
	svg {
		margin: 0 15px 0 0;
	}
`;

export const Content = styled.div<{ padContent?: boolean; noContentWrapper?: boolean }>`
	animation: ${open} ${transition2};
	border-top: ${(props) => (props.noContentWrapper ? 'none' : `1px solid ${props.theme.colors.border.primary}`)};
	padding: ${(props) => (props.padContent ? '15px' : '0')};
`;
