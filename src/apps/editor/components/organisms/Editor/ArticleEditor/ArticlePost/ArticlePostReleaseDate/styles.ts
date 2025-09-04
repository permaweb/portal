import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	margin: 10px 0 0 0;
`;

export const HeaderWrapper = styled.div`
	width: 100%;
	display: flex;
	gap: 15px;

	.info {
		flex: 1;
		padding: 2.5px 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7.5px;
		border-radius: ${STYLING.dimensions.radius.alt1} !important;
		background: ${(props) => props.theme.colors.container.alt11.background};

		p {
			color: ${(props) => props.theme.colors.font.light1} !important;
			font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
			font-weight: ${(props) => props.theme.typography.weight.bold} !important;
			font-family: ${(props) => props.theme.typography.family.primary} !important;
			text-align: center;
			text-transform: none !important;
		}
	}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;

	input {
		width: 100%;
		flex: 1;
		margin: 0;
	}
`;

export const Section = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	h4 {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const DateWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 15px;

	> *:first-child {
		flex: 1.15;

		ul {
			top: 53.5px;
		}
	}

	> *:nth-child(2) {
		flex: 0.35;
	}

	> *:nth-child(3) {
		flex: 0.5;
	}
`;

export const TimeWrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	gap: 15px;
`;

export const TimeFlexWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
`;

export const CalendarWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin: 20px 0 0 0;
`;

export const ToggleWrapper = styled.div`
	height: ${STYLING.dimensions.form.small};

	div {
		height: 100%;
		border-radius: ${STYLING.dimensions.radius.alt3} !important;
	}

	button {
		min-height: none !important;
		height: 100% !important;
		border-radius: ${STYLING.dimensions.radius.alt3} !important;
	}
`;

export const DateInput = styled.div`
	flex: 1.25;
`;

export const TimeInput = styled.div`
	flex: 0.75;
`;

export const ErrorMessage = styled.div`
	width: 100%;
	padding: 5px 0;
	font-size: ${(props) => props.theme.typography.size.xxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-align: center;
	margin: 25px 0 0 0;
`;

export const EditActions = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
	margin: 20px 0 0 0;
`;
