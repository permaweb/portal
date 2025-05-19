import styled, { DefaultTheme } from 'styled-components';

import { STYLING } from 'helpers/config';
import { PortalUserRoleType, ViewLayoutType } from 'helpers/types';

export const Wrapper = styled.div`
	width: 100%;
`;

export const UsersHeaderDetails = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12.5px 15px;
	border-radius: 0 !important;
	border-bottom: none !important;
	border-top-left-radius: ${STYLING.dimensions.radius.alt2} !important;
	border-top-right-radius: ${STYLING.dimensions.radius.alt2} !important;
	p {
		color: ${(props) => props.theme.colors.font.primary};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-size: ${(props) => props.theme.typography.size.base};
		font-weight: ${(props) => props.theme.typography.weight.bold};
	}
`;

export const PostsHeaderDetailsActions = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`;

export const UsersWrapper = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	display: flex;
	flex-direction: column;

	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};

	border-top-left-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-top-right-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};

	margin: ${(props) => (props.type === 'header' ? '0' : '20px 0 0 0')};
	overflow: hidden;

	> * {
		&:not(:last-child) {
			border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
		}
	}
`;

export const WrapperEmpty = styled.div<{ type: ViewLayoutType }>`
	width: 100%;
	padding: 12.5px 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-top-right-radius: ${(props) => (props.type === 'header' ? '0' : STYLING.dimensions.radius.alt2)};
	border-bottom-left-radius: ${STYLING.dimensions.radius.alt2};
	border-bottom-right-radius: ${STYLING.dimensions.radius.alt2};
	margin: ${(props) => (props.type === 'header' ? '0' : '20px 0 0 0')};

	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;

export const UserWrapper = styled.div`
	display: flex;
	padding: 15px;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	transition: all 150ms;

	&:hover {
		background: ${(props) => props.theme.colors.container.alt1.background};
	}

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

function getRoleBackground(theme: DefaultTheme, role: PortalUserRoleType) {
	switch (role) {
		case 'Admin':
			return theme.colors.roles.primary;
		case 'Contributor':
			return theme.colors.roles.alt1;
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
