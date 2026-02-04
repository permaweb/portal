import styled from 'styled-components';

import { open, transition1 } from 'helpers/animations';
import { STYLING } from 'helpers/config';

export const Wrapper = styled.div<{ warning: boolean | undefined }>`
	min-width: 375px;
	max-width: 50vw;
	position: relative;
	animation: ${open} ${transition1};
	display: flex;
	align-items: center;
	padding: 11.5px 17.5px !important;
	gap: 45px;
	border: 1px solid ${(props) => props.theme?.colors?.border?.alt4 ?? 'var(--color-card-border, rgba(0,0,0,0.1))'} !important;
	border-radius: ${STYLING.dimensions.radius.alt3};
	background: ${(props) => props.theme?.colors?.container?.primary?.background ?? 'var(--color-card-background, #fff)'};
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		min-width: 0;
		max-width: none;
		width: 90vw;
	}
`;

export const MessageWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const Icon = styled.div<{ warning: boolean | undefined }>`
	min-height: 17.5px;
	height: 17.5px;
	min-width: 17.5px;
	width: 17.5px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) =>
		props.warning
			? props.theme?.colors?.warning?.alt1 ?? 'rgba(231, 76, 60, 0.8)'
			: props.theme?.colors?.indicator?.active ?? 'rgba(var(--color-primary, 46, 204, 113), 1)'};
	border-radius: 50%;

	svg {
		height: 11.5px;
		width: 11.5px;
		margin: 6.5px 0 0 0;
		color: ${(props) => props.theme?.colors?.font?.light1 ?? '#fff'};
		fill: ${(props) => props.theme?.colors?.font?.light1 ?? '#fff'};
	}
`;

export const Message = styled.span`
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${(props) => props.theme?.colors?.font?.light1 ?? 'rgba(var(--color-text, 0,0,0), 1)'};
	font-weight: ${(props) => props.theme?.typography?.weight?.bold ?? '600'} !important;
	font-size: ${(props) => props.theme?.typography?.size?.xSmall ?? '13px'} !important;
`;

export const Close = styled.div`
	margin: 0 0 0 auto;
	button {
		span {
			color: ${(props) => props.theme?.colors?.font?.light1 ?? 'rgba(var(--color-text, 0,0,0), 1)'} !important;
			font-size: ${(props) => props.theme?.typography?.size?.xSmall ?? '13px'};
		}
		&:hover {
			span {
				color: ${(props) => props.theme?.colors?.font?.light1 ?? 'rgba(var(--color-text, 0,0,0), 1)'} !important;
				opacity: 0.75;
			}
		}
	}
`;
