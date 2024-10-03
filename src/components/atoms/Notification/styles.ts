import styled from 'styled-components';

import { open, transition2 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ warning: boolean | undefined }>`
	min-width: 375px;
	width: fit-content;
	max-width: 90vw;
	display: flex;
	gap: 60px;
	position: fixed;
	left: 50%;
	bottom: 20px;
	transform: translate(-50%, 0);
	z-index: 20;
	animation: ${open} ${transition2};
	display: flex;
	align-items: center;
	padding: 11.5px 17.5px;
	background: ${(props) => (props.warning ? props.theme.colors.warning.alt1 : props.theme.colors.indicator.active)};
	border-radius: ${STYLING.dimensions.radius.alt2};
`;

export const Message = styled.span`
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${(props) => props.theme.colors.font.light1};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-size: ${(props) => props.theme.typography.size.small};
`;

export const Close = styled.div`
	button {
		span {
			color: ${(props) => props.theme.colors.font.light1} !important;
			font-size: ${(props) => props.theme.typography.size.xSmall};
		}
		&:hover {
			span {
				color: ${(props) => props.theme.colors.font.light1} !important;
				opacity: 0.75;
			}
		}
	}
`;
