import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 5px;
	padding: 0 0 5px 0;
`;

export const CategoriesAction = styled.div`
	position: relative;
`;

export const CategoriesAdd = styled.div``;

export const CategoriesClose = styled.div`
	margin: 17.5px 0 0 0;
`;

export const CategoriesAddAction = styled.form`
	position: relative;

	button {
		position: absolute;
		top: 8.5px;
		right: 10px;
		z-index: 1;
	}

	input {
		margin: 0;
		padding: 10px 85px 10px 10px;
	}
`;

export const CategoriesParentAction = styled.div`
	position: relative;
`;

export const CategoryAddAction = styled.div`
	margin: 5px 0 0 0;
`;

export const CategoriesParentSelectAction = styled.div`
	button {
		height: ${STYLING.dimensions.form.small};
		width: 100%;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: ${STYLING.dimensions.radius.alt3} !important;

		svg {
			height: 16.5px;
			width: 16.5px;
			margin: 2.5px 0 0 0;
		}
	}
`;

export const ParentCategoryDropdown = styled.div`
	max-height: 50vh;
	width: 100%;
	max-width: 90vw;
	padding: 7.5px 10px;
	position: absolute;
	z-index: 2;
	top: 52.5px;
	background: ${(props) => props.theme.colors.container.alt1.background} !important;
	border-radius: ${STYLING.dimensions.radius.alt4} !important;
`;

export const ParentCategoryOptions = styled.div``;

export const ParentCategoryOption = styled.button<{ level: number }>`
	height: 40px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	pointer-events: auto;
	background: transparent;
	border-radius: ${STYLING.dimensions.radius.alt4};
	transition: all 100ms;
	padding: ${(props) => `0 10px 0 ${(props.level * 10).toString()}px`} !important;
	span {
		color: ${(props) => props.theme.colors.font.primary} !important;
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		display: block;
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 85%;
		overflow: hidden;
	}
	svg {
		height: 17.5px;
		width: 17.5px;
		margin: 2.5px 0 0 0;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
	img {
		height: 22.5px;
		width: 22.5px;
		margin: 0 12.5px 0 0;
	}
	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}
`;

export const Divider = styled.div`
	height: 1px;
	width: calc(100% - 10px);
	border-top: 1px solid ${(props) => props.theme.colors.border.alt1};
	margin: 5px auto;
`;

export const CategoriesBody = styled.div``;

export const CategoryOptionsWrapper = styled.div``;

export const CategoriesList = styled.ul``;

export const CategoryOption = styled.li<{ level: number }>`
	position: relative;
	margin: ${(props) => `0 10px 12.5px ${(props.level * 20).toString()}px`} !important;

	button {
		pointer-events: auto;
		position: relative;
		z-index: 1;
	}
`;

export const WrapperEmpty = styled.div`
	padding: 0 0 10px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const LoadingWrapper = styled(WrapperEmpty)``;

export const CategoriesFooter = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 15px;
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 0 20px 20px 20px !important;
`;

export const ModalBodyWrapper = styled.div`
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const ModalBodyElements = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.5px;
	margin: 15px 0 0 0;
`;

export const ModalBodyElement = styled.div`
	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;

export const ModalActionsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
	gap: 15px;
`;

export const CategoryDragWrapper = styled.div<{ level: number; isDragging: boolean; parentDragging: boolean }>`
	&:hover .child-drop-indicator {
		opacity: 0.3;
	}
`;

export const CategoryDrag = styled.div<{ level: number; isDragging: boolean; hasCount?: boolean }>`
	width: fit-content;
	position: relative;
	display: flex;
	align-items: center;
	gap: 7.5px;
	margin: ${(props) => `0 10px 12.5px ${(props.level * 20).toString()}px`} !important;
	transition: all 200ms;

	&::after {
		height: fit-content;
		content: '';
		position: absolute;
		top: -5px;
		right: -32.5px;
		bottom: 0;
		border-radius: 20px;
		padding: 1.5px 5px;
		background: transparent;
		transition: all 200ms ease;
		opacity: 0;
		pointer-events: none;
		font-size: 8px;
		text-transform: uppercase;
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
	}

	&.can-be-parent::after {
		background: ${(props) => props.theme.colors.indicator.alt1};
		opacity: 1;
		content: 'Parent';
		white-space: nowrap;
		position: absolute;
		right: 10px;
		top: -5px;
	}

	&.will-unnest::after {
		background: ${(props) => props.theme.colors.indicator.alt1};
		opacity: 1;
		content: 'Un-Nest';
		white-space: nowrap;
		position: absolute;
		top: -7.5px;
		right: ${(props) => (props.hasCount ? '-15.5px' : '2.5px')};
	}
