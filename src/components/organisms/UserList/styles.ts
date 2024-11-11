import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

export const UserWrapper = styled.div`
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

export const UserHeader = styled.div`
	max-width: 50%;
	display: flex;
	align-items: center;
	gap: 12.5px;

	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.small};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		white-space: nowrap;
		overflow-x: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		max-width: 100%;
	}
`;

export const UserDetail = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 12.5px;

	@media (max-width: ${STYLING.cutoffs.secondary}) {
		align-items: flex-start;
	}
`;

export const UserActions = styled.div`
	display: flex;
	gap: 12.5px;
`;

export const WrapperEmpty = styled.div`
	padding: 12.5px 15px;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;
