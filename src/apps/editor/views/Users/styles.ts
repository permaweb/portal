import styled from 'styled-components';

export const Wrapper = styled.div`
	width: 100%;
`;

export const BodyWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const InfoWrapper = styled.div`
	width: fit-content;
	margin: 0 0 0 auto;
	padding: 0.5px 10px 2.5px 10px;
	span {
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	}
`;

export const HeaderAction = styled.div`
	a,
	button {
		position: relative;
		display: flex;
		gap: 7.5px;
		margin-top: 8px;
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};

		&:hover {
			color: ${(props) => props.theme.colors.font.alt1};
		}
	}

	.notification {
		position: absolute;
		top: -5px;
		right: -23.5px;
	}
`;

/* Use these for the "Transfers" text button with count bubble */
export const TransfersTextButton = styled.button`
	position: relative;
	background: transparent;
	border: none;
	padding: 0;
	cursor: pointer;

	font-size: ${(p) => p.theme.typography.size.xSmall};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-weight: ${(p) => p.theme.typography.weight.xBold};
	color: ${(p) => p.theme.colors.link};

	&:hover {
		text-decoration: underline;
	}
`;

export const TransfersCountBubble = styled.span`
	position: absolute;
	top: -8px;
	right: -14px;
	min-width: 18px;
	height: 18px;
	padding: 0 6px;
	border-radius: 999px;

	display: inline-flex;
	align-items: center;
	justify-content: center;

	background: ${(p) => p.theme.colors.indicator.active};
	color: ${(p) => p.theme.colors.contrast};

	font-size: ${(p) => p.theme.typography.size.xxxSmall};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	line-height: 1;
`;

/* Modal-based invites list */
export const TransferInvitesWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const TransferInvitesDescription = styled.div`
	p {
		margin: 10px;
		margin-left: 20px;
		font-size: ${(p) => p.theme.typography.size.xxSmall};
		font-family: ${(p) => p.theme.typography.family.primary};
		font-weight: ${(p) => p.theme.typography.weight.medium};
		color: ${(p) => p.theme.colors.font.primary};
	}
`;

export const TransferInvitesList = styled.div`
	max-height: 300px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
`;

export const TransferInviteRow = styled.div`
	display: grid;
	grid-template-columns: 2fr 1fr auto;
	gap: 10px;
	align-items: center;
	padding: 10px 12px;
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 10px;
	background: ${(p) => p.theme.colors.container.alt2};
`;

export const TransferInviteMeta = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;

	strong {
		font-size: ${(p) => p.theme.typography.size.xSmall};
		color: ${(p) => p.theme.colors.font.primary};
	}

	span {
		font-size: ${(p) => p.theme.typography.size.xxxSmall};
		color: ${(p) => p.theme.colors.font.alt1};
	}
`;

export const TransferInviteState = styled.span<{ $state?: string }>`
	justify-self: start;
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: ${(p) => p.theme.typography.size.xxxSmall};
	font-weight: ${(p) => p.theme.typography.weight.bold};
	text-transform: capitalize;
	background: ${(p) => {
		switch (p.$state) {
			case 'pending':
				return p.theme.colors.indicator.neutral;
			case 'accepted':
				return p.theme.colors.status.success;
			case 'rejected':
				return p.theme.colors.status.error;
			case 'cancelled':
				return p.theme.colors.status.warning;
			default:
				return p.theme.colors.container.alt3;
		}
	}};
	color: ${(p) => p.theme.colors.contrast};
`;

export const TransferInviteActions = styled.div`
	display: inline-flex;
	gap: 8px;
	justify-self: end;
`;
