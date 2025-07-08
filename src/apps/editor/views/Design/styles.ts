import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.desktop}) {
		flex-direction: column;
		gap: 20px;
	}
`;

export const SectionWrapper = styled.div`
	height: fit-content;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 25px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		gap: 20px;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		gap: 15px;
	}
`;

export const Section = styled.div`
	height: fit-content;
	width: 100%;
	padding: 15px;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		padding: 12px;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		padding: 10px;
	}
`;

export const SectionHeader = styled.div`
	margin: 0 0 15px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		text-transform: uppercase;
		line-height: 1;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		margin: 0 0 12px 0;
	}

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		margin: 0 0 10px 0;
	}
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	padding: 0.5px 10px 2.5px 10px;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		margin: 0 auto;
		text-align: center;
	}
`;
