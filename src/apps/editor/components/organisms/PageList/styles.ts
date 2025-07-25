import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const PageWrapper = styled.div`
	display: flex;
	padding: 12.5px 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export const PageHeader = styled.div`
	max-width: 50%;

	a {
		display: flex;
		align-items: center;
		gap: 5px;

		&:hover {
			svg {
				color: ${(props) => props.theme.colors.font.alt1};
				fill: ${(props) => props.theme.colors.font.alt1};
			}
			p {
				color: ${(props) => props.theme.colors.font.alt1};
			}
		}

		svg {
			color: ${(props) => props.theme.colors.font.primary};
			fill: ${(props) => props.theme.colors.font.primary};
		}
	}

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	svg {
		height: 18.5px;
		width: 16.5px;
		padding: 4.5px 0 0 0;
		margin: 4.5px 0 0 0;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const PageDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const PageActions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const WrapperEmpty = styled.div`
	padding: 12.5px 15px;

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