`;

export const CategoryDragHandle = styled.div`
	height: 24.5px;
	cursor: grab;
	border-radius: ${STYLING.dimensions.radius.alt4};
	transition: all 200ms;

	&:hover {
		background: ${(props) => props.theme.colors.container.primary.active};
	}

	&:active {
		cursor: grabbing;
	}

	svg {
		height: 12.5px;
		width: 12.5px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}
`;

export const CategoryContent = styled.div`
	display: flex;
	flex-direction: column;

	.notification {
		position: absolute;
		background: ${(props) => props.theme.colors.indicator.alt1} !important;
		animation: none !important;
		top: -8.5px;
		right: 35px;
	}
`;

export const CategoryRow = styled.div`
	display: flex;
	align-items: center;

	button:last-child {
		opacity: 0;
		pointer-events: none;
		transition: opacity 100ms;

		span {
			font-size: ${(props) => props.theme.typography.size.xxxxSmall} !important;
		}
	}

	&:hover button:last-child {
		opacity: 1;
		pointer-events: auto;
	}
`;

export const ChildDropZone = styled.div<{ visible: boolean; level: number }>`
	height: ${(props) => (props.visible ? '25px' : '0px')};
	margin-left: ${(props) => `${((props.level + 1) * 20 + 32).toString()}px`};
	background: ${(props) => props.theme.colors.container.primary.active};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
	transition: all 200ms ease;
	opacity: ${(props) => (props.visible ? 1 : 0)};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: ${(props) => props.theme.typography.size.xxxSmall};
	color: ${(props) => props.theme.colors.font.alt1};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	text-transform: uppercase;
	padding: 2.5px 15.5px;

	&::before {
		content: 'Drop to make child category';
		white-space: nowrap;
	}
`;

export const CategorySettingsBtn = styled.button<{ $disabled?: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border: none;
	background: transparent;
	padding: 4px;
	border-radius: ${STYLING.dimensions.radius.alt4};
	cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
	opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
	transition: all 100ms;

	svg {
		width: 16px;
		height: 16px;
		color: ${(props) => props.theme.colors.font.alt1};
		fill: ${(props) => props.theme.colors.font.alt1};
	}

	&:hover:not(:disabled) {
		background: ${(props) => props.theme.colors.container.primary.active};
	}

	&:focus-visible {
		outline: 2px solid ${(props) => props.theme.colors.indicator.active};
		border-radius: ${STYLING.dimensions.radius.alt4};
	}
`;

export const ModalForm = styled.div`
	display: grid;
	gap: 12px;
	margin-bottom: 12px;
`;

export const FieldRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 10px;
`;

export const FieldLabel = styled.label`
	font-family: ${(p) => p.theme.typography.family.primary};
	font-size: ${(p) => p.theme.typography.size.small};
	color: ${(p) => p.theme.colors.font.primary};
	user-select: none;
`;

export const Info = styled.p<{ inlineAdd: boolean }>`
	font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
	font-weight: ${(props) => props.theme.typography.weight.bold} !important;
	color: ${(props) => props.theme.colors.font.alt1};
	margin: ${(props) => (props.inlineAdd ? '10.5px 0 0 0' : '12.5px 0 0 0')};
`;

export const Inline = styled.div`
	display: inline-flex;
	align-items: center;
	gap: 7.5px;

	span {
		color: ${(props) => props.theme.colors.font.alt1} !important;
		font-size: ${(props) => props.theme.typography.size.xxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;
