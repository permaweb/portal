import styled from 'styled-components';

export const Badge = styled.span<{ tone?: 'success' | 'warning' | 'danger' | 'neutral' }>`
	display: inline-flex;
	align-items: center;
	padding: 4px 8px;
	border-radius: 999px;
	font-size: ${(p) => p.theme.typography.size.small};
	font-family: ${(p) => p.theme.typography.family.primary};

	background: ${(p) =>
		p.tone === 'success'
			? p.theme.colors.badge.approved.background
			: p.tone === 'warning'
			? p.theme.colors.badge.pending.background
			: p.tone === 'danger'
			? p.theme.colors.badge.rejected.background
			: p.theme.colors.badge.cancelled.background};

	color: ${(p) =>
		p.tone === 'success'
			? p.theme.colors.badge.approved.color
			: p.tone === 'warning'
			? p.theme.colors.badge.pending.color
			: p.tone === 'danger'
			? p.theme.colors.badge.rejected.color
			: p.theme.colors.badge.cancelled.color};
`;
