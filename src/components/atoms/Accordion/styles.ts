import styled from 'styled-components';

export const ERoot = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-top: 8px;
	border-top: 1px solid ${(p) => p.theme.colors.border.primary};

	&[data-divided='false'] {
		border-top: none;
		padding-top: 0;
	}
`;

export const ERow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
`;

export const ETitle = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: ${(p) => p.theme.colors.font.primary};
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	font-weight: ${(p) => p.theme.typography.weight.bold};
`;

export const EActions = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const EAccordion = styled.div<{ isOpen: boolean }>`
	display: ${(p) => (p.isOpen ? 'grid' : 'none')};
	grid-template-rows: 0fr;
	transition: grid-template-rows 200ms ease;
	&[data-expanded='true'] {
		grid-template-rows: 1fr;
	}
`;

export const EAccordionInner = styled.div`
	overflow: hidden;
	background: ${(p) => p.theme.colors.container.alt2.background};
	border: 1px solid ${(p) => p.theme.colors.border.primary};
	border-radius: 8px;
	padding: 10px 12px;
`;
