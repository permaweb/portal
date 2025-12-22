import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
	font-family: ${(props) => props.theme.typography.family.primary};
`;

export const ModuleWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

export const ModuleTitle = styled.h3`
	margin: 0;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.lg};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const SupportersList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

export const SupporterItem = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	border-radius: 8px;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	transition: all 0.2s ease;

	&:hover {
		background: ${(props) => props.theme.colors.container.alt2.background};
		border-color: ${(props) => props.theme.colors.border.alt1};
	}
`;

export const AvatarWrapper = styled.div`
	width: 40px;
	height: 40px;
	min-width: 40px;
	border-radius: 50%;
	background: ${(props) => props.theme.colors.container.alt3.background};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
`;

export const Avatar = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const AvatarPlaceholder = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const SupporterInfo = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	min-width: 0;
`;

export const SupporterName = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.medium};
	color: ${(props) => props.theme.colors.font.primary};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SupporterAddress = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.alt1};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const SupporterAmount = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
`;

export const AmountPrimary = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const AmountSecondary = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const SupporterTime = styled.div`
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.alt1};
	white-space: nowrap;
`;

export const LoadingMessage = styled.div`
	padding: 20px;
	text-align: center;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.alt1};
`;

export const ErrorMessage = styled.div`
	padding: 16px;
	border-radius: 8px;
	background: ${(props) => props.theme.colors.container.alt2.background};
	border: 1px solid ${(props) => props.theme.colors.warning.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.primary};
`;

export const EmptyMessage = styled.div`
	padding: 20px;
	text-align: center;
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	color: ${(props) => props.theme.colors.font.alt1};
`;
