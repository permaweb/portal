import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	width: 100%;
	background: ${(props) => props.theme.colors.container.primary.background};
	border-radius: ${STYLING.dimensions.radius.primary};
`;

export const Header = styled.div`
	margin: 0 0 15px 0;

	h2 {
		font-size: ${(props) => props.theme.typography.size.h2};
		font-weight: ${(props) => props.theme.typography.weight.xBold};
		font-family: ${(props) => props.theme.typography.family.alt1};
		letter-spacing: 0.5px;
		color: ${(props) => props.theme.colors.font.primary};
		margin: 0;
	}
`;

export const Content = styled.div`
	display: grid;
	grid-template-columns: 1.5fr 2fr;
	gap: 20px;
	align-items: stretch;

	@media (max-width: ${STYLING.cutoffs.tablet}) {
		grid-template-columns: 1fr;
	}
`;

export const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
`;

export const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-self: stretch;
`;

export const FeaturedPost = styled.div`
	position: relative;
	overflow: hidden;
	background: ${(props) => props.theme.colors.container.alt2.background};
	transition: transform 0.2s ease;
	border-radius: ${STYLING.dimensions.radius.primary};
	height: 100%;
`;

export const PostImage = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.primary};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
	}
`;

export const PostOverlay = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 20px;
	background: linear-gradient(to top, ${(props) => props.theme.colors.overlay.primary} 0%, transparent 100%);
`;

export const PostTitle = styled.h4`
	font-size: ${(props) => props.theme.typography.size.xLg};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
	font-family: ${(props) => props.theme.typography.family.primary};
	color: ${(props) => props.theme.colors.font.primary};
	line-height: 1.75;

	& > span {
		padding: 2.5px 15px;
		background: ${(props) => props.theme.colors.container.primary.active};
		box-shadow: 0 1.5px 10px 0 ${(props) => props.theme.colors.shadow.alt1};
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
		border-radius: ${STYLING.dimensions.radius.alt3};
		white-space: break-spaces;
		display: inline;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
		line-height: 1.95;
	}
`;

export const PostCreator = styled.div`
	font-size: ${(props) => props.theme.typography.size.xSmall};
	color: ${(props) => props.theme.colors.font.alt4};
	letter-spacing: 1px;
	display: flex;
	align-items: center;
	gap: 8px;

	&::before {
		content: '';
		width: 20px;
		height: 20px;
		background: ${(props) => props.theme.colors.container.alt3.background};
		border-radius: 50%;
		flex-shrink: 0;
	}
`;

export const ListPost = styled.div`
	display: flex;
	gap: 15px;
`;

export const ListPostImage = styled.div`
	width: 80px;
	height: 80px;
	flex-shrink: 0;
	position: relative;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: ${STYLING.dimensions.radius.alt3};
		filter: brightness(0.35);
		border: 1px solid ${(props) => props.theme.colors.border.alt1};
	}
`;

export const ListPostNumber = styled.div`
	font-size: ${(props) => props.theme.typography.size.h1};
	font-weight: ${(props) => props.theme.typography.weight.bold};
	font-family: ${(props) => props.theme.typography.family.alt1};
	color: ${(props) => props.theme.colors.font.light1};
	line-height: 1;
	flex-shrink: 0;
	padding-top: 5px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

export const ListPostContent = styled.div`
	display: flex;
	gap: 12px;
	flex: 1;
	align-items: flex-start;
`;

export const ListPostInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
`;

export const ListPostTitle = styled.h4`
	font-size: ${(props) => props.theme.typography.size.base};
	font-weight: ${(props) => props.theme.typography.weight.xBold};
	font-family: ${(props) => props.theme.typography.family.primary};
	color: ${(props) => props.theme.colors.font.primary};
	margin: 0;
	line-height: 1.5;
`;

export const EmptyCategoryBlock = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 20px;
	border: 1px dashed ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.primary};
	background: ${(props) => props.theme.colors.container.primary.background};
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
