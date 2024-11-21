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

export const CategoriesAddAction = styled.div`
	button {
		position: absolute;
		top: 26.5px;
		right: 10px;
		z-index: 1;
	}
`;

export const CategoriesParentAction = styled.div`
	position: relative;
	margin: 20px 0 0 0;
`;

export const CategoriesParentSelectAction = styled.div`
	button {
		height: ${STYLING.dimensions.form.small};
		width: 100%;
		padding: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;

		svg {
			height: 16.5px;
			width: 16.5px;
			margin: 2.5px 0 0 0;
		}
	}
`;

export const ParentCategoryDropdown = styled.div`
	max-height: 35vh;
	width: 100%;
	max-width: 75vw;
	padding: 7.5px 10px;
	position: absolute;
	z-index: 2;
	top: 52.5px;
	background: ${(props) => props.theme.colors.container.alt1.background} !important;
	border-radius: ${STYLING.dimensions.radius.alt2} !important;
`;

export const ParentCategoryOptions = styled.div``;

export const ParentCategoryOption = styled.button<{ level: number }>`
	height: 35px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	pointer-events: auto;
	background: transparent;
	border-radius: ${STYLING.dimensions.radius.alt2};
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

export const CategoriesBody = styled.div`
	margin: 10px 0 0 0;
`;

export const CategoriesList = styled.ul``;

export const CategoryOption = styled.li<{ level: number }>`
	display: flex;
	align-items: center;
	gap: 7.5px;
	padding: ${(props) => `0 10px 0 ${(props.level * 10).toString()}px`} !important;
	margin: 0 0 12.5px 0;

	span {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.medium} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
	}
`;

export const WrapperEmpty = styled.div`
	padding: 0 0 10px 0;
	p {
		color: ${(props) => props.theme.colors.font.alt1};
		font-size: ${(props) => props.theme.typography.size.xxxSmall} !important;
		font-weight: ${(props) => props.theme.typography.weight.bold} !important;
		font-family: ${(props) => props.theme.typography.family.primary} !important;
		text-transform: uppercase;
	}
`;
