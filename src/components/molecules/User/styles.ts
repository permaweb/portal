import styled, { DefaultTheme } from 'styled-components';

import { STYLING } from 'helpers/config';
import { PortalUserRoleType } from 'helpers/types';

export const UserWrapper = styled.div`
	display: flex;
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
	display: flex;
	align-items: center;
	gap: 12.5px;

	p {
		max-width: 100%;
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

function getRoleBackground(theme: DefaultTheme, role: PortalUserRoleType) {
	switch (role) {
		case 'Admin':
			return theme.colors.roles.primary;
		case 'Contributor':
			return theme.colors.roles.alt1;
		case 'Moderator':
			return theme.colors.roles.alt2;
		case 'External-Contributor':
			return theme.colors.roles.alt3;
		default:
			return theme.colors.roles.alt2;
	}
}

export const UserRole = styled.div<{ role: PortalUserRoleType }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5px 10px;
	border-radius: 20px;
	background: ${(props) => getRoleBackground(props.theme, props.role)};
	span {
		color: ${(props) => props.theme.colors.font.light1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;
