import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	padding: 0 20px 20px;
`;

export const Description = styled.p`
	margin: 0 0 15px;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
`;

export const Groups = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const Group = styled.div<{ $isDragging: boolean }>`
	opacity: 1 !important;
	visibility: visible !important;
	background: ${(props) => props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
	box-shadow: ${(props) => (props.$isDragging ? `0 3px 10px ${props.theme.colors.shadow.primary}` : 'none')};
`;

export const GroupHeader = styled.div`
	min-height: 50px;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: 10px;
	padding: 8px 12px;
	background: ${(props) => props.theme.colors.container.primary.active};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	border-top-left-radius: ${STYLING.dimensions.radius.alt2};
	border-top-right-radius: ${STYLING.dimensions.radius.alt2};
`;

export const Posts = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 10px;
`;

export const Post = styled.div<{ $isDragging: boolean }>`
	min-height: 52px;
	opacity: 1 !important;
	visibility: visible !important;
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: 10px;
	padding: 8px 12px;
	background: ${(props) =>
		props.$isDragging ? props.theme.colors.container.primary.active : props.theme.colors.container.primary.background};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};

	@media (max-width: 520px) {
		grid-template-columns: auto minmax(0, 1fr);
	}
`;

export const DragHandle = styled.button`
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${(props) => props.theme.colors.font.alt1};
	cursor: grab !important;

	&:hover,
	&:focus {
		cursor: grab !important;
	}

	&:active {
		cursor: grabbing !important;
	}

	svg {
		width: 16px;
		height: 16px;
		color: currentColor !important;
		fill: none !important;
	}

	svg circle {
		fill: currentColor !important;
	}
`;

export const GroupDragHandle = styled(DragHandle)``;

export const GroupName = styled.p`
	margin: 0;
	overflow: hidden;
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.small};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const PostCount = styled.span`
	min-width: 28px;
	padding: 3px 7px;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-align: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.alt3};
`;

export const PostTitle = styled.p`
	overflow: hidden;
	color: ${(props) => props.theme.colors.font.primary};
	font-family: ${(props) => props.theme.typography.family.primary};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const Status = styled.span`
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-transform: uppercase;

	@media (max-width: 520px) {
		display: none;
	}
`;

export const Empty = styled.div`
	padding: 15px;
	color: ${(props) => props.theme.colors.font.alt1};
	font-size: ${(props) => props.theme.typography.size.xSmall};
	text-align: center;
`;

export const Actions = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin: 20px 0 0;
`;
