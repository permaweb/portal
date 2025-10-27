import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: space-between;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column;
	}
`;

export const TitleWrapper = styled.div`
	width: calc(50% - 10px);
	overflow: hidden;
	position: relative;
	input {
		width: 100%;
		display: block;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.base} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		padding: 0;
		outline: 0;
		border: none;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const UpdateWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 7.5px;
	padding: 3.5px 7.5px 3.5px 7.5px !important;
	border: 1px solid ${(props) => props.theme.colors.border.alt1};

	.indicator {
		height: 10px;
		width: 10px;
		border-radius: 50%;
		background: ${(props) => props.theme.colors.indicator.neutral};
	}
`;

export const EndActions = styled.div`
	width: calc(50% - 10px);
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
		flex-wrap: wrap;
	}
`;

export const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;
