import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const PostWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const CategoryHeader = styled.div`
	width: 100%;
	border-top: 2px solid ${(props) => props.theme.colors.container.primary.active};

	p {
		display: block;
		width: fit-content;
		padding: 3.5px 11.5px;
		background: ${(props) => props.theme.colors.container.primary.active};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
	}
`;

export const PostContent = styled.div`
	display: flex;
	gap: 15px;
	position: relative;

	@media (max-width: ${STYLING.cutoffs.initial}) {
		flex-direction: column-reverse;
		gap: 15px;
	}
`;

export const PostImage = styled.div`
	width: 60%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.container.alt1.background};
	border-radius: ${STYLING.dimensions.radius.primary};
	aspect-ratio: 16/8;

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.primary};
		aspect-ratio: 16/9;
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;
	}
`;

export const PostInfo = styled.div`
	width: 40%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 10px;

	h1 {
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.h1};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.alt1};
		margin: 0 0 0 -25%;

		& > span {
			padding: 3.5px 20px;
			background: ${(props) => props.theme.colors.container.primary.active};
			box-shadow: 0 1.5px 10px 0 ${(props) => props.theme.colors.shadow.alt1};
			border: 1px solid ${(props) => props.theme.colors.border.alt1};
			border-radius: ${STYLING.dimensions.radius.alt3};
			white-space: break-spaces;
			display: inline;
			box-decoration-break: clone;
			-webkit-box-decoration-break: clone;
			line-height: 1.5;
		}
	}

	p {
		display: block;
		width: fit-content;
		padding: 3.5px 11.5px;
		background: ${(props) => props.theme.colors.container.primary.active};
		color: ${(props) => props.theme.colors.font.primary};
		font-size: ${(props) => props.theme.typography.size.xxxxSmall};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		font-family: ${(props) => props.theme.typography.family.primary};
		margin: 0 0 0 15px;
		box-shadow: 0 1.5px 10px 0 ${(props) => props.theme.colors.shadow.alt1};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		border-radius: ${STYLING.dimensions.radius.alt3};
	}

	@media (max-width: ${STYLING.cutoffs.initial}) {
		width: 100%;

		h1,
		p {
			margin: 0;
		}
	}
`;

export const EmptyPostBlock = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 0 15px 15px 15px;
	border: 1px dotted ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.primary.background};
`;

export const EmptyPostAction = styled.div`
	width: fit-content;
	margin: 7.5px 0 0 auto;
`;

export const FilterInput = styled.input`
	width: 100%;
	padding: 10px 12px;
	font-size: 14px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.primary};
	box-sizing: border-box;

	&::placeholder {
		color: ${(props) => props.theme.colors.font.alt1};
	}

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.button.primary.background};
	}
`;

export const Select = styled.select`
	width: 100%;
	padding: 10px 12px;
	font-size: 14px;
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.alt1.background};
	color: ${(props) => props.theme.colors.font.primary};
	cursor: pointer;

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.colors.button.primary.background};
	}
`;
